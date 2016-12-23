import { InspectionItemCollection, InspectionInterface, InspectionRange } from '../interfaces';

export abstract class BaseInspection implements InspectionInterface
{
    private _parser;

    get parser() {
        return this._parser;
    }

    set parser(parser) {
        throw 'Parser should not be modified!';
    }

    constructor() {
        this._parser = require('php-parser')
            .create({
                parser: {
                    locations: true,
                    suppressErrors: true,
                    extractDoc: true,
                }
            });
    }

    protected getRange(content: string, needle: string): InspectionRange
    {
        let range: InspectionRange = null;

        content.split("\n").forEach((line: string, lineNo: number) => {
            if (range === null && line.indexOf(needle) !== -1) {
                range = {
                    start: {
                        line: lineNo+1,
                        character: line.indexOf(needle)
                    },
                    end: {
                        line: lineNo+1,
                        character: needle.indexOf('(') !== -1 ?
                            line.lastIndexOf(')')+1 : line.indexOf(needle)+needle.length
                    }
                }
            }
        });

        return range;
    }

    protected isNodeOfType(node: any, type: string)
    {
        node = node || [];
        if (typeof node !== 'object' ||  node[0] === undefined) {
            return false
        }

        if (node[0] === type) {
            return true;
        }

        return false;
    }

    protected walkNodeTree(ast: any, callback: (node: any) => boolean)
    {
        let extract = [];
        for (let node of ast) {
            let isValid = callback(node);
            if (isValid) {
                extract.push(node);
            }

            if (!isValid && typeof node === 'object') {
                if (node !== null) {
                    extract = extract.concat(this.walkNodeTree(node, callback));
                }
                continue;
            }
        }

        return extract;
    }

    abstract analyze(content: string): InspectionItemCollection;
}
