import { opendir, writeFile } from "node:fs/promises";
import { fileArgument, ProcessOptions } from "../ProcessArgs.js";
import path, { join, parse, relative } from "node:path";
import TaskManager from "../core/TaskManager.js";
import { hasPackDecoratorAsync } from "../core/hasPackDecorator.js";
import { Babel } from "../parser/babel.js";
import { existsSync } from "node:fs";
import FilePacker from "./FilePacker.js";


async function processJS({ fullPath, relativePath }) {

    const resolve = (url: string, sourceFile: string) => {

        if(!url.startsWith(".")) {
            return url;
        }

        if (url.endsWith(".js")) {
            return url;
        }

        if(!sourceFile) {
            sourceFile = fullPath;
        }

        const dir = path.dirname(fullPath);
        const absoluteSourcePath = path.resolve( dir, path.dirname(sourceFile));
        const referencedAbsolutePath = path.join(absoluteSourcePath, url);
        if (existsSync(referencedAbsolutePath)) {
            const relative = path.relative(dir, referencedAbsolutePath).replaceAll("\\", "/");
            return relative;
        }
        return url;
    };

    // rewrite non JS imports
    const code = await Babel.transformAsync({
        file: fullPath ,
        resolve
    });

    await writeFile(fullPath, code, "utf-8");

    if (fullPath.endsWith(".pack.js")) {
        return;
    }

    if(await hasPackDecoratorAsync(fullPath)) {
        // need to create a packed file...
        console.log(`Packing ${fullPath}`);
        const fp = new FilePacker(ProcessOptions.cwd, resolve);
        const  moduleUrl = fp.moduleUrl(fullPath);
        fp.done.add(moduleUrl);
        await fp.pack({ file: fullPath });
        await fp.tm.wait();
        const packed = fp.imports.map((x) => `import "${x}";`).join("\n");
        const main = `${packed}
        import app from "${moduleUrl}";
        export default app; 
        `.split("\n").map((x) => x.trim()).join("\n");
        const { dir, name } = parse(fullPath);
        await writeFile(`${dir}/${name}.pack.js`, main, "utf-8");
    }

}

const dir = await opendir(fileArgument
    ? join(ProcessOptions.cwd, fileArgument)
    : ProcessOptions.cwd, { recursive: true });

const tm = new TaskManager();

for await(const { name, parentPath} of dir) {
    if (!name.endsWith(".js")) {
        continue;
    }
    const fullPath = join(parentPath,name);
    const relativePath = relative(ProcessOptions.cwd, fullPath);
    tm.queueRun(() => processJS({ fullPath, relativePath }));
}

tm.runAfterEnd(() => {
    console.log(`Done`);
});