import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";

export default function hasPackDecorator(filePath: string) {
    return /((@Pack)|("@web-atoms\/core\/dist\/Pack\.js"))/mu.test(readFileSync(filePath, "utf-8"));
}

export async function hasPackDecoratorAsync(filePath: string) {
    return /((@Pack)|("@web-atoms\/core\/dist\/Pack\.js"))/mu.test(await readFile(filePath, "utf-8"));
}