import { transformSync  } from "@babel/core";
import { readFileSync } from "fs";
import { ProcessOptions } from "../ProcessArgs.js";
import { parse } from "path";

export class Babel {

    static transform({ file, resolve }: { file: string, resolve: (url: string, sourceFile: string) => string }) {

        const { base: name } = parse(file);

        const presets = {
            sourceType: "module",
            sourceMaps: true,
            inputSourceMap: true,
            caller: {
                name,
                supportsDynamicImport: true,
                supportsTopLevelAwait: true,
            },
            compact: false,
            comments: false,
            root: ProcessOptions.cwd,
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
                                    if (!source) {
                                        return node;
                                    }
                                    const sourceFile = node.hub?.file?.inputMap?.sourcemap?.sources?.[0];
                                    source = resolve(source, sourceFile);
                                    e.source.value = source;
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
        const result = transformSync(code, p);
        return result.code;
    }

}