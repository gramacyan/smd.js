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

    function isWhitespace(c) {
        return c == '\n' || c == '\t' || c == '\n' || c == ' ';
    };

    /**
     * This function parses the annotation(s) from a factory function
     *
     *      function() {
     *          "Loggable";
     *      }
     *
     * @param fn
     * @returns {Array}
     */
    function parseAnnotations(fn) {
        var annotations = [];
        var s = fn.toString(),
            i = 0,
            c, buffer = "";
        if (s.indexOf("function") != 0) {
            throw new Error("factory should be a function");
        }
        var inbody, inannot = false;
        while(i++ < s.length) {
            c = s.charAt(i);
            if (!inbody) { // read until we are in block-stmt
                if (c === '{' ) {
                    inbody = true;
                }
                continue;
            }
            if (c === ';') {
                continue;
            }
            if (c === '"') {
                if (!inannot) {
                    inannot = true;
                    i++; // add correct char to buffer
                } else {
                    inannot = false;
                    annotations.push(buffer.trim());
                    buffer = "";
                    continue;
                }
            }
            if (inannot) {
                buffer += s.charAt(i);
            } else {
                if (!isWhitespace(c)) {
                    break;
                }
            }
        }
        return annotations;
    }

    /**
     *
     */
    define("smd-annotate-plugin", ["smd-plugins-plugin"], function(plugins) {
        var plugin =  {
            name: "smd-annotate-plugin",
            order: -1001,
            _moduleAnnotationsMap: {/* < module-id, [annotations > */},
            _handlers: {},
            handle: function(annotation, handler) {
                if (typeof this._handlers[annotation] === "undefined") {
                    this._handlers[annotation] = [];
                }
                this._handlers[annotation].push(handler);
            },
            init: function(mod) {
                if (typeof mod.factory !== "function")
                    return;
                var annotations = parseAnnotations(mod.factory);
                if (annotations.length > 0) {
                    define.debug("[%] Found annotations [%] in %", this.name, annotations, mod.id);
                    this._moduleAnnotationsMap[mod.id] = annotations;
                }
            },
            resolve: function(id, value, ms) {
                if (!this._moduleAnnotationsMap[id]) return;
                var handlers = this._handlers;
                this._moduleAnnotationsMap[id].forEach(function(annotation) {
                    var fns = handlers[annotation];
                    if (fns && fns.length > 0) {
                        fns.forEach(function(handler) {
                            handler(id, value);
                        });
                    }
                });
                delete this._moduleAnnotationsMap[id];
            }
        };
        plugins.register(plugin);
        return plugin;
    });

})();