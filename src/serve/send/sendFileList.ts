import { statSync } from "node:fs";
import { IncomingMessage, ServerResponse } from "node:http";
import { join, relative } from "node:path";
import { ProcessOptions } from "../../ProcessArgs.js";
import { hasPackDecoratorAsync } from "../../core/hasPackDecorator.js";
import { readdir } from "node:fs/promises";
import TaskManager from "../../core/TaskManager.js";


export default async function sendFileList(url: URL, req: IncomingMessage, res: ServerResponse) {

    let sent = false;

    try {

        const packed = /yes|true/i.test(url.searchParams.get("packed"));

        const search = url.searchParams.get("search") || "";

        const list = await readdir(ProcessOptions.cwd, { recursive: true, withFileTypes: true});

        const all = list
            .filter((d) =>
                !d.isDirectory()
                && !d.name.startsWith(".")
                && d.name.endsWith(".js")
                && d.name !== "node_modules"
                && !(d.parentPath.includes("node_modules/") && d.parentPath.includes("node_modules\\"))
                && (search ? d.name.toLowerCase().includes(search.toLowerCase()) : true)
            );


        const q = new TaskManager();

        const items = [] as { name: string, dir: string, fullPath: string, isPacked: boolean, size: number, mtime: Date }[];
        for (const d of all) {
            q.queueRun(async () => {
                const filePath = join(d.parentPath, d.name);
                const fullPath = relative(ProcessOptions.cwd, filePath).replaceAll("\\", "/");
                let size = 0, mtime = new Date();
                try {
                    const s = statSync(fullPath);
                    size = s.size;
                    mtime = s.mtime;
                } catch {}
                const isPacked = await hasPackDecoratorAsync(filePath);
                items.push({ name: d.name, dir: d.parentPath, fullPath, isPacked, size, mtime });
            });
        }

        await q.wait();

        const entries = items
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
        sent = false;
        res.end(text);
    } catch (error) {
        if (sent) {
            console.error(error);
            return;
        }
        res.writeHead(500, {
            "Content-Type": "text/plain",
            "cache-control": "no-cache,no-store"
        });
        res.end(error.stack ?? error);
    }
}
