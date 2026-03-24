import "../core.js";
import { sleep } from "../core/sleep.js";
import HtmlControl from "../HtmlControl.js";
import { XNode } from "../XNode.js";

import "./FileList.css";

const logError = (error) => {
    if(/abort|cancel|timeout/i.test(error?.stack ?? error)) {
        return;
    }
    console.error(error);
}

export default class FileList extends HtmlControl {

    static observedAttributes = ["search", "packed"];

    ac = new AbortController();

    attributeChangedCallback(name, oldValue, newValue) {
        switch(name) {
            case "search":
            case "packed":
                this.ac.abort();
                this.ac = new AbortController();
                this.updateSearch(this.ac.signal).catch(logError);
                break;
        }
    }

    async prepare() {
       this.updateSearch(this.ac.signal).catch(logError);
    }

    async updateSearch(signal: AbortSignal) {
        await sleep(250, signal);
        const search = this.getAttribute("search") || "";
        const packed = this.getAttribute("packed") || "true";
        const url = new URL("/$search", location.href);
        url.searchParams.set("search", search);
        url.searchParams.set("packed", packed);
        const rs = await fetch(url, { signal });
        const items = await rs.json();

        this.innerHTML = "";

        for(const { name, fullPath, isPacked } of items) {
            XNode.append(this, <div>
                <a href={"/" + fullPath.replace(".js", ".html")}>{ isPacked ? "🌐" : "📄" }{name}</a>
            </div>)
        }
    }

}

customElements.define("file-list", FileList);
