import { InspectionRange } from './inspectionRange.interface';

export interface InspectionItem {
    message: string;
    severity: number;
    range: InspectionRange,
    replacement?: string
}
