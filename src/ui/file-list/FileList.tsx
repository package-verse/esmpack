import "../core.js";
import { sleep } from "../core/sleep.js";
import HtmlControl from "../HtmlControl.js";

import "./FileList.css";

const logError = (error) => {
    if(/abort|cancel|timeout/i.test(error?.stack ?? error)) {
        return;
    }
    console.error(error);
}

export default class FileList extends HtmlControl {

    static observedAttributes = ["search"];

    ac = new AbortController();

    attributeChangedCallback(name, oldValue, newValue) {
        switch(name) {
            case "search":
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
        
    }

}

customElements.define("file-list", FileList);
