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
!function(e){"use strict";function i(){function e(){return Math.floor(65536*(1+Math.random())).toString(16).substring(1)}return e()+e()}function n(e,i){if(e.length!=i.length)return!1;for(var n=0,t=e.length;n<t;n++){var r=i[n],o=typeof e[n];if(!("any"===r||"array"===r&&Array.isArray(e[n]))&&r!==o)return!1}return!0}function t(){var e,t,o;if(n(arguments,["any"]))o=arguments[0];else if(n(arguments,["string","any"]))e=arguments[0],o=arguments[1];else if(n(arguments,["array","any"]))t=arguments[0],o=arguments[1];else{if(!n(arguments,["string","array","any"]))throw new Error("Invalid arguments");e=arguments[0],t=arguments[1],o=arguments[2]}if(e||(e=r+i()),"function"!=typeof o){var s=o;o=function(){return s}}var d={id:e,deps:t,factory:o,createdAt:(new Date).getTime()};a.init(d)}var r="_anon$";t.amd={variant:"smd",version:"1.0"},t.debuggingEnabled=!1;var o=!1,s=t.debug=function(e){if(t.debuggingEnabled&&console){o||(console.debug("                    _   _     \n                   | | (_)    \n  ___ _ __ ___   __| |  _ ___ \n / __| '_ ` _ \\ / _` | | / __|\n \\__ \\ | | | | | (_| |_| \\__ \\\n |___/_| |_| |_|\\__,_(_) |___/\n                      _/ |    \n                     |__/     \n -----------------------------\n"),o=!0);for(var i=1;i<arguments.length;i++)e=e.replace("%",arguments[i]);(console.debug?console.debug:console.log)(e)}},a={name:"smd-plugins-plugin",order:-1e7,plugins:[],register:function(e){e.name&&s("[%] Registering smd plugin '%'",this.name,e.name),this.plugins.push(e),this.plugins.sort(function(e,i){return(e.order||0)-(i.order||0)})},init:function(e){this.plugins.forEach(function(i){"function"==typeof i.init&&i.init(e)})},load:function(e){for(var i=0,n=this.plugins.length;i<n;i++){var t=this.plugins[i];if("function"==typeof t.load){var r=t.load(e);if(void 0!==r)return r}}return r},resolve:function(e,i,n){this.plugins.forEach(function(t){"function"==typeof t.resolve&&t.resolve(e,i,n)})}},d={name:"smd-initializer-plugin",order:-1e3,todos:[],_count:{},retryInterval:250,defaultTimeout:2500,init:function(e){e.initialized||this.tryInitialize(e)},tryInitialize:function(e){if(e.initialized)return!0;if(e.locked)return!1;var i=this._count[e.id]||0;i++,this._count[e.id]=i,s("[%] Initializing module '%', dependencies: %, (re)tries=%",this.name,e.id,e.deps?"["+e.deps.join()+"]":"none",i),e.locked=!0;var n=e.factory,t=[];if(e.deps)for(var r=0,o=e.deps.length;r<o;r++){var d=e.deps[r];s("[%] Loading dependency '%'",this.name,d);var l=a.load(d,e);if(void 0===l)return s("[%] Failed initializing module '%', dependency '%' not ready",this.name,e.id,d),e.locked=!1,this.todos.push(e),this.startLoop(),!1;s("[%] Found dependency '%'",this.name,d),t[r]=l}var u=n.apply(e,t),f=(new Date).getTime()-e.createdAt;return void 0===u&&(u=null),s("[%] Successfully initialized module '%'",this.name,e.id),a.resolve(e.id,u,f),e.locked=!1,delete this._count[e.id],e.initialized=!0},startLoop:function(){if(!this.loop){var e=this,i=this.todos;this.loop=setInterval(function(){for(var n=(new Date).getTime(),t=0,r=i.length;t<r;t++){var o=i.shift();if(!e.tryInitialize(o)){var s=n-o.createdAt;if(s>e.defaultTimeout){e.stopLoop(),e.onTimeout(o.id,s);break}i.push(o)}}0!=i.length||e.stopLoop()},this.retryInterval)}},stopLoop:function(){clearInterval(this.loop),this.loop=void 0},onTimeout:function(e,i){var n="Timed out after %1ms trying to initialize '%2', make sure your dependencies are set up correctly".replace("%1",i).replace("%2",e);throw new Error(n)}};a.register(d);var l={name:"smd-registry-plugin",order:-1e3,registry:{define:t,"smd-plugins-plugin":a,"smd-initializer-plugin":d},forget:function(e){registry[e]=void 0,delete registry[e]},load:function(e){var i=this.registry[e];if(s("[%] Looking up dependency '%' in registry",this.name,e),void 0!==i)return i},resolve:function(e,i){0!=e.indexOf(r)&&(s("[%] Storing module '%' in registry",this.name,e),this.registry[e]=i)}};if(l.registry["smd-registry-plugin"]=l,a.register(l),"object"==typeof module&&module.exports)module.exports=t;else{if("function"==typeof e.define&&e.define.amd)throw new Error("smd.js is not compatible with another AMD implementation");e.define=t}}(this);