/*
 * smd-mapping-plugin.js v1.0
 *
 Copyright (c) 2016 by Benny Bangels
 https://github.com/gramacyan/smd.js

 Permission is hereby granted, free of charge, to any person obtaining a copy of
 this software and associated documentation files (the "Software"), to deal in
 the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 of the Software, and to permit persons to whom the Software is furnished to do
 so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

(function(root) {

    "use strict";

    /**
     * The mapping plugin maps one module-id to another.
     * Esp. practical when using the autowire plugin, making the identifier syntax safe.
     *
     *      define("Hello World - Version 1.0", function() {
     *          return "Hello World";
     *      });
     *
     *      define(["smd-mapping-plugin"], function(plugin) {
     *          plugin.map("Hello World - Version 1.0", "helloMod");
     *      });
     *
     *      define(["helloMod"], function(helloMod) { ... });
     *
     */

    // todo check if we need to allow wildcard mapping:
    // plugin.map("module v1.*", "module1");

    define("smd-mapping-plugin", ["smd-registry-plugin"], function(registryPlugin) {

        return {
            name: "smd-mapping-plugin",
            order: -1000,
            mapping: {},
            map: function(a, b) {
                define.debug("[%] Mapped % <-> %", this.name, a, b);
                this.mapping[a] = b;
                this.mapping[b] = a;
                // check if the module (a) was already resolved
                var v = registryPlugin.registry[a];
                if (typeof v !== "undefined") {
                    // let's also assign the value it to the mapping target (b)
                    registryPlugin.registry[b] = v;
                }
            },
            // mapped loading
            load: function(id) {
                var mapped;
                if (mapped = this.mapping[id]) {
                    var r = registryPlugin.registry[mapped];
                    if (r !== undefined) {
                        return r;
                    }
                }
            },
            // mapped assignment
            resolve: function(id, val) {
                var mapped = this.mapping[id];
                if (mapped) {
                    registryPlugin.registry[mapped] = val;
                }
            }
        };
    });

    define(["smd-mapping-plugin"], function(plugin) {
        define.plugin(plugin);
    });

})(this);