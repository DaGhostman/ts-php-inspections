import { Expression } from './expression';
import { Node } from './node';
import { Statement } from './statement';

export interface Loop extends Statement
{
    body: Statement;
    shortForm: boolean;
}

export interface For extends Loop {
    readonly init: Expression[];
    readonly test: Expression[];
    readonly increment: Expression[];
    readonly body: Statement;
    readonly shortForm: boolean;
}

export interface Foreach extends Loop {
    readonly source: Expression;
    readonly key?: Expression|null;
    readonly value: Expression;
}

export interface While extends Loop
{
    readonly test: Expression;
}

export interface Continue extends Node
{
    level?: number|null;
}
