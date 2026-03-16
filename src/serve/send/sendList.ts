import { readdirSync, statSync } from "node:fs";
import { IncomingMessage, ServerResponse } from "node:http";
import { join } from "node:path";

export default function sendList(reqPath, path: string, req: IncomingMessage, res: ServerResponse) {

    const entries = readdirSync(path, { withFileTypes: true})
        .filter((d) => !d.name.startsWith(".") && d.name !== "node_modules")
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


    const text = renderDirectoryListing(reqPath, entries);

    res.writeHead(200, {
      "Content-Type": "text/html",
      "cache-control": "no-cache"
    });
    res.end(text);
}

function formatSize(bytes) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function renderDirectoryListing(reqPath, entries: { isDir: boolean, name: string, size: number, mtime: Date } []) {


  const isRoot = reqPath === "/";
  const rows = entries
    .map((e) => {
      let href = reqPath.replace(/\/$/, "") + "/" + encodeURIComponent(e.name) + (e.isDir ? "/" : "");
      const icon = e.isDir ? "📁" : (/\.(js|html)$/i.test(e.name) ? "🌐" : "📄");
      const size = e.isDir ? "—" : formatSize(e.size);
      const modified = e.mtime.toISOString().replace("T", " ").slice(0, 19);

      if (e.name.endsWith(".js")) {
        href = href.replace(/\.js$/, ".html");
      }

      return `<tr>
        <td>${icon} <a href="${href.startsWith("/") ? href : "/" + href}">${e.name}${e.isDir ? "/" : ""}</a></td>
        <td>${size}</td>
        <td>${modified}</td>
      </tr>`;
    })
    .join("\n");
 
  const parentRow = isRoot
    ? ""
    : `<tr><td>⬆️  <a href="../">../</a></td><td>—</td><td>—</td></tr>`;
 
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Index of ${reqPath}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: ui-monospace, 'Cascadia Code', monospace; background: #0f1117; color: #e2e8f0; min-height: 100vh; padding: 2rem; }
  h1 { font-size: 1.25rem; color: #7dd3fc; margin-bottom: 1.5rem; border-bottom: 1px solid #1e293b; padding-bottom: .75rem; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; padding: .5rem .75rem; color: #94a3b8; font-weight: 600; font-size: .8rem; text-transform: uppercase; letter-spacing: .05em; border-bottom: 1px solid #1e293b; }
  td { padding: .45rem .75rem; font-size: .9rem; border-bottom: 1px solid #0d1520; }
  td:nth-child(2), td:nth-child(3) { color: #64748b; font-size: .8rem; white-space: nowrap; }
  tr:hover td { background: #1e293b; }
  a { color: #7dd3fc; text-decoration: none; }
  a:hover { color: #bae6fd; text-decoration: underline; }
  footer { margin-top: 2rem; color: #334155; font-size: .75rem; }
</style>
</head>
<body>
<h1>📂 Index of ${reqPath}</h1>
<table>
  <thead><tr><th>Name</th><th>Size</th><th>Modified</th></tr></thead>
  <tbody>
    ${parentRow}
    ${rows}
  </tbody>
</table>
</body>
</html>`;
}