import { existsSync, readFileSync, writeFileSync } from "fs";
import path, { join } from "path/posix";
import { fileArgument, ProcessOptions } from "../ProcessArgs.js";

function generate(prefix: string) {

    const jsonText = readFileSync(join(ProcessOptions.cwd, "package.json"), "utf-8");

    const packageInfo = JSON.parse(jsonText);

    const imports = {
        [packageInfo.name + "/"]: "/"
    };

    for (const [key] of Object.entries(packageInfo.dependencies)) {

        const modulePackageJsonFilePath = join(ProcessOptions.cwd, "node_modules", key , "package.json");
        if (!existsSync(modulePackageJsonFilePath)) {
            continue;
        }

        let modulePath = prefix + key + "/";

        // read package.json
        const modulePackageJson = JSON.parse(readFileSync(modulePackageJsonFilePath, "utf-8"));

        let moduleMain = modulePackageJson.module
            || (modulePackageJson.type === "module"
                ? modulePackageJson.main : "index.js");

        const { exports: moduleExports } = modulePackageJson;
        if(moduleExports) {
            moduleMain =  moduleExports["."]?.["module"]?.["default"]
                || moduleExports["."]?.["default"]
                || moduleMain;
        }

        if (moduleMain) {
            imports[key] = path.join(modulePath , moduleMain);
        }

        imports[`${key}/`] = modulePath;

        if (modulePackageJson.esm) {
            for(const [distKey, value] of Object.entries(modulePackageJson.esm)) {
                imports[`${key}/${distKey}/`] = `${modulePath}${value}/` ;
            }
        }
        imports[`${key}/`] = modulePath;

    }

    const importMap = { imports };
    return JSON.stringify(importMap);
}

const outFile = ProcessOptions["--out-file"];
if (outFile) {
    writeFileSync(outFile, generate(fileArgument));
} else {
    console.log(generate(fileArgument));
}