import { Node } from './node';

type IdentifierResolutionType =
    'uqn' | 'qn' | 'fqn' | 'rn';

export interface Identifier extends Node
{
    readonly name: string;
    readonly resolution: IdentifierResolutionType;
}
