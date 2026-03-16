import { IncomingMessage, ServerResponse } from "node:http";

export default function sendCSSJS(path: string, req: IncomingMessage, res: ServerResponse) {
    const text = `
(function () {

    function loadCSS() {
        if (typeof ESMPack === "undefined") {
            setTimeout(loadCSS, 100);
            return;
        }
        ESMPack.installStyleSheet("/${path}");
    }
    loadCSS();


}())
`;

    res.writeHead(200, { "content-type": "text/javascript"});
    res.end(text);
}