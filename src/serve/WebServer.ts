import { IncomingMessage, ServerResponse } from "http";
import path from "path";
import { fileArgument, ProcessOptions } from "../ProcessArgs.js";
import { existsSync } from "fs";
import sendLocalFile from "./send/sendLocalFile.js";
import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";
import colors from "colors";
import sendJSHost from "./send/sendJSHost.js";


let middleware;

export default function WebServer(req: IncomingMessage, res: ServerResponse) {
    const pathname = new URL(req.url, "http://a").pathname.substring(1);

    // check if path exists...
    const fullPath = path.resolve(ProcessOptions.cwd, pathname);
    if (existsSync(fullPath)) {
        // server local..
        sendLocalFile(pathname, fullPath, req, res);
        return;
    }

    const js = fullPath.replace(/\.html$/,".js");
    if(existsSync(js)) {
        sendJSHost(pathname.replace(/\.html$/, ".js"), req, res);
        return;
    }

    // proxy...
    middleware ??= createProxyMiddleware({
        target: fileArgument,
        changeOrigin: true,
        ws: true,
        secure: false,
        cookieDomainRewrite: "",
        on: {
            proxyReq: fixRequestBody,
            proxyRes:(proxyReq, req, res) => {
                if (proxyReq.statusCode >= 400) {
                        console.error(colors.red(`HTTP STATUS ${proxyReq.statusCode} for ${fileArgument}${req.url}`));
                    } else if (proxyReq.statusCode >= 300) {
                        console.warn(colors.yellow(
                            `HTTP STATUS ${proxyReq.statusCode} for ${fileArgument}${req.url}`));
                    }
                    let cookie = proxyReq.headers["set-cookie"];
                    if (cookie) {
                        cookie = cookie.map((s) => s.split(";").filter((c) => c.trim().toLocaleLowerCase() !== "secure").join(";"));
                        proxyReq.headers["set-cookie"] = cookie;
                    }
            }
        }
    });

    middleware(req, res);
}