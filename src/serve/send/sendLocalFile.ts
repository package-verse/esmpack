import { createReadStream, statSync } from "node:fs";
import { IncomingMessage, ServerResponse } from "node:http";
import mime from "mime";
import sendList from "./sendList.js";
import sendJS from "./sendJS.js";
export default function sendLocalFile(reqPath: string, path: string, req: IncomingMessage, res: ServerResponse) {

    if (path.endsWith(".js")
        && !path.endsWith(".pack.js")) {
        // send JS
        return sendJS(path, req, res);
    }

    // check if it is a folder...
    const stat = statSync(path);
    if (stat.isDirectory()) {
        // list...
        return sendList(reqPath, path, req, res);
    }
    // just pipe the file...
    sendFile(path, res);
}

function sendFile(filePath, res) {
  const stream = createReadStream(filePath);
  stream.on("error", (err) => {
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end(`500 Internal Server Error\n\n${err.message}`);
    }
  });
  res.writeHead(200, {
    "Content-Type": mime.getType(filePath),
    "cache-control": "no-cache"
  });
  stream.pipe(res);
}
