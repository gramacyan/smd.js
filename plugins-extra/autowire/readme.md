# smd-autowire-plugin

Autowires dependencies by inspecting the factory parameters.

```
define("myModule", {
    name: "My module"
});

define(function(myModule) {
    console.log(myModule.name);
});

```