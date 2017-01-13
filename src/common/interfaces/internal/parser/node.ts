import { Location } from './_location';

export interface Node
{
    readonly kind: string;
    readonly loc?: Location;
}
