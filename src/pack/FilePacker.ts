import path from "path";
import { Babel } from "../parser/babel.js";
import packageMap, { IPackageMap } from "./packageMap.js";

/**
 * File Packer must do following tasks...
 * 1. Create import-map based on the package.json
 * 2. Replace all non js imports ...
 *
 * For App.js following packed scripts will be generated.
 * 1. App.packed.js <-- a packed module referencing all modules
 * 2. App.loader.js <-- a loader JS that will add import map and it will load `App.packed.js` with
 *    import.
 */
export default class FilePacker {

    readonly absoluteSrc: string;

    modules: IPackageMap;

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
        this.modules = await packageMap(this.root);

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