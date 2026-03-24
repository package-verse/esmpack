import { StringHelper } from "./StringHelper.js";

export class PropertyStore {

    private static properties: Map<string, (root: HTMLElement, value: any) => void> = new Map();

    static register(key: string, fx: (element: HTMLElement, value: any) => void) {
        this.properties.set(key, fx);
    }

    static setProperty(element: HTMLElement, key: string, value: any) {
        switch(key) {
            case "text":
            case "textContent":
                element.textContent = value?.toString();
                return;
            case "innerHTML":
                element.innerHTML = value?.toString();
                return;
            case "style":
            case "class":
                element.setAttribute(key, value?.toString());
                return;
        }

        const handler = this.properties.get(key);
        if (handler) {
            handler(element, value);
            return;
        }

        if (key.startsWith("style")) {
            key = StringHelper.fromCamelToHyphen(key.substring(5));
            element.style.setProperty(key, value);
            return;
        }

        element.setAttribute(key, value);
    }
}

PropertyStore.register("style-display", (e, v) => {
    if (typeof v === "boolean") {
        if (v) {
            if(e.style.display === "none") {
                e.style.removeProperty("display");
            }
            return;
        }
        e.style.display = "none";
        return;
    }
    e.style.display = v?.toString() ?? "";
});



PropertyStore.register("event-click", (e, v) => {
    e.addEventListener("click", v);
});



