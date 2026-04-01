import { createReadStream, statSync } from "node:fs";
import { IncomingMessage, ServerResponse } from "node:http";
import mime from "mime";
import sendList from "./sendList.js";
import sendJS from "./sendJS.js";
import { sendETagMatch } from "./sendETagMatch.js";
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

    const { etag, stats } = sendETagMatch(path, req, res);
    if (!etag) {
        return;
    }

    const stream = createReadStream(path);
    stream.on("error", (err) => {
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end(`500 Internal Server Error\n\n${err.message}`);
      }
    });
    res.writeHead(200, {
      "Content-Type": mime.getType(path),
      "cache-control": "no-cache",
      "etag": etag,
      "last-modified": stats.mtime.toUTCString()
    });
    stream.pipe(res);
}
