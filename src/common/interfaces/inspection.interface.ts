import { InspectionItemCollection } from './inspectionItemCollection.interface';

export interface InspectionInterface
{
    getConfigurationNamespace(): string;
    analyze(content: string): InspectionItemCollection;
}
