import { InspectionItemCollection, InspectionInterface, InspectionRange } from '../interfaces';

export abstract class BaseInspection implements InspectionInterface
{
    private _parser;
    private _config;
    private _strict: boolean;

    get parser() {
        return this._parser;
    }

    public getConfigurationNamespace(): string { return '';}

    set parser(parser) {
        throw 'Parser should not be modified!';
    }

    get config() {
        return this._config;
    }

    set config(configuration: any) {
        throw 'Configuration is a one-off process';
    }

    get strict() {
        return this._strict;
    }

    set strict(strict: boolean) {
        throw '"Strict mode" cannot be overwritten';
    }

    constructor(strict: boolean, configuration?: any) {
        this._strict = strict;
        this._config = configuration;
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
                range = <InspectionRange> {
                    start: {
                        line: lineNo,
                        character: line.indexOf(needle)
                    },
                    end: {
                        line: lineNo,
                        character: needle.indexOf('(') !== -1 ?
                            line.lastIndexOf(')') : line.indexOf(needle)+needle.length
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
