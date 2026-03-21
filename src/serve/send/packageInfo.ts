import { existsSync, readFileSync } from "fs";
import { ProcessOptions } from "../../ProcessArgs.js";
import path, { join } from "path/posix";

const jsonText = readFileSync(join(ProcessOptions.cwd, "package.json"), "utf-8");

export const packageInfo = JSON.parse(jsonText);

const imports = {
    [packageInfo.name + "/"]: "/"
};

for (const [key] of Object.entries(packageInfo.dependencies)) {

    const modulePackageJsonFilePath = join(ProcessOptions.cwd, "node_modules", key , "package.json");
    if (!existsSync(modulePackageJsonFilePath)) {
        continue;
    }

    let modulePath = "/node_modules/" + key + "/";

    // read package.json
    const modulePackageJson = JSON.parse(readFileSync(modulePackageJsonFilePath, "utf-8"));

    imports[key] = path.join(modulePath , modulePackageJson.module
        || (modulePackageJson.type === "module"
            ? modulePackageJson.main : "index.js"));

    imports[`${key}/`] = modulePath;

    if (modulePackageJson.esm) {
        for(const [distKey, value] of Object.entries(modulePackageJson.esm)) {
            imports[`${key}/${distKey}/`] = `${modulePath}${value}/` ;
        }
    }
    imports[`${key}/`] = modulePath;

}

export const importMap = { imports }; 