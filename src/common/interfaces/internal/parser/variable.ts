import { Node } from './node';

export interface Variable extends Node
{
    readonly name: string;
    readonly byRef: boolean;
}
