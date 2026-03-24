import HtmlControl from "../HtmlControl.js";
import { XNode } from "../XNode.js";

import "./App.css";

import "../file-list/FileList.js";

export default class App extends HtmlControl {

    fileList: HTMLElement;
    search: HTMLInputElement;
    packed: HTMLInputElement;

    async prepare() {

        this.oninput = (e) => {
            this.fileList.setAttribute("search", this.search.value);
            this.fileList.setAttribute("packed", this.packed.checked ? "true" : "false");
        };

        XNode.render(this, <div>
            <header>
                <input type="search"/>
                <input type="checkbox" checked="true"/> Only Packed
            </header>
            <main>
                <file-list></file-list>
            </main>
        </div>);

        this.fileList = this.querySelector("file-list") as HTMLElement;
        this.search = this.querySelector(`input[type="search"]`) as HTMLInputElement;
        this.packed = this.querySelector(`input[type="checkbox"]`) as HTMLInputElement;
    }
}

customElements.define("app-container", App);
