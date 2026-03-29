import { writeFileSync } from "fs";
import { fileArgument, ProcessOptions } from "../ProcessArgs.js";
import { generateMap } from "./generateMap.js";


const outFile = ProcessOptions["--out-file"];
if (outFile) {
    writeFileSync(outFile, generateMap(fileArgument));
} else {
    console.log(generateMap(fileArgument));
}