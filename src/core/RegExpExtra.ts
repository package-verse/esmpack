import { tokenizeRegexAll } from "./tokenizeAll.js";

export type regExpTokens = { text: string, match: RegExpMatchArray };

export const RegExpExtra = {

    replaceAll(text: string, regExp: RegExp, transformer: (item: regExpTokens) => string) {
        let r = "";
        for(const token of tokenizeRegexAll(text, regExp)) {
            r += transformer(token as any);
        }
        return r;
    },
};
