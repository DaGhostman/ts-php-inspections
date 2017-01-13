import { Node } from './node';

export interface Block extends Node
{
    readonly children: Node[];
}
