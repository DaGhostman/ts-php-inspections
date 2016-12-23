import { BaseInspection } from '../common/inspections/base.inspection';
import { InspectionItemCollection, InspectionItem, InspectionInterface } from '../common/interfaces';

export class ConditionsInspection extends BaseInspection implements InspectionInterface
{
    private analyzeForWeakNotEqualComparison(tree, content: string): InspectionItem[] {
        let items: InspectionItem[] = [];
        let raw = this.walkNodeTree(tree, (node) => {
            return this.isNodeOfType(node, 'if') && node[1][1] === '!~';
        });

        raw.forEach((item: any) => {
            let range = {
                start: {
                    line: 0,
                    character: 0
                },
                end: {
                    line: 0,
                    character: 0
                },
            };

            switch (item[1][2][0]) {
                case 'position':
                    range.start.line = item[1][2][1][0];
                    range.start.character = item[1][2][1][1];
                    range.end.line = item[1][2][2][0];
                    range.end.character = item[1][2][2][1];
                    break;
                case 'var':
                    let needles = [
                        `${item[1][2][1]}!=${item[1][3][1]}`,
                        `${item[1][2][1]} != ${item[1][3][1]}`,
                    ]
                    content.split("\n").forEach((line: string, lineNo: number) => {
                        needles.forEach((needle: string) => {
                            if (line.indexOf(needle) !== -1) {
                                range.start.line = lineNo;
                                range.start.character = line.indexOf('!=');
                                range.end.line = lineNo;
                                range.end.character = line.indexOf('!=')+2;

                            }
                        });
                    });
                    break;
            }

            items.push(<InspectionItem>{
                message: "Type-unsafe comparison, \"!==\" should be used instead",
                severity: 3,
                range: range,
                replacement: '!=='
            });
        });

        return items;
    }

    private analyzeForWeakEqualComparison(tree, content: string): InspectionItem[] {
        let items: InspectionItem[] = [];
        let raw = this.walkNodeTree(tree, (node) => {
            return this.isNodeOfType(node, 'if') && node[1][1] === '~';
        });

        raw.forEach((item: any) => {
            let range = {
                start: {line: 0,character: 0},
                end: {line: 0,character: 0},
            };

            switch (item[1][2][0]) {
                case 'position':
                    range.start.line = item[1][2][1][0];
                    range.start.character = item[1][2][1][1];
                    range.end.line = item[1][2][2][0];
                    range.end.character = item[1][2][2][1];
                    break;
                case 'constant':
                case 'var':
                    let needles = [
                        `${item[1][2][1]}==${item[1][3][1]}`,
                        `${item[1][2][1]} == ${item[1][3][1]}`,
                    ]
                    content.split("\n").forEach((line: string, lineNo: number) => {
                        needles.forEach((needle: string) => {
                            if (line.indexOf(needle) !== -1) {
                                range.start.line = lineNo;
                                range.start.character = line.indexOf('==');
                                range.end.line = lineNo;
                                range.end.character = line.indexOf('==')+2;
                            }
                        });
                    });
                    break;
            }



            items.push(<InspectionItem>{
                message: "Type-unsafe comparison, \"===\" should be used instead",
                severity: 3,
                range: range,
                replacement: '==='
            });
        });

        return items;
    }

    private analyzeForInArrayStrictParameter(tree, content: string): InspectionItem[]
    {
        let items: InspectionItem[] = [];
        let raw = this.walkNodeTree(tree, (node) => {
            return (
                this.isNodeOfType(node, 'if') &&
                node[1][0] === 'call' &&
                node[1][1][1][0] === 'in_array'
            );
        });

        raw.forEach((node) => {
            if (node[1][2].length === 2) {
                let range = {
                    start: {
                        line: 0,
                        character: 0
                    },
                    end: {
                        line: 0,
                        character: 0
                    }
                };

                content.split("\n").forEach((line: string, lineNo: number) => {
                    let needles = [
                        `in_array(${node[1][2][0][0] === 'string' ? '"' + node[1][2][0][1] + '"' : node[1][2][0][1]},${node[1][2][1][1]})`,
                        `in_array(${node[1][2][0][0] === 'string' ? '\'' + node[1][2][0][1] + '\'' : node[1][2][0][1]},${node[1][2][1][1]})`,
                        `in_array(${node[1][2][0][0] === 'string' ? '"' + node[1][2][0][1] + '"' : node[1][2][0][1]}, ${node[1][2][1][1]})`,
                        `in_array(${node[1][2][0][0] === 'string' ? '\'' + node[1][2][0][1] + '\'' : node[1][2][0][1]}, ${node[1][2][1][1]})`,
                    ];

                    needles.forEach((needle) => {
                        if (line.indexOf(needle) !== -1) {
                            range.start.line = lineNo;
                            range.start.character = line.indexOf(needle);
                            range.end.line = lineNo;
                            range.end.character = line.indexOf(needle)+needle.length;
                        }
                    });
                });

                items.push(<InspectionItem>{
                    message: 'It is recommended to provide 3rd parameter to `in_array` so it performs type-safe comparison.',
                    severity: 3,
                    range: range,
                    replacement: `in_array(${node[1][2][0][0] === 'string' ? '\'' + node[1][2][0][1] + '\'' : node[1][2][0][1]}, ${node[1][2][1][1]}, true)`
                });
            }
        });

        return items;
    }

    private analyzeForAssignmentOperators(tree, content: string): InspectionItem[]
    {
        let items: InspectionItem[] = [];
        let raw = this.walkNodeTree(tree, (node) => {
            return this.isNodeOfType(node, 'if') && node[1][3] !== undefined && node[1][3][0] === 'set'
        });

        raw.forEach((node) => {
            items.push(<InspectionItem>{
                message: 'Possible bug, no comparison operator found in condition.',
                severity: 2,
                range: {
                    start: {
                        line: node[1][1][0],
                        character: node[1][1][1]
                    },
                    end: {
                        line: node[1][2][0],
                        character: node[1][2][1]
                    }
                }
            });
        });

        return items;
    }

    public analyzeForPossibleConditionOptimizations(tree, content: string): InspectionItem[]
    {
        let items: InspectionItem[] = [];
        let raw = this.walkNodeTree(tree, (node) => {
            if (this.isNodeOfType(node, 'if') && node[1][3] !== undefined && (node[1][2][0] === 'constant' || node[1][3][0] === 'constant')) {
                if ((node[1][2][1] === 'false' || node[1][2][1] === 'true') || (node[1][3][1] === 'false' || node[1][3][1] === 'true')) {
                    return true;
                }
            }
            return false;
        });

        raw.forEach((node) => {
            let expresionSign = '';
            switch (node[1][1]) {
                case '~':
                    expresionSign = '==';
                    break;
                case '!~':
                    expresionSign = '!=';
                    break;
                case '=':
                    expresionSign = '===';
                    break;
                case '!=':
                    expresionSign = '!==';
                    break;
            }

            // if (node[1][2])
            if (node[1][2][1] === 'false' || node[1][3][1] === 'false') {
                let inspectionItem = <InspectionItem>{
                    message: ''
                };
                let range = {
                    start: {line: 0, character: 0},
                    end: {line: 0, character: 0}
                }

                let needles = [
                    `(${node[1][2][1]} ${expresionSign} ${node[1][3][1]})`,
                    `( ${node[1][2][1]} ${expresionSign} ${node[1][3][1]} )`,
                    `(${node[1][2][1]}${expresionSign}${node[1][3][1]})`,
                    `( ${node[1][2][1]}${expresionSign}${node[1][3][1]} )`,
                ];

                needles.forEach((needle) => {
                    content.split("\n").forEach((line: string, lineNo: number) => {
                        if (line.indexOf(needle) !== -1) {
                            range.start.line = lineNo;
                            range.start.character = line.indexOf(needle);
                            range.end.line = lineNo;
                            range.end.character = line.indexOf(needle)+needle.length

                            inspectionItem.message =
                                `Condition could be refactored to \`${(['==', '==='].indexOf(expresionSign) !== -1) ?
                                    '(!' + (node[1][2][1].toLowerCase() === 'false' ? node[1][3][1] : node[1][2][1]) + ')' :
                                    '(' + (node[1][2][1].toLowerCase() === 'false' ? node[1][3][1] : node[1][2][1]) + ')'
                                }\` instead`;
                            inspectionItem.range = range;
                            inspectionItem.severity = 4;
                            inspectionItem.replacement = (['==', '==='].indexOf(expresionSign) !== -1) ?
                                '(!' + (node[1][2][1].toLowerCase() === 'false' ? node[1][3][1] : node[1][2][1]) + ')' :
                                '(' + (node[1][2][1].toLowerCase() === 'false' ? node[1][3][1] : node[1][2][1]) + ')';

                            items.push(inspectionItem);
                        }
                    });
                });
            }

            if (node[1][2][1] === 'true' || node[1][3][1] === 'true') {
                let inspectionItem = <InspectionItem>{
                    message: ''
                };

                let range = {
                    start: {line: 0, character: 0},
                    end: {line: 0, character: 0}
                };

                let needles = [
                    `(${node[1][2][1]} ${expresionSign} ${node[1][3][1]})`,
                    `( ${node[1][2][1]} ${expresionSign} ${node[1][3][1]} )`,
                    `(${node[1][2][1]}${expresionSign}${node[1][3][1]})`,
                    `( ${node[1][2][1]}${expresionSign}${node[1][3][1]} )`,
                ];

                needles.forEach((needle) => {
                    content.split("\n").forEach((line: string, lineNo: number) => {
                        if (line.indexOf(needle) !== -1) {
                            range.start.line = lineNo;
                            range.start.character = line.indexOf(needle);
                            range.end.line = lineNo;
                            range.end.character = line.indexOf(needle)+needle.length

                            inspectionItem.message =
                                `Condition could be refactored to \`${(['==', '==='].indexOf(expresionSign) !== -1) ?
                                    '(' + (node[1][2][1].toLowerCase() === 'true' ? node[1][3][1] : node[1][2][1]) + ')' :
                                    '(!' + (node[1][2][1].toLowerCase() === 'true' ? node[1][3][1] : node[1][2][1]) + ')'
                                }\` instead`;
                            inspectionItem.range = range;
                            inspectionItem.severity = 4;
                            inspectionItem.replacement = (['==', '==='].indexOf(expresionSign) !== -1) ?
                                '(' + (node[1][2][1].toLowerCase() === 'true' ? node[1][3][1] : node[1][2][1]) + ')' :
                                '(!' + (node[1][2][1].toLowerCase() === 'true' ? node[1][3][1] : node[1][2][1]) + ')';

                            items.push(inspectionItem);
                        }
                    });
                });
            }
        });

        return items;
    }

    public analyze(content: string): InspectionItemCollection
    {
        let ast = this.parser.parseCode(content);

        return {
            items: [].concat(
                this.analyzeForWeakEqualComparison(ast, content),
                this.analyzeForWeakNotEqualComparison(ast, content),
                this.analyzeForAssignmentOperators(ast, content),
                this.analyzeForPossibleConditionOptimizations(ast, content),
                this.analyzeForInArrayStrictParameter(ast, content)
            )
        };
    }
}
