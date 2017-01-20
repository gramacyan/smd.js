# smd-annotate-plugin

Allows annotating factory functions and write handlers for them. 

```
define(["smd-annotate-plugin"], function(plugin) {
    plugin.handle("@AssertNotNull", function(module_id, factory_result) {
        assert(factory_result !== null);
    });
});

define(function() {
    "@AssertNotNull";
    return {};
});
```