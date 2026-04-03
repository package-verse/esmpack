import { statSync } from "node:fs";
import { IncomingMessage, ServerResponse } from "node:http";

export const sendETagMatch = (
    filePath: string,
    req: IncomingMessage,
    res: ServerResponse
) => {
    const stats = statSync(filePath);

    const etag = `"${stats.mtimeMs}"`;

    // Check If-None-Match header
    const clientETag = req.headers['if-none-match'];
    if (clientETag){
        if (clientETag === etag) {
            // res.statusCode = 304;
            res.writeHead(304);
            res.end();
            return {};
        }
    }

    return { etag, stats };
    
}