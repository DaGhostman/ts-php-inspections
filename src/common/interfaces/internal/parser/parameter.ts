import { Identifier } from './identifier';
import {Declaration} from './declaration';

export interface Parameter extends Declaration
{
    type: Identifier|null;
    value: Node|null;
    byRef: boolean;
    variadic: boolean;
    nullable: boolean;
}
