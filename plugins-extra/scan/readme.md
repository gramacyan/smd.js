# smd-scan-plugin

This is a loader plugin that scans the global scope for dependencies.

```
define(["jQuery"], function(jQuery) {
    jQuery("html body");
});
```