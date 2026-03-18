import DateTime from "@web-atoms/date-time/dist/DateTime.js";

import clock from "@package-verse/esmpack/src/test/Clock.svg";

// irrespective of loading order
// global must be loaded first and
// local must override the global style
import "./TestView.local.css";

import "./TestView.global.css";
import LogDecorator from "./LogDecorator.js";

import Clock2 from "./Clock2.svg";

@LogDecorator
export default class DateView extends HTMLElement {

    connectedCallback() {

        let img = document.createElement("img");
        img.src = clock;
        const span = document.createElement("span");
        this.appendChild(img);
        this.appendChild(span);
        img = document.createElement("img");
        img.src = Clock2;
        this.appendChild(img);
        setInterval(() => {
            const now = DateTime.now;
            span.textContent = now.toJSON();
        }, 1000);
    }

}

customElements.define("date-view", DateView);


(window as any).ESMPack = {
    async render(imports: { default: any }, cs: HTMLScriptElement) {
        const view = new imports.default();
        cs.replaceWith(view);
    },
    installStyleSheet(src) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = src;
        document.head.appendChild(link);
    }
};