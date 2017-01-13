import { InspectionItemCollection, InspectionInterface, InspectionRange } from '../interfaces';
import { Configuration as ParsrerConfiguration }  from './../interfaces/internal/configuration.interface';
import { Parser } from './../../../php-parser';

export abstract class BaseInspection implements InspectionInterface
{
    private _parser: Parser;
    private _config;
    private _strict: boolean;

    get parser(): Parser {
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
        this._config = this.getConfigurationForNamespace(configuration);
        let parser = require('php-parser');
        this._parser = new parser(<ParsrerConfiguration>{
            parser: {
                extractDoc: true,
                suppressErrors: true
            },
            ast: {
                withPositions: true
            },
            lexer: {
                shortTags: true
            }
        });
    }

    private getConfigurationForNamespace(configurations: any): any
    {
        let pointer = configurations;
        let valid = true;

        if (configurations !== undefined) {
            this.getConfigurationNamespace().split('.').forEach((key) => {
                if (valid) {
                    valid = pointer.hasOwnProperty(key)
                }

                if (valid) {
                    pointer = pointer[key];
                }
            });
        }

        return pointer === configurations ? null : pointer;
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
        return (typeof node !== type);
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

    protected isEnabled() {
        return (this.config !== null && this.config.enabled !== undefined && !this.config.enabled);
    }

    abstract analyze(content: string): InspectionItemCollection;
}
