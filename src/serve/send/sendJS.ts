import { IncomingMessage, ServerResponse } from "node:http";
import { Babel } from "../../parser/babel.js";
import path, { parse } from "node:path";
import { ProcessOptions } from "../../ProcessArgs.js";
import { existsSync, readFileSync } from "node:fs";

export default function sendJS(filePath: string, req: IncomingMessage, res: ServerResponse) {


    let text = Babel.transform({ file: filePath, resolve(url, sourceFile) {
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
                return "/node_modules/" + url + "/" + start;
            }

        }


        if (!url.startsWith(".")) {
            const resolved = path.resolve(ProcessOptions.cwd, "node_modules/" + url);
            if (existsSync(resolved)) {
                url = "/node_modules/" + url;
                return url;
            }

            const tokens = url.split("/");
            let packageName = tokens.shift();
            if (packageName.startsWith("@")) {
                packageName += "/" + tokens.shift();
            }

            const mainModuleFile = path.resolve(ProcessOptions.cwd, ... tokens);
            if (existsSync(mainModuleFile)) {
                url = tokens.join("/");
                if (!url.endsWith(".js")) {
                    return "/" + url + ".js";
                }
                return "/" + url;
            }

            return "/" + url;
        }

        const jsFile = path.resolve(path.dirname(filePath), url);
        if (existsSync(jsFile)) {
            if (!jsFile.endsWith(".js")) {
                url += ".js";
            }
            return url;
        }

        // is it refernced from source...
        const absoluteSourcePath = path.join( path.dirname(filePath), sourceFile);
        const localSourceFile = path.resolve( absoluteSourcePath, url);
        const localFile = path.resolve(ProcessOptions.cwd, localSourceFile);
        if (!localFile.endsWith(".js")) {
            return "/" + localSourceFile + ".js";
        }
        return "/" + localSourceFile;

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