import DateTime from "@web-atoms/date-time/dist/DateTime.js";
import "./TestView.css";

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
    }
};