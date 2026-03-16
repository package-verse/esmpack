const ESMPack = window.ESMPack ||= {};
ESMPack.installed ||= new Set();

ESMPack.markAsInstalled ||= (url) => ESMPack.installed.add(url);

ESMPack.installStyleSheet ||= (url) => {

    const installCss = (url) => {

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = url;
        document.head.insertAdjacentElement(
            /\.global\./i.test(url)
            ? "afterbegin"
            : "beforeend", link);
    };

    if (ESMPack.installed.has(url)) {
        return;
    }
    ESMPack.installed.add(url);
    if(document.readyState === "complete") {
        installCss(url);
    } else {
        document.addEventListener("DOMContentLoaded", () => {
            installCss(url);
        }, { once: true });
    }
};