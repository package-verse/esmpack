import { IncomingMessage, ServerResponse } from "node:http";

export default function sendJSHost(path: string, req: IncomingMessage, res: ServerResponse) {
    const text = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Index of ${path}</title>
</head>
<body>
    <script>
        const cs = document.currentScript;
        import("/${path}").then((r) => ESMPack.render(r, cs), (error) => cs.replaceWith(document.createTextNode(error.stack || error)));
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