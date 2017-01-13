import { Node } from './node';

export interface Literal extends Node
{
    readonly value: Node|string|number|boolean|null;
}
