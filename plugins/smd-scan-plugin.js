/*
 * smd-scan-plugin.js v1.0
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
     * The smd-scan-plugin tries to load specified dependency-id(s) from the global-scope.
     *
     * This can come in handy when waiting for 3rd-party libraries (1) (using script-appending) or
     * await ready-state locks (2).
     *
     * For example:
     *
     *      define(["jQuery"], function() { ... }); (1)
     *
     *      define(["lock"], function() { .., });  (2)
     *      window.onload = function() {
     *          window.lock = "unlocked";
     *      }
     *
     */
    define("smd-scan-plugin", function() {

        return {
            name: "smd-scan-plugin",
            order: 0,
            load: function(id) {
                define.debug("[%] Looking up dependency '%'", this.name, id);
                if (root[id]) {
                    return root[id];
                }
            }
        };
    });

    define(["smd-scan-plugin"], function(plugin) {
        define.plugin(plugin);
    });

})(this);