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
// Compressed using https://jscompress.com/
!function(i){"use strict";define("smd-mapping-plugin",["smd-plugins-plugin","smd-registry-plugin"],function(i,n){var r={name:"smd-mapping-plugin",order:-1001,_mapping:{},map:function(i,r){define.debug("[%] Mapped % <-> %",this.name,i,r),this._mapping[i]=r,this._mapping[r]=i;var p=n.registry[i];void 0!==p&&(n.registry[r]=p)},load:function(i){var r;if(r=this._mapping[i]){var p=n.registry[r];if(void 0!==p)return p}},resolve:function(i,r){var p=this._mapping[i];p&&(n.registry[p]=r)}};return i.register(r),r})}();