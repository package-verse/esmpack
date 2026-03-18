import { readFileSync } from "fs";
import { ProcessOptions } from "../../ProcessArgs.js";
import { join } from "path";

const jsonText = readFileSync(join(ProcessOptions.cwd, "package.json"), "utf-8");

export const packageInfo = JSON.parse(jsonText);

const imports = {
    [packageInfo.name + "/"]: "/"
};

for (const [key] of Object.entries(packageInfo.dependencies)) {
    imports[key + "/"] = "/node_modules/" + key + "/";
}

export const importMap = { imports }; 