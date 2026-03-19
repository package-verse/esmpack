import path from "path";
import { Babel } from "../parser/babel.js";
import moduleImports, { IModuleImports } from "./ModuleImports.js";

/**
 * File Packer must do following tasks...
 * 1. Visit every JavaScript file
 * 2. Change all imports, redirect CSS imports as css.js file that will include CSS on the page ...
 * 3. Create .pack.js with all nested imports if file imports `@web-atoms/core/dist/Pack`
 * 4. Packed file must set all css as installed. And other modules will simply return absolute paths.
 *
 * For App.js following packed scripts will be generated.
 * 1. App.pack.js
 *      Push Import Maps script tag
 *      Add import map for non js modules as well, and for this
 *         every nested dependency must be inspected.
 *         Json module should load json via hashed-dependency
 *         Image module should load path of module via hashed-dependency
 *         CSS module should inject full path to the browser 
 *      Push empty module for CSS
 *      Imports all nested dependencies of App.js that should not contain fully qualified path
 *      Import dynamically loaded modules as well
 *      Imports App.js dynamically so CSS can be ready before hosting the User interface
 * 2. App.pack.global.css
 * 3. App.pack.local.css
 * 4. App.pack.{hash-of-absolute-module-path}.js <-- this will be a dependency for non js module such as image or json etc.
 *      This will load an absolute path via resolve
 */
export default class FilePacker {

    readonly absoluteSrc: string;

    modules: IModuleImports;

    readonly cssImports = [];

    readonly jsonImports = [];

    readonly pathImports = [];

    constructor(
        public readonly root: string,
        public readonly src: string,
        public readonly prefix: string
    ) {
        // empty
        // let us make src relative to the root if an absolute path was supplied
        if (path.isAbsolute(this.src)) {
            this.src = path.relative(this.root, this.src);
        }
        this.absoluteSrc = path.resolve(this.root, this.src);
    }

    async pack() {

        // resolve package.json
        this.modules = await moduleImports(this.root);

        const resolve = (url, sourceFile) => this.resolve(url, sourceFile);

        // we don't need the code
        await Babel.transformAsync({
            file: path.join(this.root, this.src),
            resolve,
            dynamicResolve: resolve
        });


    }

    resolve(url: string, sourceFile: string) {

        const moduleUrl = this.moduleUrl(url, sourceFile);

        if (url.endsWith(".css")) {
            this.cssImports.push(moduleUrl);
            return url;
        }
        if (url.endsWith(".json")) {
            this.jsonImports.push(moduleUrl);
            return url;
        }

        if (!url.endsWith(".js")) {

        }
        return url;
    }

    moduleUrl(url: string, sourceFile: string) {



        return url;
    }
}