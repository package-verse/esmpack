const ESMPack = (window as any).ESMPack ??= {};
ESMPack.render = (imports, cs: HTMLScriptElement) => {
    const c = new imports.default();
    cs.replaceWith(c);
};