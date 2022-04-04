export interface Token {
    type: (string | RegExp),
    value: string,
    loc: {
        start: Location,
        end: Location
    },
    range: [number, number]
}

export interface Location {
    line: number,
    column: number,
    offset: number
}