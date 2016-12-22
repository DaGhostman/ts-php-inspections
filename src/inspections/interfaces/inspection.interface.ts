import { InspectionItemCollection } from '../../common/interfaces';

export interface InspectionInterface
{
    analyze(content: string): InspectionItemCollection;
}
