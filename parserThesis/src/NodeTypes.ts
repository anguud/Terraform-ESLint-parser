/**
 * 
 * Wait until typescript 
 * 
define types of nodes:   
*  Program 
*  Node interface
*  Location interface 
*  Position interface
*  etc..
* 
*  see: https://github.com/estree/estree/blob/master/es5.md
*/ 

export const NodeTypes {

    interface Node {
        type: string,
        loc: SourceLocation || null;
    },
}

interface Node {
    type: string;
    loc: SourceLocation | null;
}