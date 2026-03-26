import { NodePath, TransformOptions, transformSync, types as BabelTypes  } from "@babel/core";
import { readFileSync } from "fs";
import { ProcessOptions } from "../ProcessArgs.js";
import { parse } from "path";
import { ImportDeclaration, ImportDefaultSpecifier } from "@babel/types";
import { readFile } from "fs/promises";


export class Babel {

    static transform({
        file,
        resolve,
        dynamicResolve
    }: {
        file: string,
        resolve: (url: string, sourceFile: string) => string,
        dynamicResolve?: (url: string, sourceFile: string) => string
    }) {

        const presets: TransformOptions = Babel.prepareOptions(file, dynamicResolve, resolve);

        const p = { ... presets, filename: file };
        const code = readFileSync(file, "utf8");
        const result = transformSync(code, p);
        return result.code;
    }

    static async transformAsync({
        file,
        resolve,
        dynamicResolve
    }) {
        const presets: TransformOptions = Babel.prepareOptions(file, dynamicResolve, resolve);

        const p = { ... presets, filename: file };
        const code = await readFile(file, "utf8");
        const result = transformSync(code, p);
        return result.code;

    }

    private static prepareOptions(file: string, dynamicResolve: (url: string, sourceFile: string) => string, resolve: (url: string, sourceFile: string) => string) {
        const { base: name } = parse(file);

        const presets: TransformOptions = {
            sourceType: "module",
            sourceMaps: true,
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
                    function (babel) {
                        return {
                            name: "Import Transformer",
                            visitor: {
                                ImportDeclaration(node: NodePath<ImportDeclaration>) {
                                    const e = node.node;
                                    let source = e.source?.value;
                                    if (!source) {
                                        return node;
                                    }
                                    if (source.endsWith(".css")) {
                                        return BabelTypes.callExpression(
                                            BabelTypes.memberExpression(
                                                BabelTypes.identifier("ESMPack"),
                                                BabelTypes.identifier("installStyleSheet")
                                            ),
                                            [BabelTypes.stringLiteral(source)]
                                        );
                                    }
                                    if (/\.(jpg|webp|webm|gif|png|svg|jpeg)$/i.test(source)) {
                                        return BabelTypes.variableDeclaration("const",
                                            [BabelTypes.variableDeclarator(
                                                BabelTypes.identifier((node.node.specifiers[0] as ImportDefaultSpecifier).local.name),
                                                BabelTypes.callExpression(
                                                    BabelTypes.memberExpression(
                                                        BabelTypes.memberExpression(
                                                            BabelTypes.identifier("import"),
                                                            BabelTypes.identifier("meta")
                                                        ),
                                                        BabelTypes.identifier("resolve")
                                                    ),
                                                    [BabelTypes.stringLiteral(source)]
                                                )
                                            )]
                                        );
                                    }
                                    if (/\.json$/i.test(source)) {
                                        const resolveSource = BabelTypes.callExpression(
                                                    BabelTypes.memberExpression(
                                                        BabelTypes.memberExpression(
                                                            BabelTypes.identifier("import"),
                                                            BabelTypes.identifier("meta")
                                                        ),
                                                        BabelTypes.identifier("resolve")
                                                    ),
                                                    [BabelTypes.stringLiteral(source)]
                                                );
                                        const awaitFetch = BabelTypes.awaitExpression(
                                            BabelTypes.callExpression(
                                                BabelTypes.identifier("fetch"),
                                                [resolveSource]
                                            )
                                        );
                                        return BabelTypes.variableDeclaration("const",
                                            [BabelTypes.variableDeclarator(
                                                BabelTypes.identifier((node.node.specifiers[0] as ImportDefaultSpecifier).local.name),
                                                BabelTypes.awaitExpression(
                                                    BabelTypes.callExpression(
                                                        BabelTypes.memberExpression(
                                                            awaitFetch,
                                                            BabelTypes.identifier("json")
                                                        ),[]
                                                    )
                                                )
                                            )]
                                        );
                                    }
                                    const sourceFile = (node.hub as any)?.file?.inputMap?.sourcemap?.sources?.[0];
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
        return presets;
    }
}