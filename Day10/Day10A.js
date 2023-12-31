"use strict";

/**
 * Day 8A
 */

const fs = require("fs");

const allNodes = {};
// The array of numbers indicate the entry point of the NEXT cell indexed by your entry point on THIS cell
// The entry and exit points are numbered 0-N, 1-E, 2-S, 3-W
// -1 indicates no entry
const moves = { 
    "|":[ 0, -1, 2, -1 ], 
    "-":[-1, 2, -1, 3] , 
    "L":[ 1, 0,-1,-1], 
    "J":[ 3,-1,-1,0], 
    "7":[-1,-1,3,2], 
    "F":[-1, 0, 3, -1]

}
// Index change gives the change to the current row and column needed to make entry to
// the next cell given the entry point to the next cell.
const indexChanges=[ [1, 0], [0,-1],[ -1 , 0], [ 0, 1 ] ];

const wholeField = [];

function main10a(){
    console.log("Starting 9B -----------------------------------------------------------------");

    // load the input file
    var data = fs.readFileSync('Day10Input.txt', 'utf8');
    
    // Convert the input text into an array, each entry is one line
    let txt = data.toString();
    let lines = txt.split("\r\n");
    let startRC;
    console.log(lines);

    lines.forEach( (line,ix)=>{
        let start = line.indexOf(`S`);
        let row = line.split('');
        wholeField.push(row);
        if( start > -1 ){
            startRC = [ ix, start ]
            console.log(`Start is at  ${startRC}`);
        };
    });

    let moveField = [];

    let newField = wholeField.forEach( (inRow, rowIX) =>{
        let outRow = inRow.map( (cell, colIX)=>{
            
            if( cell == "S" ){
                console.log ( `Start is at ${rowIX}, ${colIX}`)
                let neighbours = [
                        rowIX>0? wholeField[rowIX-1][colIX]: null,
                        colIX>0? wholeField[rowIX][colIX+1]: null,
                        rowIX<wholeField.length-1? wholeField[rowIX+1][colIX]: null,
                        colIX<inRow.length-1? wholeField[rowIX][colIX-1]: null
                    ];
                console.log(`Start neighbours:`, neighbours)
            }
            let ixChange = indexChanges[cell];
            return { cell};
        })
        return outRow
    } )


    reportField(wholeField);

    let currentCell = startRC;
    let cell = wholeField[startRC[0]][startRC[1]];

    let cellChain = [ {startRC, cell} ];
    let f, t;
    let row = startRC[0];
    let col = startRC[1];
    switch(cell){
        case "|":
             f=2; t=0; break;
        case "J":
            t=0; f=3; break;
        case "L":
            t=0; f=1; break;
        case "F":
            f=2; t=1; break;
        case "7":
            f=3; t=2; break;
        case ".":
            f=-1; t=-1; break;
        case "-": f=3; t=1; break;
        default:
            throw new Error( "Could not find from/to for starting cell");    
    }
    const to2rcIncrement = [ [-1,0], [0,1], [1, 0], [0, -1] ];
    do {
        let nr, nc;
        let nextFrom = [ 2, 3, 0, 1 ][t];
        let incr = to2rcIncrement[t]
        nr = row + incr[0]
        nc = col + incr[1];
        if( nr < 0 || nc < 0 ) throw new Error(`ERROR - Moved off the board at ${row},${col}`)
        let nextCell = wholeField[nr][nc];

        t = 0;
    } while (true);

    //let ixChange = indexChange[ ]
    //do{

    //} while ( currentCell != startRC );
    let connections = wholeField.map( (row,rowIx)=>{
        return  row.map( (cell, colIx) =>{
            let cellUp, R, D, L;
            if(rowIx>0) cellUp=wholeField[rowIx-1][colIx];
            if(colIx>0) L=wholeField[rowIx][colIx-1];
            if(rowIx<wholeField.length-1) D=wholeField[rowIx+1][colIx];
            if(colIx<row.length-1) R=wholeField[rowIx][colIx+1];

            let connxCount = 0;
            if(cellUp) connxCount+= checkConnection("U", cell, cellUp);
            if(R) connxCount+= checkConnection("R", cell ,R);
            if(D) connxCount+= checkConnection("D", cell ,D);
            if(L) connxCount+= checkConnection("L", cell ,L);

            if( rowIx === 137 ){
                console.log(`[${rowIx}.${colIx}] >${cell}< U=${ cellUp? cellUp : "." } R=${R? R : "."} D=${D? D : "."} $L=${L? L : "."}`)
            }

            return connxCount;
        });
        
    });
    reportField(connections);
    let changesMade = false;
    do{

        let changesMade = false;
        connections.forEach( (row,rowIx)=>{
            row.forEach( (conx,colIx)=>{
                
                if(conx<2){
                    if(rowIx>0) if(connections[rowIx]-1) {

                    }
                }
            })
        })


    } while (changesMade);
};




const dirTo = { U: ["|JL"] };
const dirFrom = {};
function checkConnection( dir, from, to ){
    switch( dir ){
        case "R":
            switch(from){
                case "-":
                case "F":
                case "L":
                    switch (to){
                        case "-":
                        case "J":
                        case "7":
                            return 1;
                    }
            }
            return 0;
        case "U":
            switch(from){
                case "|":
                case "J":
                case "L":
                    switch (to){
                        case "|":
                        case "F":
                        case "7":
                            return 1;
                    }
            };
            return 0;
        
        case "D":
            switch(from){
                case "|":
                case "F":
                case "7":
                    switch (to){
                        case "|":
                        case "J":
                        case "L":
                            return 1;
                    }
            };
            return 0;
        
        case "L":

            switch(from){
                case "-":
                case "J":
                case "7":
                    switch (to){
                        case "-":
                        case "F":
                        case "L":
                            return 1;
                    }
            }
            return 0;

        default:
            return 0;

    }
}
//==================================
//
// REPORTING
//

function reportField(field){ 
    var gridLine="    +0        +10       +20       +30       +40       +50       +60       +70       +80       +90       +100      +110      +";
           
    field.forEach((row,rowIx)=>{
        if(rowIx%10===0){
           
            console.log(gridLine);
        }
        let rowLine = `   ${rowIx} `.slice(-4) + row.join("");
        console.log(rowLine)
    })

}
    
main10a();