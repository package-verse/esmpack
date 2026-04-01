import { IncomingMessage, ServerResponse } from "node:http";
import { Babel } from "../../parser/babel.js";
import path, { parse } from "node:path";
import { existsSync } from "node:fs";
import { sendETagMatch } from "./sendETagMatch.js";

export default function sendJS(filePath: string, req: IncomingMessage, res: ServerResponse) {


    const { etag, stats } = sendETagMatch(filePath, req, res);
    if (!etag) {
        return;
    }

    const resolve = (url: string, sourceFile: string) => {

        if (url.endsWith(".js")) {
            return url;
        }

        if(!sourceFile) {
            sourceFile = filePath;
        }

        // if (!url.startsWith(".")) {

        //     // we need to include .js for every module relative path
        //     const tokens = url.split("/");
        //     let packageName = tokens.shift();
        //     if (packageName.startsWith("@")) {
        //         packageName += "/" + tokens.shift();
        //     }

        //     if (tokens.length) {
        //         if (!url.endsWith(".js")) {
        //             return url + ".js";
        //         }
        //     }

        //     return url;
        // }


        // is it referenced from source...
        const dir = path.dirname(filePath);
        const absoluteSourcePath = path.resolve( dir, path.dirname(sourceFile));
        const referencedAbsolutePath = path.join(absoluteSourcePath, url);
        if (existsSync(referencedAbsolutePath)) {
            const relative = path.relative(dir, referencedAbsolutePath).replaceAll("\\", "/");
            // if(!relative.endsWith(".js")) {
            //     return relative + ".js";
            // }
            return relative;
        }


        return url;
    };


    let text = Babel.transform({ file: filePath, resolve, dynamicResolve: resolve});

    const { base } = parse(filePath);

    if (existsSync(filePath + ".map")) {
        text += `\n//# sourceMappingURL=${base}.map`;
    }

    res.writeHead(200, {
        "content-type": "text/javascript",
        "cache-control": "no-cache",
        "etag": etag,
        "last-modified": stats.mtime.toUTCString()
    });
    res.end(text);
}