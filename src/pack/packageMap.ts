import { readFile } from "fs/promises";
import { join } from "path";

const resolvedImports = new Map<string, Promise<IPackageMap>>();

export interface IPackageInfo {
    name: string;
    version: string;
    main: string;
}

export interface IPackageMap {
    [key: string]: IPackageInfo
}

async function populatePackageInfo(root, imports: IPackageMap, packageJsonPath) {
    const {
        name,
        version,
        dependencies,
        type,
        module: moduleMain,
        main
    } = JSON.parse(await readFile(packageJsonPath, "utf-8"));

    if (imports[name]) {
        return;
    }

    /**
     * Dependency must specify module or main, we will not assume it.
     * We want to keep import map small.
     *
     * Otherwise, caller must explicitly specify the fully qualified module path to load
     */
    imports[name] = {
        name,
        version,
        main: moduleMain
            || (type === "module" ? main : void 0)
            || void 0
    }

    for(const key of Object.keys(dependencies)) {
        if (imports[key]) {
            continue;
        }
        await populatePackageInfo(root, imports, join(root, "node_modules", key, "package.json"));
    }
}

export default function packageMap(root: string) {
    let value = resolvedImports.get(root);
    if(value) {
        return value;
    }
    value = (async ()=> {
        const moduleImports = {} as IPackageMap;
        await populatePackageInfo(root, moduleImports, join(root, "package.json"));
        return moduleImports;
    })();
    resolvedImports.set(root, value);
    return value;
}