import { BaseInspection } from '../common/inspections';
import {
    InspectionItem,
    InspectionItemCollection,
    InspectionInterface,
    InspectionRange
} from '../common/interfaces'

export interface EvalInspectionConfiguration {
    enabled?: boolean,
    severity?: number,
    message?: string
}

export class EvalInspection extends BaseInspection implements InspectionInterface
{
    constructor(strict: boolean, configuration?: EvalInspectionConfiguration)
    {
        super(strict, configuration);
    }

    public getConfigurationNamespace(): string
    {
        return 'clean_code.eval';
    }

    public analyze(content: string): InspectionItemCollection
    {
        if (this.isEnabled()) {
            return <InspectionItemCollection> {
                items: []
            }
        }

        let items: InspectionItem[] = [];
        content.split("\n").forEach((line: string, lineNo: number, lines) => {
            if (line.indexOf('eval(') !== -1) {
                if (!this.strict && lines[lineNo-1].indexOf('@suppressInspection') !== -1 && lines[lineNo-1].indexOf(this.getConfigurationNamespace()) !== -1) {
                    return;
                }

                items.push(<InspectionItem>{
                    message: this.config !== null ? (this.config.message !== undefined ? this.config.message : 'Eval is evil') : 'Eval is evil',
                    severity: this.config !== null ? (this.config.severity !== undefined ? this.config.severity : 2) : 2,
                    range: <InspectionRange>{
                        start: {
                            line: lineNo,
                            character: line.indexOf('eval(')
                        },
                        end: {
                            line: lineNo,
                            character: line.lastIndexOf(')')
                        }
                    }
                });
            }
        });

        return <InspectionItemCollection> {
            items: items
        }
    }
}