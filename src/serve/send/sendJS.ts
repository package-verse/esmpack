import { readFileSync } from "node:fs";
import { IncomingMessage, ServerResponse } from "node:http";

export default function sendJS(path: string, req: IncomingMessage, res: ServerResponse) {
    let text = readFileSync(path, "utf-8");

    // change references....
    text = text.replace(/from\s*\"([^\.][^\"]+)\"/gm, `from "/node_modules/$1"`);

    // remap CSS

    res.writeHead(200, { "content-type": "text/javascript "});
    res.end(text);
}