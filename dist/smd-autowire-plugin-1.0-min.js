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
// Compressed using https://jscompress.com/
!function(){"use strict";function n(n){var i,t=[],r=n.toString(),e=0,f="";if(0!=r.indexOf("function"))throw new Error("factory should be a function");for(;e++<r.length;)if("("!==(i=r.charAt(e))){if("\n"!==i){if("/"===i){var u,o=r.charAt(e+1);if("*"===o?u="*/":"/"===o&&(u="\n"),u){var a=r.substring(e);e=e+a.substring(a,a.indexOf(u)+u.length).length-1;continue}}if(","!==i&&")"!==i)f+=r.charAt(e);else{var s=f;if(s&&t.push(s.trim()),f="",")"===i)break}}}else f="";return t}define("smd-autowire-plugin",["smd-plugins-plugin"],function(i){var t={name:"smd-autowire-plugin",order:-1001,init:function(i){if(!i.deps&&"function"==typeof i.factory){var t=n(i.factory);t&&t.length>0&&(define.debug("[%] Auto-wiring [%] in %",this.name,t,i.id),i.deps=t)}}};return i.register(t),t})}();