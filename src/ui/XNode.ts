import { PropertyStore } from "./PropertyStore.js";

export class XNode {

    public static create(
        // eslint-disable-next-line @typescript-eslint/ban-types
        name: string | Function,
        attribs: Record<string, any>,
        ... nodes: (XNode | string)[]): XNode {
        if (typeof name === "function") {
            return name(attribs ?? {}, ... nodes);
        }
        return new XNode(name, attribs, nodes);
    }

    static render(root: HTMLElement | ShadowRoot, node: XNode) {
        return node.render(root as any);
    }

    static append(root: HTMLElement | ShadowRoot, node: XNode) {
        return node.appendTo(root as any);
    }

    private constructor(
        public readonly name: string,
        public readonly attributes: Record<string, any>,
        public readonly children: (XNode | string)[]
    ) {

    }

    public appendTo(parent: HTMLElement, doc: Document = parent.ownerDocument ?? document) {
        const element = doc.createElement(this.name);
        this.render(element);
        parent.appendChild(element);
        return element;
    }

    public render(root: HTMLElement) {
        const { attributes, children } = this;
        if (attributes) {
            for (const key in attributes) {
                if (Object.prototype.hasOwnProperty.call(attributes, key)) {
                    PropertyStore.setProperty(root, key, attributes[key]);
                }
            }
        }

        if (children) {
            for (const iterator of children.flat(2)) {
                switch(typeof iterator) {
                    case "object":
                        const child = root.ownerDocument.createElement(iterator.name);
                        iterator.render(child);
                        root.appendChild(child);
                        continue;
                    case "boolean":
                        if(!iterator) {
                            continue;
                        }
                        break;
                }
                root.append(iterator?.toString());
            }
        }
        return root;
    }

    public renderToString(nest = "") {
        const { name, attributes, children } = this;
        let a = "";
        if (attributes) {
            for (const key in attributes) {
                if (Object.prototype.hasOwnProperty.call(attributes, key)) {
                    const element = attributes[key];
                    a += ` ${key}=${JSON.stringify(element)}`;
                }
            }
        }
        if (this.children) {
            for (const child of this.children) {
                if (typeof child === "string") {
                    children.push(child);
                    continue;
                }
                if (!child) {
                    continue;
                }
                children.push(child.renderToString(nest + "\t"));
            }
        }
        if (!name) {
            return `\n${nest}\t${children.join("\n\t")}`;
        }
        return `${nest}<${name}${a}>\n${nest}\t${children.join("\n\t")}\n${nest}</${name}>`;
    }

}

const ESMPack = ((window as any).ESMPack ??= {});
ESMPack.installStyleSheet ??= (x: string) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = x;
    if (x.includes(".global.")) {
        document.head.insertAdjacentElement("afterbegin", link);
        return;
    }
    document.body.insertAdjacentElement("afterbegin", link);
}

ESMPack.render = (imports, cs: HTMLScriptElement) => {
    const name = customElements.getName(imports.default);
    const c = document.createElement(name);
    cs.replaceWith(c);
};