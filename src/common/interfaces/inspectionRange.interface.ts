export interface InspectionRange {
    readonly start: {
        readonly line: number,
        readonly character: number
    },
    readonly end: {
        readonly line: number,
        readonly character: number
    }
}
