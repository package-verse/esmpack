import { readFile } from "fs/promises";
import { join } from "path";

const resolvedImports = new Map<string, Promise<IModuleImports>>();

export interface IModuleInfo {
    name: string;
    version: string;
    main: string;
}

export interface IModuleImports {
    [key: string]: IModuleInfo
}

async function populateModuleInfo(root, imports: IModuleImports, packageJsonPath) {
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
    imports[name] = {
        name,
        version,
        main: moduleMain
            || (type === "module" ? main : "index.js")
            || "index.js"
    }

    for(const key of Object.keys(dependencies)) {
        if (imports[key]) {
            continue;
        }
        await populateModuleInfo(root, imports, join(root, "node_modules", key, "package.json"));
    }
}

export default function moduleImports(root: string) {
    let value = resolvedImports.get(root);
    if(value) {
        return value;
    }
    value = (async ()=> {
        const moduleImports = {} as IModuleImports;
        await populateModuleInfo(root, moduleImports, join(root, "package.json"));
        return moduleImports;
    })();
    resolvedImports.set(root, value);
    return value;
}