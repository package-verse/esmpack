import { Dirent, readdirSync, readFileSync, statSync } from "node:fs";
import { IncomingMessage, ServerResponse } from "node:http";
import { join } from "node:path";
import { ProcessOptions } from "../../ProcessArgs.js";


export default function sendFileList(url: URL, req: IncomingMessage, res: ServerResponse) {



    const packed = /yes|true/i.test(url.searchParams.get("packed"));

    const isPacked = (d: Dirent) => {
        const fullPath = d.parentPath ? join(ProcessOptions.cwd, d.parentPath, d.name) : join(ProcessOptions.cwd, d.name);
        return /\@Pack/.test(readFileSync(fullPath, "utf-8"));
    };


    const entries = readdirSync(ProcessOptions.cwd, { recursive: true, withFileTypes: true})
        .filter((d) =>
            !d.isDirectory()
            && !d.name.startsWith(".")
            && d.name.endsWith(".js")
            && d.name !== "node_modules"
            && !d.parentPath.startsWith("node_modules")
            && packed ? isPacked(d) : true
        )
        .map((d) => {
            const fullPath = join(d.parentPath, d.name);
            let size = 0, mtime = new Date();
            try {
                const s = statSync(fullPath);
                size = s.size;
                mtime = s.mtime;
            } catch {}
            return { name: d.name, isDir: d.isDirectory(), size, mtime };
        })
        .sort((a, b) => {
            if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
            return a.name.localeCompare(b.name);
        });


    const text = JSON.stringify(entries);

    res.writeHead(200, {
      "Content-Type": "text/json",
      "cache-control": "no-cache"
    });
    res.end(text);
}
