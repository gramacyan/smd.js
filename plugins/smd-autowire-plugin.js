/*
 * smd-autowire-plugin.js v1.0
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
(function() {

    "use strict";

    /**
     * This function parses parameter-names for the specified function.
     *
     *  parseParameters( function(A, B, C) { ... }); --> [ A, B, C ]
     *
     *
     * @param fn
     * @returns {Array}
     */
    function parseParameters(fn) {
        var params = [];
        var s = fn.toString(),
            i = 0,
            c, buffer = "";
        if (s.indexOf("function") != 0) {
            throw new Error("factory should be a function");
        }
        while(i++ < s.length) {
            c = s.charAt(i);
            if (c === '(' ) {
                buffer = '';
                continue;
            }
            if (c === '\n' ) { // skip newlines
                continue;
            }
            if (c === '/') { // make sure the arguments does not contains comments
                var skipUntil,
                    n = s.charAt(i+1);
                if (n === '*') { // function( myArg1 /* explanation */, ...
                    skipUntil = "*/";
                } else if (n === '/') { // function( myArg1, // explanation \n ...
                    skipUntil = "\n";
                }
                if (skipUntil) {
                    var rem = s.substring(i);
                    var cmt = rem.substring(rem, rem.indexOf(skipUntil) + skipUntil.length);
                    i = i + cmt.length - 1; // skip
                    continue;
                }
            }
            if (c === ',' || c === ')') {
                var arg = buffer;
                if (arg) {
                    params.push(arg.trim()); // making sure
                }
                buffer = '';
                if (c === ')' ) {
                    break;
                }
                continue;
            }
            buffer += s.charAt(i);
        }
        return params;
    }

    /**
     * The smd.js autowire plugin will add factory parameter(s) to the module's
     * dependency-scope if no dependency-array is specified!
     *                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
     *
     * Consider following:
     *
     *      define(function( A , B) { ... });
     *               _______|   |
     *              |          |
     *      define("A", {});  |
     *                       |
     *               --------
     *              |
     *      define("B", {});
     *
     *
     * This can only work for modules with ids only containing syntactical valid characters.
     * Take a look at the mapping-plugin if you want to to remap module-ids.
     *
     */
    define("smd-autowire-plugin", function() {
        return {
            name: "smd-autowire-plugin",
            order: -500,
            init: function(mod) {
                if (!mod.deps && typeof mod.factory === "function") {
                    var params = parseParameters(mod.factory);
                    if (params && params.length > 0) {
                        define.debug("[%] Auto-wiring [%] in %", this.name, params, mod.id);
                        mod.deps = params;
                    }
                }
            }
        };
    });

    define(["smd-autowire-plugin"], function(plugin) {
        define.plugin(plugin);
    });

})();