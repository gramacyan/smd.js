# smd-mapping-plugin

Maps a module identifier to another.   
This allows using very verbose IDs in your module definition, remapping it to something more usable.

```
define("MyModule version-1.0", function() {
    ...
});

// Let's map
define(["smd-mapping-plugin"], function(plugin) {
    plugin.map("MyModule version-1.0", "MyModule");
});

// And use
define(["MyModule"], function(myModule) {
    console.log("Tadaaaa!");
});


```