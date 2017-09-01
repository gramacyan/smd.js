/*
 * smd-annotate-plugin.js v1.0
 *
 Copyright (c) 2017 by Benny Bangels
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
// Compressed using https://jscompress.com/
!function(){"use strict";function n(n){return"\n"==n||"\t"==n||"\n"==n||" "==n}function t(t){var i,o=[],e=t.toString(),a=0,r="";if(0!=e.indexOf("function"))throw new Error("factory should be a function");for(var s,f=!1;a++<e.length;)if(i=e.charAt(a),s){if(";"!==i){if('"'===i){if(f){f=!1,o.push(r.trim()),r="";continue}f=!0,a++}if(f)r+=e.charAt(a);else if(!n(i))break}}else"{"===i&&(s=!0);return o}define("smd-annotate-plugin",["smd-plugins-plugin"],function(n){var i={name:"smd-annotate-plugin",order:-1001,_moduleAnnotationsMap:{},_handlers:{},handle:function(n,t){void 0===this._handlers[n]&&(this._handlers[n]=[]),this._handlers[n].push(t)},init:function(n){if("function"==typeof n.factory){var i=t(n.factory);i.length>0&&(define.debug("[%] Found annotations [%] in %",this.name,i,n.id),this._moduleAnnotationsMap[n.id]=i)}},resolve:function(n,t,i){if(this._moduleAnnotationsMap[n]){var o=this._handlers;this._moduleAnnotationsMap[n].forEach(function(i){var e=o[i];e&&e.length>0&&e.forEach(function(i){i(n,t)})}),delete this._moduleAnnotationsMap[n]}}};return n.register(i),i})}();