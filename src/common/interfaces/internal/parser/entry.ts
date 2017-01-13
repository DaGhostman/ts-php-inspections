import { Node } from './node';

export interface Entry extends Node
{
    readonly key: string;
    readonly value: Node;
}
