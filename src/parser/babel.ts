import { transform } from "@babel/core";
import { readFileSync } from "fs";

export class Babel {

    static transform({ file, resolve }: { file: string, resolve: (url: string) => string }) {

        const presets = {
            sourceType: "module",
            sourceMaps: "inline" as any,
            inputSourceMap: true,
            compact: false,
            comments: false,
            getModuleId: () => "v",
            "plugins": [
                [
                    function(babel) {
                        return {
                            name: "Import Transformer",
                            visitor: {
                                ImportDeclaration(node) {
                                    const e = node.node;
                                    let source = e.source?.value;
                                    if (source!) {
                                        return node;
                                    }
                                    source = resolve(source);
                                    node.source.value = source;
                                    return node;
                                },
                            }
                        };
                    }
                ]

            ]
        };

        const p = { ... presets, filename: file };
        const code = readFileSync(file, "utf8");
        const result = transform(code, p);
        return result.code;
    }

}