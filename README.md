# esmpack
ESM Pack Packer and Web Server with PostCSS and ESM Loader

# Why?
Because, there is no simple packer that just rewrites module paths. After ES6 and HTTP2, there is no need to bundle all JavaScripts into a single file. Parsing and loading entire bundle is a single threaded operation, which blocks UI rendering and also consumes very high memory.

# So what does this do?
1. Creates a single pack JS file which only has import definition of all the imports.
2. Packed file strips css and delivers separate css as combined CSS.
3. Retains ESM source code as it is except import path, import path is rewritten to fully qualified CDN url. So caching is preserved over different main module versions but same dependencies.


## Dev Packer

1. Development time packer will generate HTML file along with the pack that will generate import maps along with the loading of control and hosting it.
2. Dev Packer will generate `let cs = document.currentScript;import("imported-path").then((r) => ESMPack.render(r, cs))` script inside html for every JS's corresponding html.
3. Library author must implement `ESMPack.render` method which will accept exports from imported method and `currentScript`.
4. Every `js` file's imports will be changed to fully qualified references for external imports.

## Release Packer

1. A single script with `.pack.js` will be generated that will import every nested imports along with fully qualified path for every nested imported external references.
2. Every `js` file's imports will be changed to fully qualified references for external imports.