import { IncomingMessage, ServerResponse } from "node:http";
import { Babel } from "../../parser/babel.js";
import { parse } from "node:path";

export default function sendJS(path: string, req: IncomingMessage, res: ServerResponse) {


    let text = Babel.transform({ file: path, resolve(url) {
        if (url.endsWith(".css")) {
            url += ".js";
        }
        if (!url.startsWith(".")) {
            url = "/node_modules/" + url;
        }
        return url;
    }});

    const { base } = parse(path);

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