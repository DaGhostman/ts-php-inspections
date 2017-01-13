/**
 * Interface representing a location range
 *
 * @internal
 */
export interface AstLocationRange
{
    /**
     * @type number
     */
    line: number;

    /**
     * Column relative to the line
     *
     * @type number
     */
    column: number;

    /**
     * Offset relative to the whole document
     *
     * @type number
     */
    offset: number;
}

/**
 * Represents a range of the current node
 *
 * @internal
 */
export interface AstLocation
{
    /**
     * Honestly no idea what this is
     *
     * @todo find appropriate type
     */
    source: string|null;
    /**
     * The range at which the node starts
     */
    start: AstLocationRange;

    /**
     * The range at which the node ends
     */
    end: AstLocationRange;
}

export interface AstNode
{
    kind: string;
    loc?: AstLocation;
}

export interface AstLiteral
{
    value: AstNode|string|number|boolean|null;
}

export interface AstMagic extends AstLiteral {}

export interface AstExpression extends AstNode {}

export interface AstLookup extends AstExpression
{
    what: AstExpression;
    offset: AstExpression;
}

export interface AstStatement extends AstNode {}
export interface AstDeclaration extends AstStatement
{
    name: string;
}

export interface AstBlock extends AstNode {
    children: AstNode[];
}

type AstIdentifierType =
    'uqn' |
    'qn' |
    'fqn' |
    'rn';

export interface AstIdentifier extends AstNode
{
    name: string;
    resolution: AstIdentifierType;
}

export interface AstVariable extends AstExpression
{
    name: string|AstNode;
    byRef: boolean;
}

export interface AstIf
{
    test: AstExpression;
    body: AstBlock;
    alternate: AstBlock|AstIf|null;
    shortForm: boolean;
}

export interface AstInclude extends AstNode
{
    target: AstNode;
    once: boolean;
    require: boolean;
}

export interface AstNamespace extends AstDeclaration
{
    withBrackets: boolean;
}

export interface AstInterface extends AstNode
{
    extends: AstIdentifier[];
    body: AstDeclaration[];
}

export interface AstClass extends AstInterface
{
    implements: AstIdentifier[];
    isAnnonymous: boolean;
    isAbstract: boolean;
    isFinal: boolean;
}

type VisibilityType =
    'private' |
    'protected' |
    'public';

export interface AstMethod extends AstNode
{
    isAbstract: boolean;
    isFinal: boolean;
    isStatic: boolean;
    visibility: VisibilityType;
}

export interface AstNew extends AstStatement
{
    what: AstIdentifier|AstVariable|AstClass;
    arguments: AstArguments[];
}

