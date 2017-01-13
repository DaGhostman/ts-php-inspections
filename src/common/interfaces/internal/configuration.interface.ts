/** @internal */
interface ParserConfigurationInterface
{
    extractDoc?: boolean;
    suppressErrors?: boolean;
}

/** @internal */
interface AstConfigurationInterface
{
    withPositions?: boolean;
}

/** @internal */
interface LexerConfigurationInterface
{
    short_tags?: boolean;
    asp_tags?: boolean;
}


/** @internal */
export interface Configuration
{
    parser?: ParserConfigurationInterface;
    ast?: AstConfigurationInterface;
    lexer?: LexerConfigurationInterface;
}
