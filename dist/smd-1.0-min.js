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
// Compressed using https://jscompress.com/
!function(a){"use strict";function c(){function a(){return Math.floor(65536*(1+Math.random())).toString(16).substring(1)}return a()+a()}function d(a,b){if(a.length!=b.length)return!1;for(var c=0,d=a.length;c<d;c++){var e=b[c],f=typeof a[c];if(!("any"===e||"array"===e&&Array.isArray(a[c]))&&e!==f)return!1}return!0}function e(){var a,b,e;if(d(arguments,["any"]))e=arguments[0];else if(d(arguments,["string","any"]))a=arguments[0],e=arguments[1];else if(d(arguments,["array","any"]))b=arguments[0],e=arguments[1];else{if(!d(arguments,["string","array","any"]))throw new Error("Invalid arguments");a=arguments[0],b=arguments[1],e=arguments[2]}if(a||(a="_anon$"+c()),"function"!=typeof e){var f=e;e=function(){return f}}var h={id:a,deps:b,factory:e,createdAt:(new Date).getTime()};g.init(h)}var b;e.debuggingEnabled=!1;var f=e.debug=function(b){if(e.debuggingEnabled&&console){for(var c=1;c<arguments.length;c++)b=b.replace("%",arguments[c]);(console.debug?console.debug:console.log)(b)}},g={name:"smd-plugins-plugin",order:-1e7,plugins:[],register:function(a){a.name&&f("[smd-plugins-plugin] Registering smd plugin '%'",a.name),this.plugins.push(a),this.plugins.sort(function(a,b){return(a.order?a.order:0)-(b.order?b.order:0)})},init:function(a){this.plugins.forEach(function(b){"function"==typeof b.init&&b.init(a)})},load:function(a){for(var c=0,d=this.plugins.length;c<d;c++){var e=this.plugins[c];if("function"==typeof e.load){var f=e.load(a);if(f!==b)return f}}return f},resolve:function(a,b,c){this.plugins.forEach(function(d){"function"==typeof d.resolve&&d.resolve(a,b,c)})}},h={name:"smd-initializer-plugin",order:-1e3,todos:[],_count:{},retryInterval:250,defaultTimeout:2500,init:function(a){this.tryInitialize(a)},tryInitialize:function(a){if(a.initialized)return!0;var c=this._count[a.id];c||(c=0),c++,this._count[a.id]=c,f("[%] Initializing module '%', dependencies: %, (re)tries=%",this.name,a.id,a.deps?"["+a.deps.join()+"]":"none",c),a.locked=!0;var d=a.factory,e=[];if(a.deps)for(var h=0,i=a.deps.length;h<i;h++){var j=a.deps[h];f("[%] Loading dependency '%'",this.name,j);var k=g.load(j,a);if(k===b)return f("[%] Failed initializing module '%', dependency '%' not ready",this.name,a.id,j),a.locked=!1,this.todos.push(a),this.startLoop(),!1;f("[%] Found dependency '%'",this.name,j),e[h]=k}var l=d.apply(a,e),m=(new Date).getTime()-a.createdAt;return l===b&&(l=null),f("[%] Successfully initialized module '%'",this.name,a.id),g.resolve(a.id,l,m),a.locked=!1,delete this._count[a.id],a.initialized=!0},startLoop:function(){if(!this.loop){var a=this,b=this.todos;this.loop=setInterval(function(){for(var c=(new Date).getTime(),d=0,e=b.length;d<e;d++){var f=b.shift();if(!a.tryInitialize(f)){var g=c-f.createdAt;if(g>a.defaultTimeout){a.stopLoop(),a.onTimeout(f.id,g);break}b.push(f)}}if(0==b.length)return void a.stopLoop()},this.retryInterval)}},stopLoop:function(){clearInterval(this.loop),this.loop=void 0},onTimeout:function(a,b){var c="Timed out after %1ms trying to initialize '%2', make sure your dependencies are set up correctly".replace("%1",b).replace("%2",a);throw new Error(c)}};g.register(h);var i={name:"smd-registry-plugin",order:-1e3,registry:{define:e,"smd-plugins-plugin":g,"smd-initializer-plugin":h},forget:function(a){registry[a]=b,delete registry[a]},load:function(a){var c=this.registry[a];if(f("[%] Looking up dependency '%' in registry",this.name,a),c!==b)return c},resolve:function(a,b){0!=a.indexOf("_anon$")&&(f("[%] Storing module '%' in registry",this.name,a),this.registry[a]=b)}};if(i.registry["smd-registry-plugin"]=i,g.register(i),"object"==typeof module&&module.exports)module.exports=e;else{if("function"==typeof a.define&&a.define.amd)throw new Error("smd.js is not compatible with another AMD loader");a.define=e}}(this);