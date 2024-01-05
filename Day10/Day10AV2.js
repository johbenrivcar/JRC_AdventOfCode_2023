"use strict";

/**
 * Day 8A
 */

const fs = require("fs");

// Throughout, the directions NESW are converted to integers 0123 for indexing
const dir2Index = "NESW";

// gives the row/column increments that apply for each direction of movement N S E or W, and 
// the direction into the next node that results from that movement.
// e.g. for a move N, move -1 row and 0 col, coming from the S
//                              N:r  c  d   E:r  c  d   S:r  c  d   W:r  c  d
const directionIncrements = [  [ -1, 0, 2], [ 0, 1, 3], [ 1, 0, 0], [ 0,-1, 2] ];


// The array of numbers indicate the entry point on the NEXT cell indexed by your entry point on THIS cell
// The entry and exit points are numbered 0-N, 1-E, 2-S, 3-W
// -1 indicates no entry
// So for example, if I enter from the south (2) into a cell containing the pipe shape "7", then the exit point 
// will be west (3).
const moves = { 
    "|":[ 0, -1,  2, -1 ], 
    "-":[-1,  2, -1,  3] , 
    "L":[ 1,  0, -1, -1], 
    "J":[ 3, -1, -1,  0], 
    "7":[-1, -1,  3,  2], 
    "F":[-1,  0,  3, -1]
}


// Index change gives the change to the current row and column needed to make entry to
// the next cell given the entry point to the next cell.
// So, if I an entering from the west (3), then I need to change my current row by 0 and col by +1
const indexChanges=[ [ 1, 0], [ 0, -1], [-1 , 0], [ 0, 1] ];

// The array of cells making up the whole 2-d space of the landscape of the Pipe Maze
const wholeField = [];


function main10a(){
    console.log("Starting 10A -----------------------------------------------------------------");

    // load the input file
    var data = fs.readFileSync('Day10Input.txt', 'utf8');
    
    // Convert the input text into an array, each entry is one line
    let txt = data.toString();
    let lines = txt.split("\r\n");
    let startCell = null;
    console.log(lines);

    wholeField = lines.map( (line,rowIx)=>{

        let row = line.split('').map( (char,colIx)=>{
            let n = new Node( rowIx, colIx, char) ;

            if(char=="S") startCell = n;
            return n;

        });

        return row;
    });


    wholeField.forEach( (fieldRow, rowIX) =>{
        fieldRow.forEach( (cell, colIX)=>{
            
            cell.neighbours = [
                //N
                    rowIX>0? 
                        wholeField[rowIX-1][colIX]
                        : null,
                //E
                    colIX>0? 
                        wholeField[rowIX][colIX+1]
                        : null,

                //S
                    rowIX<wholeField.length-1 ? 
                            wholeField[rowIX+1][colIX]
                        : null,

                //W
                    colIX<fieldRow.length-1 ? 
                        wholeField[rowIX][colIX-1]
                        : null

                ];

            //let ixChange = indexChanges[cell.pType];

        });

    } );
        


    reportField(wholeField);

    let cell = startCell;

    //let cellChain = [ {startRC, cell} ];
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
    var gridLine="    v0        v10       v20       v30       v40       v50       v60       v70       v80       v90       v100      v110      v";
           
    field.forEach((row,rowIx)=>{
        if(rowIx%10===0){
           
            console.log(gridLine);
        }
        let rowLine1 = `   ${rowIx} `.slice(-4) ;
        row.forEach( (cell, colIx)=>{
            rowLine1+= cell.pType
        })
        console.log(rowLine1)
    })

}
    

// CLASS DECLARATIONS

class Node{
    /**
     * 
     * @param {int} r - the row index
     * @param {int} c - the column index
     * @param {char} pType - char representing the type of pipe
     */
    row = 0;
    col = 0;
    pType = "";
    ports = [];
    pipe = null;

    constructor( r, c, pType ){
        this.row = r;
        this.col = c;
        this.pType = pType;

        if(pType){
            this.pipe = new Pipe(this, pType)
        };

    };

    connect(){
        if(!this.pipe) return null;
        if(this.pipe.startPipe) return null;

        this.plugIn( ports.N );
        this.plugIn( ports.E );
        this.plugIn( ports.S );
        this.plugIn( ports.W );

    }

    /**
     * Attempts to plug the pipe contained in this node into the 
     * neighbouring nodes via two of the four ports. The two ports to
     * be used are those that the pipe's shape allows for. Plugging in
     * requires a corresponding valid port on the neighbouring node,
     * which must also have a pipe shape that requires plugging in through
     * the adjacent port.
     *   node -- pipe >> port -- port << pipe -- node
     * @param {Port} port 
     * @returns {boolean} true if plugin was successful, false if not
     */
    plugIn( port ){
        if(!port) return false;
        if(port.isPluggedIn) return true;

        // find the neighbouring node to which I can try to plug in
        let adjNode = wholeField[this.row + port.canLinkTo[0]][this.col + port.canLinkTo[1]];

        // the direction of the required port
        let lookingForPort = port.canLinkTo[2];
        // get the adjacent port that corresponds to the given port
        let requiredPort = adjNode.ports[lookingForPort];
        if(!requiredPort) return false;

        requiredPort.isPluggedIn=true;
        requiredPort.connectedTo=port;
        port.isPluggedIn=true;
        port.connectedTo=requiredPort;
        return true;
    }

    unPlug( port ){
        if(!port) return;
        if(!port.isPluggedIn) return;
        port.connectedTo.release();
        port.release();
    }

}

class Pipe{
    owner=null;

    constructor(node, pipeShape){
        let ports = node.ports;
        this.owner = node;
        switch(pipeShape){
            case "J": 
                ports[0] = new Port(this,"N") ;
                ports[3] = new Port(this,"W") ;
                break;
            case "|":
                ports[0] = new Port(this,"N");
                ports[2] = new Port(this,"S");
                break;
            case "L":
                ports[0] = new Port(this,"N");
                ports[1] = new Port(this,"E");
                break;
            case "-":
                ports[3] = new Port(this,"W");
                ports[1] = new Port(this,"E");
                break;
            case "7":
                ports[3] = new Port(this,"W");
                ports[2] = new Port(this,"S");
                break;
            case "F":
                ports[1] = new Port(this,"E");
                ports[2] = new Port(this,"S");
                break;
            case "S":
                this.startPipe = true;
                break;
            default:
                throw new Error(`Invalid port type [${pipeShape}]`);
        }
    }
};

function newPort(pipe, dir){
    return new Port(pipe, dir)
}
class Port{
    dir;
    pipe;
    canLinkTo;
    isPluggedIn = false;
    isConnectedTo;

    constructor(dir, pipe){
        this.dir=dir;
        this.pipe=pipe;
        this.canLinkTo=directionIncrements[dir];
    };

    release(){
        this.isPluggedIn = false;
        this.isConnectedTo = null;

    }
}



main10a();

