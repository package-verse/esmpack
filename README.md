# esmpack
1. ESM Pack will only generate import maps for ES modules.
2. And it will change non JS modules to corresponding `import.meta.resolve`.

# Usage
Add `ESMPack.render` and `ESMPack.installStyleSheet` before any stylesheet reference
```
const ESMPack = ((window as any).ESMPack ||= {});
ESMPack.installStyleSheet ||= (x: string) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = x;
    if (x.includes(".global.")) {
        document.head.insertAdjacentElement("afterbegin", link);
        return;
    }
    document.body.insertAdjacentElement("afterbegin", link);
}

ESMPack.render ||= (imports, cs: HTMLScriptElement) => {
    const name = customElements.getName(imports.default);
    const c = document.createElement(name);
    cs.replaceWith(c);
};
```

# CSS
```
import "app.css";
```

Will transform to

```
ESMPack.installStyleSheet(import.meta.resolve("app.css"));
```

# JSON
```
import list from "./countries.json";
```

Will transform to

```
const list = await (await fetch(import.meta.resolve("./countries.json"))).json();
```

# Media
```
import flag from "./flag.jpg";
```

Will transform to

```
const flag = import.meta.resolve("./flag.jpg");
```
