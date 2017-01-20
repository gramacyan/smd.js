# smd-annotate-plugin

Allows annotating factory functions and write handlers for them. 

```
define(["smd-annotate-plugin"], function(plugin) {
    plugin.handle("@AssertNotNull", function(module_id, factory_result) {
        if (factory_result === null) {
            throw new Error("Assert error -- factory-result is null, module=" + module_id);
        }
    });
});

define(function() {
    "@AssertNotNull";
    return {};
});
```