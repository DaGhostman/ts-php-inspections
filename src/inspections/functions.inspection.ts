import { BaseInspection } from '../common/inspections/base.inspection';
import { InspectionItemCollection, InspectionItem, InspectionInterface } from '../common/interfaces';

export class FunctionsInspection extends BaseInspection implements InspectionInterface {
    public checkFunctionSignature(tree, content: string): InspectionItem[] {
        let items: InspectionItem[] = [];
        let raw = this.walkNodeTree(tree, (node) => {
            if (node === null) {
                return false;
            }
            return this.isNodeOfType(node, 'function');
        });

        raw.forEach((node) => {
            let signatureTypes = [];

            if (node[2].length > 0) {

                node[2].forEach((argument) => {
                    let next = node[2][node[2].indexOf(argument) + 1];
                    if (argument[2].length > 0 && next !== undefined && next[2] !== undefined) {
                        if (next[2].length === 0) {
                            let range = {
                                start: { line: 0, character: 0 },
                                end: { line: 0, character: 0 },
                            };

                            let sig = `${(argument[1] === 'mixed' ? '' : argument[1])} ${argument[0]} ${argument[2].length > 0 ? '= ' + argument[2][3][1] : ''}`.trim();
                            content.split("\n").forEach((line: string, lineNo: number) => {
                                if (line.indexOf(sig) !== -1) {
                                    range.start.line = lineNo;
                                    range.start.character = line.indexOf(sig);
                                    range.end.line = lineNo;
                                    range.end.character = line.indexOf(sig) + sig.length;
                                }
                            });

                            items.push(<InspectionItem>{
                                message: `Consider moving \`${sig.split('=')[0].trim()}\` near the end of the argument list, since it has a default value`,
                                severity: 3,
                                range: range
                            })
                        }
                    }

                    signatureTypes.push(
                        `${(argument[1] === 'mixed' ? '' : argument[1])} ${argument[0]} ${argument[2].length > 0 ? '= ' + (argument[2][0] === 'position' ? argument[2][3][1] : argument[2][1]) : ''}`.trim()
                    )
                });

                let signature =
                    `${node[1]}(${signatureTypes.join(', ')})${node[5] ? ': ' + node[5] : ''}`;

                if (node[2].length > 3) {
                    let range = {
                        start: { line: 0, character: 0 },
                        end: { line: 0, character: 0 },
                    };

                    content.split("\n").forEach((line: string, lineNo: number) => {
                        if (line.indexOf(signature) !== -1) {
                            range.start.line = lineNo;
                            range.start.character = line.indexOf(signature);
                            range.end.line = lineNo;
                            range.end.character = line.indexOf(signature) + signature.length;

                        }
                    });

                    items.push(<InspectionItem>{
                        message: 'Function or method taking more than 3 arguments is a sign of poor design',
                        severity: 4,
                        range: range
                    });
                }
            }
        });

        return items;
    }

    public analyzeForClassMethods(tree, content: string): InspectionItem[] {
        let items: InspectionItem[] = [];
        let raw = this.walkNodeTree(tree, (node) => {
            if (node === null) {
                return false;
            }

            return (
                this.isNodeOfType(node, 'class') ||
                this.isNodeOfType(node, 'interface') ||
                this.isNodeOfType(node, 'trait')
            );
        });

        raw.forEach((entity) => {
            let methods = this.checkFunctionSignature(entity[0] === 'class' ? entity[5].methods : entity[4].methods, content);
            items = items.concat(methods);
        });

        return items;
    }

    public analyze(content: string): InspectionItemCollection {
        let ast = this.parser.parseCode(content);

        return {
            items: [].concat(
                this.checkFunctionSignature(ast, content),
                this.analyzeForClassMethods(ast, content),
            )
        };
    }
}
