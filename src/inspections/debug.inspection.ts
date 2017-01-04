import { BaseInspection } from './../common/inspections/base.inspection';
import { InspectionItem, InspectionItemCollection, InspectionInterface } from './../common/interfaces';

export class DebugInspection extends BaseInspection implements InspectionInterface {
    private items: string[] = [
        'print_r',
        'var_export',
        'var_dump',
        'debug_zval_dump',
        'debug_print_backtrace',
        'phpinfo',
        'error_log',
        'dump',
        'debug'
    ];

    constructor(strict, config)
    {
        super(strict, config);

        this.items = this.items.filter((item) => {
            return this.config.whitelist.indexOf(item) === -1;
        });
    }

    public getConfigurationNamespace(): string
    {
        return 'clean.debug';
    }

    private checkForDebugFunctionCalls(tree, content: string): InspectionItem[]
    {
        let items: InspectionItem[] = [];
        let raw = this.walkNodeTree(tree, (node) => {
            return this.isNodeOfType(node, 'call');
        });

        raw.forEach((node) => {
            if (node[1][0] === 'ns' && this.items.indexOf(node[1][1][0]) !== -1) {
                items.push(<InspectionItem>{
                    message: `Possible debug statement \`${node[1][1][0]}\``,
                    severity: 3,
                    range: this.getRange(content, `${node[1][1][0]}(`) || this.getRange(content, `${node[1][1][0]} (`)
                });
                return;
            }

            if (node[1][0] === 'static' && (this.items.indexOf(node[1][3]) !== -1 || node[1][2][1].indexOf('Debug') !== -1)) {
                items.push(<InspectionItem>{
                    message: `Possible debug statement \`${node[1][2][1].join('\\')}::${node[1][3]}\``,
                    severity: 3,
                    range: {
                        start: {line: 0, character: 0},
                        end: {line: 0, character: 0}
                    }
                });
                return;
            }

            if (node[1][0] === 'prop' && this.items.indexOf(node[1][2][1]) !== -1) {
                items.push(<InspectionItem>{
                    message: `Possible debug statement \`${node[1][1][1]}->${node[1][2][1]}\``,
                    severity: 3,
                    range: {
                        start: {line: 0, character: 0},
                        end: {line: 0, character: 0}
                    }
                });
                return;
            }
        });

        return items;
    }

    private checkForDebugCalls(tree, content: string) {
        let items = [];
        let raw = this.walkNodeTree(tree, (node) => {
            return (
                this.isNodeOfType(node, 'class') || this.isNodeOfType(node, 'trait')
            );
        });

        raw.forEach((node) => {
            if (node[0] === 'class') {
                items = items.concat(this.checkForDebugFunctionCalls(node[5].methods, content));
            }

            if (node[0] === 'trait') {
                items = items.concat(this.checkForDebugFunctionCalls(node[4].methods, content));
            }
        });

        return items;
    }

    public analyze(content: string): InspectionItemCollection {
        let ast = this.parser.parseCode(content);

        let collection: InspectionItemCollection = { items: [].concat(
            this.checkForDebugFunctionCalls(ast, content),
            this.checkForDebugCalls(ast, content)
        )};

        return collection;
    }
}
