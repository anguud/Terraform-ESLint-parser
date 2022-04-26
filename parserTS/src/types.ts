
import { AST } from 'eslint'

export interface Parent {
  parent?: any | null;
}

export interface BaseNodeTF extends Location {
  type: string
}

export interface Location {
  loc: SourceLocation
  range: [number, number]
}

export interface SourceLocation {
  start: Position
  end: Position
}

export interface Position {
  line: number
  column: number
  offset: number
}

export interface Token extends Location {
  type: string;
  value: string;
  parent: any;
}

export interface Statement extends Location, Parent {
  type: string;
  body: any;
  range: [number, number];
}

export interface Program extends Location, Parent {
  type: "Program";
  body: any[]
  tokens: Token[];
  comments?: Token[];
}


export interface Blockbody {
  body: any;
}

export interface Assignment extends Location, Parent {
  type: string;
  operator: string;
  left: any;
  right: any;
}
