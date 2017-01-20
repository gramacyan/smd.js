# smd.js

**smd.js** or `Simple Module Definition` is a module definition library implementing the
**AMD** (`Abstract Module Definition`) specification:

> define (  id? , dependencies?, factory ) ;

Compared to other AMD implementations **smd.js** aims to be small, extensible and
framework independent. Out of the box it features non-linear module definitions
and dependency management using timeouts (`smd-initializer-plugin`).

```
// Where is 'my-dependency'?
define("my-module", ["my-dependency"], function(dep) {
    dep.touch();
});
// Ah, here it is
define('my-dependency', { 
    touch: function() { /* blush response */ } 
});
```

#### Life cycle & plugins

When a module is defined it will go through a series of life-cycle phases before
being ready to use. These will be handled by the build-in plugin system. 

```
init        When a module is defined        
load        When a dependency needs to be loaded
resolve     When the module is ready
```


In fact smd.js's core features are actually plugin-ins:

```
smd-plugins-plugin          Keeps track of all plugins and delegates the module
                            to the plugins' corresponding life-cycle-method.

smd-initializer-plugin      Tries to initialize a module by first validating
                            dependencies ready-state and calling the factory method.

smd-registry-plugin         A basic in memory store/loader that keeps track of
                            all initialized modules.
```

It is deliberately chosen not to provide build-in remote script loading (using uri
locators). In it's philosophy (that smd.js's core should remain generic) we cannot 
make assumptions about the environment. However you can implement it yourself by 
using the plugins-system.

#### How-to plugins

You can create your own plugins by registering it the `smd-plugins-plugin`, consider following 

```
define('my-plugin', ['smd-plugins-plugin'], function(plugins) {
    var it = {
        init: function(module) { ... },
        load: function(id) { ... },
        resolve: function(id, value, ms) { ... }
    }
    plugins.register(it);
    return it;
});

```

Take a look at the plugins-extra directory for some actual examples:

* [smd-mapping-plugin](./plugins-extra/mapping)
* [smd-scan-plugin](./plugins-extra/scan)
* [smd-autowire-plugin](./plugins-extra/autowire)
* [smd-annotate-plugin](./plugins-extra/annotate)
