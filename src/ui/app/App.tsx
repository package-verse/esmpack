import HtmlControl from "../HtmlControl.js";
import { XNode } from "../XNode.js";

import "./App.css";

import "../file-list/FileList.js";

export default class App extends HtmlControl {

    async prepare() {

        this.oninput = (e) => {
            const fileList = this.querySelector("file-list") as HTMLElement;
            fileList.setAttribute("search", (e.target as HTMLInputElement).value);
        };

        XNode.render(this, <div>
            <header>
                <input type="search"/>
            </header>
            <main>
                <file-list></file-list>
            </main>
        </div>);
    }
}

customElements.define("app-container", App);
