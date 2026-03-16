export function *tokenizeRegexAll(text: string, regex: RegExp) {
    if (!text) {
        return;
    }
    regex.lastIndex = 0;
    let start = 0;
    for(const m of text.matchAll(regex)) {
        if (start < m.index) {
            yield { text: text.substring(start, m.index)};
        }
        yield { match: m };
        start = m.index + m[0].length;
    }
    if (start < text.length) {
        if (start) {
            yield { text: text.substring(start) };
        } else {
            yield { text };
        }
    }
    // let m;
    // let start = 0;
    // while((m = regex.exec(text)) !== null) {
    //     const { lastIndex } = regex;
    //     if (m.index === lastIndex) {
    //         regex.lastIndex++;
    //     }
    //     if (!m?.length) {
    //         break;
    //     }
    //     if (start < m.index) {
    //         yield { text: text.substring(start, m.index)};
    //     }
    //     yield { match: m as RegExpExecArray };
    //     start = m.index + m[0].length;
    // }
    // if (start < text.length) {
    //     yield { text: text.substring(start) };
    // }
}