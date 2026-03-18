/**
 * File Packer must do following tasks...
 * 1. Visit every JavaScript file
 * 2. Change all imports, redirect CSS imports as css.js file that will include CSS on the page ...
 * 3. Create .pack.js with all nested imports if file imports `@web-atoms/core/dist/Pack`
 * 4. Packed file must set all css as installed. And other modules will simply return absolute paths.
 *
 * For App.js following packed scripts will be generated.
 * 1. App.pack.js
 *      Push Import Maps script tag
 *      Add import map for non js modules as well, and for this
 *         every nested dependency must be inspected.
 *      Push empty module for CSS
 *      Imports all nested dependencies of App.js that should not contain fully qualified path
 *      Import dynamically loaded modules as well
 *      Loads App.pack.global.css
 *      Loads App.pack.local.css
 *      Imports App.js dynamically so CSS can be ready before hosting the User interface
 * 2. App.pack.global.css
 * 3. App.pack.local.css
 */
export default class FilePacker {

    globalCss = [];
    localCss = [];

    constructor(
        public readonly root: string,
        public readonly src: string,
        public readonly prefix: string
    ) {
        // empty
    }

    async pack() {

    }

}