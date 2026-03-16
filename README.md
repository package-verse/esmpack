# esmpack
ESM Pack Packer and Web Server with PostCSS and ESM Loader

# Why?
Because, there is no simple packer that just rewrites module paths. After ES6 and HTTP2, there is no need to bundle all JavaScripts into a single file. Parsing and loading entire bundle is a single threaded operation, which blocks UI rendering and also consumes very high memory.

# So what does this do?
1. Creates a single pack JS file which only has import definition of all the imports.
2. Packed file strips css and delivers separate css as combined CSS.
3. Retains ESM source code as it is except import path, import path is rewritten to fully qualified CDN url. So caching is preserved over different main module versions but same dependencies.
