import DateTime from "@web-atoms/date-time/dist/DateTime.js";

// irrespective of loading order
// global must be loaded first and
// local must override the global style
import "./TestView.local.css";

import "./TestView.global.css";

export default class DateView extends HTMLElement {

    connectedCallback() {
        setInterval(() => {
            const now = DateTime.now;
            this.textContent = now.toJSON();
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