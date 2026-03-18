const ESMPack = window.ESMPack ||= {};
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
    if(document.readyState === "complete") {
        installCss(url);
    } else {
        document.addEventListener("DOMContentLoaded", () => {
            installCss(url);
        }, { once: true });
    }
};