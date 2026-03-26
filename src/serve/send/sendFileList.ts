import { readdirSync, readFileSync, statSync } from "node:fs";
import { IncomingMessage, ServerResponse } from "node:http";
import { join, relative } from "node:path";
import { ProcessOptions } from "../../ProcessArgs.js";
import hasPackDecorator from "../../core/hasPackDecorator.js";


export default function sendFileList(url: URL, req: IncomingMessage, res: ServerResponse) {



    const packed = /yes|true/i.test(url.searchParams.get("packed"));

    const search = url.searchParams.get("search") || "";

    const entries = readdirSync(ProcessOptions.cwd, { recursive: true, withFileTypes: true})
        .filter((d) =>
            !d.isDirectory()
            && !d.name.startsWith(".")
            && d.name.endsWith(".js")
            && d.name !== "node_modules"
            && !d.parentPath.replaceAll("\\", "/").includes("node_modules/")
            && (search ? d.name.toLowerCase().includes(search.toLowerCase()) : true)
        )
        .map((d) => {
            const filePath = join(d.parentPath, d.name);
            const fullPath = relative(ProcessOptions.cwd, filePath).replaceAll("\\", "/");
            let size = 0, mtime = new Date();
            try {
                const s = statSync(fullPath);
                size = s.size;
                mtime = s.mtime;
            } catch {}
            const isPacked = hasPackDecorator(filePath);
            return { name: d.name, dir: d.parentPath, fullPath, isPacked, size, mtime };
        })
        .filter((x) => packed ? x.isPacked : true)
        .sort((a, b) => {
            // if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
            if(a.dir !== b.dir) {
                return a.dir.localeCompare(b.dir);
            }
            return a.fullPath.localeCompare(b.fullPath);
        });


    const text = JSON.stringify(entries);

    res.writeHead(200, {
        "Content-Type": "text/json",
        "cache-control": "no-cache,no-store"
    });
    res.end(text);
}
