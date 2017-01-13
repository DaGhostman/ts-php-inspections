import { Block } from './block';
import { Expression } from './expression';
import { Node } from './node';
import { Statement } from './statement';

export interface Condition extends Statement {
    readonly test: Expression;

}

export interface If extends Condition {
    readonly alternate?: Block | If | null;
    readonly body: Block;
    readonly shortForm: boolean;
}

export interface Ternary extends Condition
{
    readonly trueExpr: Expression;
    readonly falseExpr: Expression;
}

export interface Switch extends Condition {
    readonly body: Block;
    readonly shortForm: boolean;
}

export interface Case extends Node {
    readonly test?: Expression | null;
    readonly body?: Block | null;
}

export interface Break extends Node {
    readonly level?: number | null;
}
