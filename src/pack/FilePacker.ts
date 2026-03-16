/**
 * File Packer must do following tasks...
 * 1. Visit every JavaScript file
 * 2. Change all imports, redirect CSS imports as css.js file that will include CSS on the page ...
 * 3. Create .pack.js with all nested imports if file imports `@web-atoms/core/dist/Pack`
 * 4. Packed file must set ignore for all imported CSS so dynamically loaded CSS can still be imported
 */
export default class FilePacker {

    constructor(
        public readonly root: string
    ) {
        // empty
    }

    async pack() {

    }

}