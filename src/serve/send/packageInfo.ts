import { readFileSync } from "fs";
import { ProcessOptions } from "../../ProcessArgs.js";
import { join } from "path";

const jsonText = readFileSync(join(ProcessOptions.cwd, "package.json"), "utf-8");

export const packageInfo = JSON.parse(jsonText);
