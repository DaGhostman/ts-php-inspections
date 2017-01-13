import {Node} from './node';

export interface Error extends Node
{
    readonly mesage: string;
    readonly line: number;
    readonly token: number|string;
    readonly expected: string|string[];
}
