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
// Compressed using https://jscompress.com/
!function(n){"use strict";define("smd-scan-plugin",["smd-plugins-plugin"],function(e){var i={name:"smd-scan-plugin",order:0,load:function(e){if(define.debug("[%] Looking up dependency '%'",this.name,e),n[e])return define.debug("[%] Found dependency '%'",this.name,e),n[e]}};return e.register(i),i})}(this);