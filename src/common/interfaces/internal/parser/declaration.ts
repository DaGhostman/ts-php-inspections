import { Node } from './node';

export type Visibility = "public" | "private" | "protected";

export interface Declaration extends Node
{
    readonly isAbstract: boolean;
    readonly isFinal: boolean;
    readonly isStatic: boolean;
    readonly visibility: Visibility;
}


