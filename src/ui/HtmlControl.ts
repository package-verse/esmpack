export default abstract class HtmlControl extends HTMLElement {

    connectedCallback() {

        this.onConnected().catch(console.error);
    }

    onConnected() {

        const ready = (async () => {

            await this.prepare();

        })();

        Object.defineProperty(this, "onConnected", { value: () => ready})
        return ready;
    }

    abstract prepare(): any;

    protected getAttributeAsNumber(name: string, def: number) {
        const a = this.getAttribute(name);
        if (!a) {
            return def;
        }
        const n = Number.parseFloat(a);
        return Number.isNaN(n) ? def : n;
    }

    protected getAttributeAsTime(name: string, def: number) {
        const a = this.getAttribute(name);
        if (!a) {
            return def;
        }
        let n = Number.parseFloat(a);
        if (Number.isNaN(n)) {
            n = def;
        }
        if (a.endsWith("ms")) {
            return n;
        }
        if (a.endsWith("s")) {
            return n * 1000;
        }
        if (a.endsWith("min")) {
            return n * 60 * 1000;
        }
        return n;
    }

}