/**
 * Interface representing a location range
 *
 * @internal
 */
export interface LocationRange
{
    /**
     * @type number
     */
    readonly line: number;

    /**
     * Column relative to the line
     *
     * @type number
     */
    readonly column: number;

    /**
     * Offset relative to the whole document
     *
     * @type number
     */
    readonly offset: number;
}

/**
 * Represents a range of the current node
 *
 * @internal
 */
export interface Location
{
    /**
     * Honestly no idea what this is
     *
     * @todo find appropriate type
     */
    readonly source: string|null;
    /**
     * The range at which the node starts
     */
    readonly start: LocationRange;

    /**
     * The range at which the node ends
     */
    readonly end: LocationRange;
}
