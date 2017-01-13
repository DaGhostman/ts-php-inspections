import { Declaration, Visibility } from './declaration';
import {Node} from './node';

export interface Property extends Declaration
{
    isFinal: boolean;
    isStatic: boolean;
    visibility: Visibility;
    value: Node|null;
}
