import { readFileSync } from "node:fs";
import { IncomingMessage, ServerResponse } from "node:http";
import { fileURLToPath } from "node:url";

export default function sendCSSJS(path: string, req: IncomingMessage, res: ServerResponse) {

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
}