import { readFileSync } from "node:fs";
import { LocalFile } from "./LocalFile.js";


export default function hasPackDecorator(filePath: string) {
    return /((@Pack)|("@web-atoms\/core\/dist\/Pack\.js"))/mu.test(readFileSync(filePath, "utf-8"));
}

export async function hasPackDecoratorAsync(filePath: string) {
    const r = new LocalFile(filePath);
    for await(const line of r.lines()) {
        if(/((@Pack)|("@web-atoms\/core\/dist\/Pack\.js"))/mu.test(line)) {
            return true;
        }
    }
    return false;
}