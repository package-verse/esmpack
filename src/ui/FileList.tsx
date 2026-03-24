import "./core.js";

import "./FileList.css";
import HtmlControl from "./HtmlControl.js";

export default class FileList extends HtmlControl {

    async prepare() {
        
    }

}

customElements.define("file-list", FileList);
