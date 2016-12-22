import { InspectionItem } from './inspectionItem.interface';
export interface InspectionItemCollection
{
    targetFile?: string;
    items: InspectionItem[];
    mtime?: number;
}
