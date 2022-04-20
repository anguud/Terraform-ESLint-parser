export interface Token {
  type: string;
  value: string;
  loc: {
    start: Location;
    end: Location;
  };
  range: [number, number];
  parent: any;
}

export interface Location {
  line: number;
  column: number;
  offset: number;
}

export interface Statement {
  type: string;
  body: any;
  loc: {
    start: Location;
    end: Location;
  };
  range: [number, number];
  parent: any;
}

export interface Blockbody {
  body: any;
}

export interface Assignment {
  type: string;
  operator: string;
  left: any;
  right: any;
  loc: {
    start: Location;
    end: Location;
  };
  range: [number, number];
  parent: any;
}
