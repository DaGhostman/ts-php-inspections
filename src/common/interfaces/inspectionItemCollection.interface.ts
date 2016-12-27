import { InspectionItem } from './inspectionItem.interface';
export interface InspectionItemCollection
{
    readonly targetFile?: string;
    readonly items: InspectionItem[];
    readonly mtime?: number;
}
