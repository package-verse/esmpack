# esmpack
ESM Pack Packer and Web Server with PostCSS and ESM Loader

# Why?
Because, there is no simple packer that just generates module paths. After ES6 and HTTP2, there is no need to bundle all JavaScripts into a single file. Parsing and loading entire bundle is a single threaded operation, which blocks UI rendering and also consumes very high memory.

# So what does this do?
1. Creates a single pack JS file which only has import definition of all the imports.
2. Import map contains inline JavaScript module via data url to inject CSS link into document.


## Dev Packer

1. Development time packer will generate HTML file along with the import map and inline script to host the module.
2. Dev Packer will generate `let cs = document.currentScript;import("imported-path").then((r) => ESMPack.render(r, cs))` script inside html for every JS's corresponding html.
3. Library author must implement `ESMPack.render` method which will accept exports from imported method and `currentScript`.

## Release Packer

1. `pack.js` will generate a single JS file that will inject import map into document and it will call `ESMPack.render` method with import. 