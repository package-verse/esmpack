import { IncomingMessage, ServerResponse } from "node:http";
import { importMap, packageInfo } from "./packageInfo.js";

export default function sendJSHost(path: string, req: IncomingMessage, res: ServerResponse) {

    // generate import maps
    // for dynamic scripts
    // this is to avoid path renaming and support dynamic module loading

    const text = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Index of ${path}</title>
</head>
<body>
    <script type="importmap">
        ${JSON.stringify(importMap, void 0, 2)}
    </script>
    <script>
        const cs = document.currentScript;
        import("${packageInfo.name}/${path}").then((r) => ESMPack.render(r, cs), (error) => cs.replaceWith(document.createTextNode(error.stack || error)));
    </script>
</body>
</html>
`;

    res.writeHead(200, {
        "content-type": "text/html",
        "cache-control": "no-cache"
    });
    res.end(text);
}