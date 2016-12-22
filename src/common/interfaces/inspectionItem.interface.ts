export interface InspectionItem {
    message: string;
    severity: number;
    range: {
        start: {line: number, character: number},
        end: {line: number, character: number}
    },
    replacement?: string
}
