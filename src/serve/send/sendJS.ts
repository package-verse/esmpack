import { IncomingMessage, ServerResponse } from "node:http";
import { Babel } from "../../parser/babel.js";
import path, { parse } from "node:path";
import { ProcessOptions } from "../../ProcessArgs.js";
import { existsSync, readFileSync } from "node:fs";

export default function sendJS(filePath: string, req: IncomingMessage, res: ServerResponse) {


    let text = Babel.transform({ file: filePath, resolve(url, sourceFile) {

        const originalUrl = url;

        // check if it has no extension...
        const { ext } = parse(url);
        if (!ext) {

            // this is case for tslib, reflect_metadata
            
            // fetch module...
            const tokens = url.split("/");
            let packageName = tokens.shift();
            if (packageName.startsWith("@")) {
                packageName += "/" + tokens.shift();
            }

            const packageJsonPath = path.resolve(ProcessOptions.cwd, "node_modules", packageName, "package.json");
            if (existsSync(packageJsonPath)) {
                const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
                const start = packageJson["module"] || packageJson["main"];
                return url + "/" + start;
            }

        }


        if (!url.startsWith(".")) {

            if (!url.endsWith(".js")) {
                url += ".js";
            }

            return url;
        }

        const jsFile = path.resolve(path.dirname(filePath), url);
        if (existsSync(jsFile)) {
            if (!jsFile.endsWith(".js")) {
                url += ".js";
            }
            return url;
        }

        if (url.endsWith(".js")) {
            return url;
        }

        // is it referenced from source...
        const dir = path.dirname(filePath);
        const absoluteSourcePath = path.resolve( dir, path.dirname(sourceFile));
        console.log(`Absolute Path is ${absoluteSourcePath}`);
        const referencedAbsolutePath = path.join(absoluteSourcePath, url);
        if (existsSync(referencedAbsolutePath)) {
            const relative = path.relative(dir, referencedAbsolutePath).replaceAll("\\", "/");
            if(!relative.endsWith(".js")) {
                return relative + ".js";
            }
            return relative;
        }
        return originalUrl;

    }});

    const { base } = parse(filePath);

    text += `\n//# sourceMappingURL=${base}.map`;

    // let text = readFileSync(path, "utf-8");

    // // change references....
    // // text = text.replace(/from\s*\"([^\.][^\"]+)\"/gm, `from "/node_modules/$1"`);

    // // remap CSS
    // text = RegExpExtra.replaceAll(text, /from\s*\"([^\"]+)\"/gm, (
    //     { text, match }
    // ) => {
    //     if (text) {
    //         return text;
    //     }
    //     const [matched, g] = match;
    //     if (g.endsWith(".css")) {
    //         // we need to find source...
    //         return `from "/node_modules/${g}.js"`;
    //     }
    //     if (g.startsWith(".")) {
    //         return matched;
    //     }
    //     return `from "/node_modules/${g}"`;
    // });

    // text = RegExpExtra.replaceAll(text, /import\s*\"([^\"]+)\"/gm, (
    //     { text, match }
    // ) => {
    //     if (text) {
    //         return text;
    //     }
    //     const [matched, g] = match;
    //     if (g.endsWith(".css")) {
    //         // we need to find source...
    //         let cssPath = g;
    //         if (!cssPath.startsWith(".")) {
    //             cssPath = "/node_modules/" + cssPath; 
    //         }
    //         return `import "${cssPath}.js"`;
    //     }
    //     if (g.startsWith(".")) {
    //         return matched;
    //     }
    //     return `import "/node_modules/${g}"`;
    // });

    res.writeHead(200, {
        "content-type": "text/javascript",
        "cache-control": "no-cache"
    });
    res.end(text);
}