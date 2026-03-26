export default function LogDecorator(... a: any[]) {
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