import { Parameter } from './parameter';
import { Identifier } from './identifier';
import { Declaration, Visibility } from './declaration';
import { Node } from './node';

export interface Trait extends Declaration {
    extends: Identifier | null;
    implements: Identifier[];
    body: Declaration[];
}

export interface Alias extends Node {
    trait: Identifier|null;
    method: string;
    as: string;
    visibility: Visibility|null;
}

export interface Precedence extends Node
{
    trait: Identifier|null;
    method: string;
    instead: Identifier[];
}

export interface Use extends Node
{
    traits: Identifier[];
    adaptations: Node[]|null;
}
