import { BaseInspection } from '../common/inspections/base.inspection';
import { InspectionItemCollection, InspectionItem, InspectionInterface } from '../common/interfaces';

export class Php7Inspection extends BaseInspection implements InspectionInterface {
    public checkForDeclareStrict(content: string) {
        if (content.split("\n")[1].indexOf('declare(strict_types=1);') === -1) {
            return [
                <InspectionItem>{
                    message: 'Missing `declare(strict_types=1)` in file, this is recommended in order to experience the benefits of types in PHP7+',
                    severity: 4,
                    range: {
                        start: {
                            line: 2,
                            character: 0
                        },
                        end: {
                            line: 2,
                            character: 0
                        }
                    },
                    replacement: 'declare(strict_types=1);'
                }
            ]
        }
    }

    private checkFunctionForArgumentTypes(tree, content: string): InspectionItem[] {
        let items: InspectionItem[] = [];
        let raw = this.walkNodeTree(tree, (node) => {
            return this.isNodeOfType(node, 'function');
        });

        raw.forEach((node) => {
            if (node[2].length > 0) {
                node[2].forEach((argument) => {
                    if (argument[1] === 'mixed') {
                        let sig = `${argument[0]} ${argument[2].length > 0 ? '= ' + argument[2][1] : ''}`.trim();
                        content.split("\n").forEach((line: string, lineNo: number) => {
                            if (line.indexOf(`function ${node[1]}`) !== -1) {
                                // Prevent showing the warning for all occurances of the variable on the next lines
                                if (line.indexOf(sig) !== -1) {
                                    let range = {
                                        start: { line: 0, character: 0 },
                                        end: { line: 0, character: 0 },
                                    };

                                    range.start.line = lineNo + 1;
                                    range.start.character = line.indexOf(sig);
                                    range.end.line = lineNo + 1;
                                    range.end.character = line.indexOf(sig) + sig.length;

                                    items.push(<InspectionItem>{
                                        message: `Argument \`${argument[0]}\` does not have a type specified, consider providing one`,
                                        severity: 4,
                                        range: range
                                    });
                                }
                            }
                        });
                    }
                });
            }
        });

        return items;
    }

    private checkFunctionForReturnTypes(tree, content: string) {
        let items: InspectionItem[] = [];
        let raw = this.walkNodeTree(tree, (node) => {
            if (node === null) {
                return false;
            }
            return this.isNodeOfType(node, 'function');
        });

        try {
            raw.forEach((node) => {
                if (node[5] === false) {
                    let returns = [];
                    if (node[6].length > 0) {
                        returns = this.walkNodeTree(node[6], (node) => {
                            return this.isNodeOfType(node, 'return');
                        });
                    }

                    if (returns.length > 0) {
                        let signatures = [
                            `function ${node[1]} (`,
                            `function ${node[1]}(`
                        ]
                        content.split("\n").forEach((line: string, lineNo: number) => {
                            signatures.forEach((signature) => {
                                if (line.indexOf(signature) !== -1) {
                                    let range = {
                                        start: { line: 0, character: 0 },
                                        end: { line: 0, character: 0 },
                                    }

                                    range.start.line = lineNo + 1;
                                    range.start.character = line.indexOf(`function ${node[1]}`);
                                    range.end.line = lineNo + 1;
                                    range.end.character = line.lastIndexOf(')');

                                    items.push(<InspectionItem>{
                                        message: `Function or method \`${node[1]}\` does not have a return type specified, consider providing one`,
                                        severity: 4,
                                        range: range
                                    });
                                }
                            });
                        });
                    }
                }
            });
        } catch (_) {
            // console.log(_);
        }

        return items;
    }

    private checkMethodsForReturnTypes(tree, content: string) {
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
            let methods = entity[0] === 'class' ? entity[5].methods : entity[4].methods;
            items = items.concat(
                this.checkFunctionForReturnTypes(methods, content),
                this.checkFunctionForArgumentTypes(methods, content)
            );
        });

        return items;
    }

    private checkDocBlocksForPropAndReturn(tree, content: string): InspectionItem[]
    {
        let items: InspectionItem[] = [];
        let docSwitch = false;
        let raw = this.walkNodeTree(tree, (node) => {
            if (this.isNodeOfType(node, 'doc')) {
                docSwitch = true;
                return true;
            }

            if (docSwitch && this.isNodeOfType(node, 'function')) {
                docSwitch = false;
                return true;
            }

            return false;
        });

        let pairs = [];
        raw.forEach((node, index, array) => {
            if (index%2 === 0) {
                pairs.push([
                    node, array[index+1]
                ]);
            }
        });

        pairs.forEach((pair: any[]) => {
            let doc, func;
            [doc, func] = pair;

            let params = [];
            // @ToDo: Take the same aproach for checking the return type of the function if it is defined inside the docblock

            doc[1].split("\n").forEach((line: string, lineNo: number) => {
                if (line.indexOf('@param') !== -1) {
                    let components = line.split('*')[1].trim().split(/\s+/i, 3);
                    func[2].forEach((argument) => {
                        if (argument[1] === 'mixed' && (argument[0] === components[1] || argument[0] === components[2])) {
                            if (components[1] === 'mixed' || components[2] === 'mixed') {
                                // Avoid those defined in the doc-block with mixed from being suggested to have
                                return;
                            }

                            let sig = `${argument[0]} ${argument[2].length !== 0 ? '= ' + argument[2] : ''}`;
                            params.push([func[1], sig.trim(), `${(argument[1] === components[1] ? components[1] : components[2])} ${sig}`]);
                        }
                    });
                }
            });

            content.split("\n").forEach((line: string, lineNo: number) => {
                params.forEach((param) => {
                    if (line.indexOf(param[0]) !== -1) {
                        let range = {
                            start: {line: lineNo+1, character: line.indexOf(param[1])},
                            end: {line: lineNo+1, character: line.indexOf(param[1])+param[1].length}
                        };

                        items.push(<InspectionItem>{
                            message: `Function or method has types defined for \`${param[1].split('=')[0].trim()}\` in docblock, but not in signature`,
                            severity: 3,
                            range: range,
                            replacement: param[2]
                        });
                    }
                });

            });

        });

        return items;
    }

    public analyze(content: string): InspectionItemCollection {
        let ast = this.parser.parseCode(content);

        return {
            items: [].concat(
                this.checkForDeclareStrict(content),
                this.checkMethodsForReturnTypes(ast, content),
                this.checkFunctionForReturnTypes(ast, content),
                this.checkFunctionForArgumentTypes(ast, content),
                // WIP
                this.checkDocBlocksForPropAndReturn(ast, content)
            )
        };
    }
}
