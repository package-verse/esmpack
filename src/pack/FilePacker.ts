import path from "path";
import { Babel } from "../parser/babel.js";
import { packageInfo } from "../serve/send/packageInfo.js";
import TaskManager from "../core/TaskManager.js";

/**
 * File Packer must do following tasks...
 * 1. Create import-map based on the package.json
 * 2. Replace all non js imports ...
 *
 * For App.js following packed scripts will be generated.
 * 1. App.pack.js will be generated
 * 2. This will install import-map
 * 3. Import map must add fully qualified url with version
 * 3. And it will add module preloader
 * 4. And it will load fully qualified App.js
 */
export default class FilePacker {

    imports = [];

    done = new Set();

    tm = new TaskManager();

    constructor(
        public readonly root: string,
        public readonly resolve: (url: string, sourceFile?: string) => string,
    ) {
    }

    async pack({
        file,
        root = this.root,
        packageName = packageInfo.name,
        moduleUrl = packageName + "/" + path.relative(root, file).replaceAll("\\", "/")
    }) {

        if (!this.done.has(moduleUrl)) {
            this.imports.push(moduleUrl);
        }
        this.done.add(moduleUrl);

        const fileDir = path.dirname(file);

        const resolve = (url: string , sourceFile: string) => {
            if (!url.endsWith(".js")) {
                return url;
            }
            url = this.resolve(url, sourceFile);
            if (url.startsWith(".")) {
                const dependencyFile = path.join(fileDir, url);
                url = path.relative(root, dependencyFile).replaceAll("\\", "/");
                url = `${packageName}/${url}`;
                if (this.done.has(url)) {
                    return url;
                }
                this.tm.queueRun(() => this.pack({ file: dependencyFile, root, packageName, moduleUrl: url }));
            } else {
                if (this.done.has(url)) {
                    return url;
                }
                const dependencyFile = this.root + "/node_modules/" + url;
                const tokens = url.split("/");
                let packageName = tokens.shift();
                if (packageName.startsWith("@")) {
                    packageName += tokens.shift();
                }
                const rootFolder = this.root + "/node_modules/" + packageName;
                this.tm.queueRun(() => this.pack({
                    file: dependencyFile,
                    root: rootFolder,
                    packageName,
                    moduleUrl: url
                }));
            }
            return url;
        }


        // we don't need the code
        await Babel.transformAsync({
            file,
            resolve,
            dynamicResolve: resolve
        });

    }
}