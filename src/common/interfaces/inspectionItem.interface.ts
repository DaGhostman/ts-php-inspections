import { InspectionRange } from './inspectionRange.interface';

export interface InspectionItem {
    readonly message: string;
    readonly severity: number;
    readonly range: InspectionRange;
    readonly replacement?: string;
}
