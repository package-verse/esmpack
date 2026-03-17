import { readFileSync } from "node:fs";
import { IncomingMessage, ServerResponse } from "node:http";
import { fileURLToPath } from "node:url";

export default function sendNonJSModule(path: string, req: IncomingMessage, res: ServerResponse) {


    if (path.endsWith(".css")) {

        const init = fileURLToPath(import.meta.resolve("../../../init.js"));
        const initText = readFileSync(init, "utf-8");

        const text = `
    (function (link) {
        ${initText};
        ESMPack.installStyleSheet(link);
    }("/${path}"))
    `;

        res.writeHead(200, {
            "content-type": "text/javascript",
            "cache-control": "no-cache"
        });
        res.end(text);
        return;
    }


    // just send a path...
    res.writeHead(200, {
        "content-type": "text/javascript",
        "cache-control": "no-cache"
    });
    res.end(`
    const value = "/${path}";
    export default value;
    `);
    
}