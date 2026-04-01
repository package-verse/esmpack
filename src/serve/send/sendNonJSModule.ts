import { readFileSync } from "node:fs";
import { IncomingMessage, ServerResponse } from "node:http";
import { fileURLToPath } from "node:url";
import { sendETagMatch } from "./sendETagMatch.js";

const init = fileURLToPath(import.meta.resolve("../../../init.js"));
const initText = readFileSync(init, "utf-8");

export default function sendNonJSModule(path: string, req: IncomingMessage, res: ServerResponse) {

    const { etag, stats } = sendETagMatch(path, req, res);
    if (!etag) {
        return;
    }

    if (path.endsWith(".css")) {

        const text = `
    (function (link) {
        ${initText};
        ESMPack.installStyleSheet(link);
    }("/${path}"))
    `;

        res.writeHead(200, {
            "content-type": "text/javascript",
            "cache-control": "no-cache",
            "etag": etag,
            "last-modified": stats.mtime.toUTCString()
        });
        res.end(text);
        return;
    }


    // just send a path...
    res.writeHead(200, {
        "content-type": "text/javascript",
        "cache-control": "no-cache",
        "etag": etag,
        "last-modified": stats.mtime.toUTCString()
    });
    res.end(`
    const value = "/${path}";
    export default value;
    `);
    
}