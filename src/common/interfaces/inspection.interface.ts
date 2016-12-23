import { InspectionItemCollection } from './inspectionItemCollection.interface';

export interface InspectionInterface
{
    analyze(content: string): InspectionItemCollection;
}
