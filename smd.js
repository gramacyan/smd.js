/*
 * smd.js v1.0 - Simple Module Definition
 *

 Copyright (c) 2016 by Benny Bangels
 https://github.com/gramacyan/smd.js

 Permission is hereby granted, free of charge, to any person
 obtaining a copy of this software and associated documentation
 files (the "Software"), to deal in the Software without
 restriction, including without limitation the rights to use,
 copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following
 conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 OTHER DEALINGS IN THE SOFTWARE.

*/

(function(root) {

    "use strict";

    /**
     * --
     * smd.js or Simple Module Definition is a module definition library implementing the
     * AMD (Abstract Module Definition) specification:
     *
     *      define (  id? , dependencies?, factory ) ;
     *
     *
     * Compared to other AMD implementations smd.js tries to be small and framework
     * independent. Out of the box it features non-linear module definitions and
     * dependency management using timeouts. It does not feature loader support.
     *
     *      define ( "module" , [ "dependency" ], function(dep) {
     *          dep.touch();
     *      } )
     *      define ( "dependency" , function() { ... } );
     *
     *
     * smd.js deliberately chose not to provide build-in file-based or remote script
     * loading (using uri locators). There already are existing libraries for that, but
     * more importantly, build tools like file-concatenation do not play well with uri
     * dependencies.
     *
     * Consider following:
     *
     *  src/myApp.js
     *      define ( "myApp" , [ "./other/myDep.js" ], function(dep) { ... } );
     *
     *  src/other/myDep.js
     *      define ( "myDep" , function(dep) { ... } );
     *
     *  build/concatenated.js
     *      define ( "myDep" , function(dep) { ... } );
     *      define ( "myApp" , [ "./other/myDep.js" ], function(dep) { ... } );
     *
     *
     * In the plugins directory you'll find some developer add-ons. However they may not be
     * fully compatible with some environments and/or build tools. So use with caution.
     *
     * --
     *
     * Terminology:
     *
     *  Module: essentially the combination of parameters provided to the define statement
     *          existing out of an id, dependency-array and a factory method (or immediate
     *          assignment).
     *
     *  Plugin: user defined behavior of a module's lifecycle. Existing out of
     *          initialization, dependency-loading, and ready-state handling.
     *
     *  Looping: awaiting the ready state of a dependency. Since smd.js allows non-linear
     *          module definition it has to wait until a resource becomes available.
     *
     *
     * --
     * @since 1.0
     */

    /**
     * Overwrite-safe reference to undefined
     *
     * @final
     * @type {undefined}
     */
    var UNSET;

    /**
     * This array hold our modules that are queued for initialization.
     */
    var _modules = [];

    /**
     * An ordered array of self & user defined plugins.
     */
    var _plugins = [];

    /**
     * Reference to our loop/interval instance.
     */
    var _loop;


    /**
     * A string generator used for generating ids for anonymous declared modules.
     *
     * @returns {string}
     */
    function idgen() {
        function rnd() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return rnd() + rnd();
    }

    /**
     * Matches the specified arguments with a type-array and return false when the size does
     * not match or any of the argument types do not correspond with the specified type-array.
     *
     * Matching types: object, function, string, number, array, any*
     *
     * @param args
     * @param types
     * @returns {boolean}
     */
    function argsmatch(args, types) {
        if (args.length != types.length) return false;
        for (var i = 0, l = args.length; i < l; i++) {
            var p = types[i],
                t = typeof args[i];
            if (p === "any" || (p === "array" && Array.isArray(args[i]))) continue;
            if (p !== t) return false;
        }
        return true;
    }

    /**
     * Debug logging to console. Only logs if define.debug is flagged true (default=false).
     *
     * @param msg
     */
    function debug(msg) {
        if (define.debuggingEnabled && console) {
            // interpolate % in msg with arguments[1+]
            for (var i = 1; i < arguments.length; i++) {
                msg = msg.replace('%', arguments[i]);
            }
            (console.debug ? console.debug : console.log)(msg);
        }
    }

    /**
     * The define function according to AMD specification. Id and dependencies parameters are optional.
     *
     *      define (  id? , dependencies?, factory ) ;
     *
     */
    function define() {
        var id, deps, factory;
        if (argsmatch(arguments, ["any"])) {
            factory = arguments[0];
        } else if (argsmatch(arguments, ["string", "any"])) {
            id = arguments[0];
            factory = arguments[1];
        } else if (argsmatch(arguments, ["array", "any"])) {
            deps = arguments[0];
            factory = arguments[1];
        } else if (argsmatch(arguments, ["string", "array", "any"])) {
            id = arguments[0];
            deps = arguments[1];
            factory = arguments[2];
        } else {
            throw new Error("Invalid arguments")
        }
        if (!id) {
            id = "_anon$" + idgen();
        }
        if (typeof factory !== "function") { // Direct definition: define("theMagicNumber", 7);
            if (!deps) { // no dependencies, we can immediately resolve
                PLUGINS.resolve(id, factory);
                return;
            }
            else { // wait for the dependencies before resolving by wrapping the result in a factory function
                var r = factory;
                factory = function() {
                    return r;
                }
            }
        }
        var module = {
            id: id,
            deps: deps,
            factory: factory,
            createdAt: new Date().getTime()
        };
        PLUGINS.init(module);
        _modules.push(module);
        tryInitialize(module);
    }

    /**
     * When a module initialization times out this function will be called and all further processing
     * by smd.js is halted. Override this function when you want to divert default behavior.
     *
     * @param id
     * @param elapsed
     */
    define.onTimeout = function(id, elapsed) {
        var message = "Timed out after %1ms trying to initialize '%2', make sure your dependencies are set up correctly".replace('%1', elapsed).replace('%2', id);
        throw new Error(message);
    };

    /**
     * Default timeout before onTimeout is called.
     *
     * @type {number}
     */
    define.defaultTimeout = 2500;


    /**
     * Flag to enable/disable debug logging.
     *
     * @type {boolean}
     */
    define.debuggingEnabled = false;
    define.debug = debug;


    /**
     * Initializes the module by first loading dependencies. When successful the factory function will be called and
     * it's result directed to the plugins' resolve method. If the module cannot be initialized this function will
     * return false.
     *
     * @param module
     * @returns {boolean}
     */
    function tryInitialize(module) {
        if (module.initialized) {
            return true;
        }
        module.locked = true;
        var factory = module.factory;
        var dependencies = [];
        if (module.deps) {
            for (var i = 0, l = module.deps.length; i < l; i++) {
                var dep = PLUGINS.load(module.deps[i], module);
                if (dep === UNSET) {
                    module.locked = false;
                    startLoop();
                    return false; // abort! We'll initialize later when the dep is ready
                }
                dependencies[i] = dep;
            };
        }
        var r = factory.apply(module, dependencies);
        var ms = new Date().getTime() - module.createdAt;
        if (r === UNSET) {
            r = null; // Maybe there is no return statement?, let's set it to something else but undefined!
        }
        if (module.id) {
            PLUGINS.resolve(module.id, r, ms);
        }
        module.locked = false;
        return (module.initialized = true);
    }

    /**
     * Start recursively handling our modules queue, automatically stopping if the queue is empty or a
     * module's timeout is reached (calling the onTimeout handler).
     */
    function startLoop() {
        if (_loop) { // already working
            return;
        }
        var fn = function() {
            var now = new Date().getTime();
            for (var i = 0, l = _modules.length; i < l; i++) {
                var module = _modules.shift();
                if (!tryInitialize(module)) {
                    var elapsed = now - module.createdAt;
                    if (elapsed > define.defaultTimeout) {
                        stopLoop();
                        define.onTimeout(module.id, elapsed);
                        break;
                    }
                    _modules.push(module); // to the tail!
                }
            }
            if (_modules.length == 0) {
                stopLoop();
                return;
            }
        };
        _loop = setInterval(fn, 250);
    }

    /**
     * Stops the initializer loop
     */
    function stopLoop() {
        clearInterval(_loop); // kill loop.
        _loop = undefined;
    }

    /**
     * Wrapper/delegate to call our registered plugins' lifecycle handlers.
     *
     * Module lifecycle:
     *      init        Initializer handler when the define statement is called
     *      load        Called when a dependency needs to be loaded, first result wins
     *      resolve     When the module is ready this function is called
     *
     *
     * @type {{init: PLUGINS.init, load: PLUGINS.load, resolve: PLUGINS.resolve}}
     */
    var PLUGINS = {
        _count: {},
        init: function(module) {
            debug("[smd-core] Initializing module '%', dependencies: %",
                module.id, (module.deps ? "[" + module.deps.join() + "]" : "none"));
            _plugins.forEach(function(plugin) {
                if (typeof plugin.init === "function")
                    plugin.init(module);
            });
        },
        load : function(id) {
            var c = this._count[id];
            if (!c) c = 0;
            c++;
            debug("[smd-core] Loading dependency '%', retries=%", id, c);
            for (var i = 0, l = _plugins.length; i < l; i++) {
                var plugin = _plugins[i];
                if (typeof plugin.load !== "function") {
                    continue;
                }
                var r = plugin.load(id);
                if (r !== UNSET) {  // First result wins
                    debug("[smd-core] Found dependency '%'", id);
                    delete this._count[id];
                    return r;
                }
            }
            this._count[id] = c;
            return r;
        },
        resolve: function(id, value, ms) {
            debug("[smd-core] Resolved module '%' in %ms", id, ms);
            _plugins.forEach(function(plugin) {
                if (typeof plugin.resolve === "function")
                    plugin.resolve(id, value, ms); });
        }
    };

    /**
     * Setter method to register a plugin. The plugin specified should contain following fields:
     *
     *  order       Sorts the instance relative to the other registered plugins
     *  init        Initializer handler when the define statement is called
     *  load        Called when a dependency needs to be loaded
     *  resolve     When the module is ready this function is called
     *
     * @param plugin
     */
    define.plugin = function(plugin) {
        if (plugin.name) {
            debug("[smd-core] Attaching smd plugin '%'", plugin.name);
        }
        _plugins.push(plugin);
        _plugins.sort(function(a, b) {
            return (a["order"] ? a["order"] : 0)
                - (b["order"] ? b["order"] : 0);
        });
    };

    /**
     * Default plugin for in-memory store of the resolved results/modules
     */
    var registryPlugin = {
        name: "smd-registry-plugin",
        order: -1000,
        registry: {
            "define": define
        },
        forget: function(id) {
            registry[id] = UNSET;
            delete registry[id];
        },
        init: function(mod) {},
        load: function(id) {
            var r = this.registry[id];
            debug("[%] Looking up dependency '%' in registry", this.name, id);
            if (typeof r !== 'undefined') {
                return r;
            }
        },
        resolve: function (id, res) {
            if (id.indexOf("_anon$") == 0) { // let's not register anonymous results
                return;
            }
            debug("[%] Storing module '%' in registry", this.name, id);
            this.registry[id] = res;

        }
    };
    registryPlugin.registry["smd-registry-plugin"] = registryPlugin; // register self
    define.plugin(registryPlugin); // add to plugins

    /**
     * smd-logger
     */
    define("smd-logger", function() {
        return {
            debug: debug
        }
    });

    // ------------------------------------------------------------------------
    // EXPORT
    if (typeof module === "object" && module.exports){
        // for common js
        module.exports = define;
    } else {
        // for browsers
        if (typeof root['define'] === 'function' && root['define'].amd) {
            throw new Error("smd.js is not compatible with another AMD loader");
        }
        root['define'] = define;
    }

})(this);