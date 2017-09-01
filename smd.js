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
     * Safe reference to undefined
     *
     * @final
     * @type {undefined}
     */
    var UNSET;

    /**
     * ID Prefix for anonymous modules
     *
     * @final
     * @type {String}
     */
    var ANON_ID_PREFIX = "_anon$";

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
    function matches(args, types) {
        if (args.length != types.length) return false;
        for (var i = 0, l = args.length; i < l; i++) {
            var p = types[i],
                t = typeof args[i];
            if (p === "any" || (p === "array" && Array.isArray(args[i]))) continue;
            if (p !== t) return false;
        }
        return true;
    }


    // ----------------------------------


    /**
     * The define function according to AMD specification. Id and dependencies parameters are optional.
     *
     *      define (  id? , dependencies?, factory ) ;
     *
     */
    function define() {
        var id, deps, factory;
        if (matches(arguments, ["any"])) {
            factory = arguments[0];
        } else if (matches(arguments, ["string", "any"])) {
            id = arguments[0];
            factory = arguments[1];
        } else if (matches(arguments, ["array", "any"])) {
            deps = arguments[0];
            factory = arguments[1];
        } else if (matches(arguments, ["string", "array", "any"])) {
            id = arguments[0];
            deps = arguments[1];
            factory = arguments[2];
        } else {
            throw new Error("Invalid arguments")
        }
        if (!id) {
            id = ANON_ID_PREFIX + idgen();
        }
        if (typeof factory !== "function") { // Direct definition: define("theMagicNumber", 7);
            var res = factory;
            factory = function() {
                return res;
            };
        }
        var module = {
            id: id,
            deps: deps,
            factory: factory,
            createdAt: new Date().getTime()
        };
        pluginsPlugin.init(module);
    }




    /**
     * Flag to enable/disable debug logging.
     *
     * @type {boolean}
     */
    define.debuggingEnabled = false;
    /**
     * Debug logging to console. Only logs if define.debug is flagged true (default=false).
     *
     * @param msg
     */
    var debug = define.debug = function debug(msg) {
        if (define.debuggingEnabled && console) {
            // interpolate % in msg with arguments[1+]
            for (var i = 1; i < arguments.length; i++) {
                msg = msg.replace('%', arguments[i]);
            }
            (console.debug ? console.debug : console.log)(msg);
        }
    };

    /**
     * Wrapper/delegate to call our registered plugins' lifecycle handlers.
     *
     * Module lifecycle:
     *      init        Initializer handler when the define statement is called
     *      load        Called when a dependency needs to be loaded, first result wins
     *      resolve     When the module is ready this function is called
     *
     *
     */
    var pluginsPlugin = {
        name: "smd-plugins-plugin",
        order: -10000000,
        plugins: [],
        /**
         * Setter method to register a plugin. The specified plugin should contain at least one of following methods:
         *
         *  order       Sorts the instance relative to the other registered plugins
         *  init        Initializer handler when the define statement is called
         *  load        Called when a dependency needs to be loaded
         *  resolve     When the module is ready this function is called
         *
         * @param plugin
         */
        register: function(plugin) {
            if (plugin.name) {
                debug("[%] Registering smd plugin '%'", this.name, plugin.name);
            }
            this.plugins.push(plugin);
            this.plugins.sort(function(a, b) { return (a["order"] || 0) - (b["order"] || 0); });
        },
        init: function(module) {
            this.plugins.forEach(function(plugin) {
                if (typeof plugin.init === "function")
                    plugin.init(module);
            });
        },
        load : function(id) {
            for (var i = 0, l = this.plugins.length; i < l; i++) {
                var plugin = this.plugins[i];
                if (typeof plugin.load !== "function") {
                    continue;
                }
                var r = plugin.load(id);
                if (r !== UNSET) {  // First result wins
                    return r;
                }
            }
            return r;
        },
        resolve: function(id, value, ms) {
            this.plugins.forEach(function(plugin) {
                if (typeof plugin.resolve === "function")
                    plugin.resolve(id, value, ms);
            });
        }
    };

    /**
     * Default plugin for initializing a module
     */
    var initializerPlugin = {
        name: "smd-initializer-plugin",
        order: -1000,
        todos: [],
        _count: {},
        retryInterval: 250,
        defaultTimeout: 2500,

        /**
         * Initializes the module by first loading dependencies. When successful the factory function will be called and
         * it's result directed to the plugins' resolve method. If the module cannot be initialized this function will
         * return false.
         *
         * @param module
         * @returns {boolean}
         */
        init: function(module) {
            if (module.initialized) {
                return true;
            }
            var c = this._count[module.id] || 0;
            c++;
            this._count[module.id] = c;
            debug("[%] Initializing module '%', dependencies: %, (re)tries=%",
                this.name, module.id, (module.deps ? "[" + module.deps.join() + "]" : "none"), c);

            module.locked = true;
            var factory = module.factory;
            var dependencies = [];
            if (module.deps) {
                for (var i = 0, l = module.deps.length; i < l; i++) {
                    var depId = module.deps[i];
                    debug("[%] Loading dependency '%'", this.name, depId);
                    var dep = pluginsPlugin.load(depId, module);
                    if (dep === UNSET) {
                        debug("[%] Failed initializing module '%', dependency '%' not ready",
                            this.name, module.id, depId);
                        // dependency is not ready, let's initialize this module later
                        module.locked = false;
                        this.todos.push(module);
                        this.startLoop();
                        return false;
                    }
                    debug("[%] Found dependency '%'", this.name, depId);
                    dependencies[i] = dep;
                }
            }
            var r = factory.apply(module, dependencies);
            var ms = new Date().getTime() - module.createdAt;
            if (r === UNSET) {
                r = null; // Maybe there is no return statement?, let's set it to something else but undefined!
            }
            debug("[%] Successfully initialized module '%'", this.name, module.id);
            pluginsPlugin.resolve(module.id, r, ms);
            module.locked = false;
            delete this._count[module.id];
            return (module.initialized = true);
        },
        startLoop: function() {
            if (this.loop) { // already working
                return;
            }
            var self = this;
            var modules = this.todos;
            this.loop = setInterval(function() {
                var now = new Date().getTime();
                for (var i = 0, l = modules.length; i < l; i++) {
                    var module = modules.shift();
                    if (!self.init(module)) {
                        var elapsed = now - module.createdAt;
                        if (elapsed > self.defaultTimeout) {
                            self.stopLoop();
                            self.onTimeout(module.id, elapsed);
                            break;
                        }
                        modules.push(module); // to the tail!
                    }
                }
                if (modules.length == 0) {
                    self.stopLoop();
                    return;
                }
            }, this.retryInterval);
        },
        /**
         * Stops the initializer loop
         */
        stopLoop: function() {
            clearInterval(this.loop); // kill loop.
            this.loop = undefined;
        },
        /**
         * When a module initialization times out this function will be called and all further processing
         * by smd.js is halted. Override this function when you want to divert default behavior.
         *
         * @param id
         * @param elapsed
         */
        onTimeout: function(id, elapsed) {
            var message = "Timed out after %1ms trying to initialize '%2', make sure your dependencies are set up correctly".replace('%1', elapsed).replace('%2', id);
            throw new Error(message);
        }
    };
    pluginsPlugin.register(initializerPlugin);

    /**
     * Default plugin for in-memory store of the resolved module's factory results
     */
    var registryPlugin = {
        name: "smd-registry-plugin",
        order: -1000,
        registry: {
            "define": define,
            "smd-plugins-plugin": pluginsPlugin,
            "smd-initializer-plugin": initializerPlugin
        },
        forget: function(id) {
            registry[id] = UNSET;
            delete registry[id];
        },
        load: function(id) {
            var r = this.registry[id];
            debug("[%] Looking up dependency '%' in registry", this.name, id);
            if (r !== UNSET) {
                return r;
            }
        },
        resolve: function (id, res) {
            if (id.indexOf(ANON_ID_PREFIX) == 0) { // let's not register anonymous results
                return;
            }
            debug("[%] Storing module '%' in registry", this.name, id);
            this.registry[id] = res;

        }
    };
    registryPlugin.registry["smd-registry-plugin"] = registryPlugin; // register self
    pluginsPlugin.register(registryPlugin);

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