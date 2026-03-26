import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";

export default function hasPackDecorator(filePath: string) {
    return /\@Pack/.test(readFileSync(filePath, "utf-8"));
}


export async function hasPackDecoratorAsync(filePath: string) {
    return /\@Pack/.test(await readFile(filePath, "utf-8"));
}