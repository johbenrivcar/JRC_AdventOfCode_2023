"use strict";

/**
 * Day 8A
 */
const fs = require("fs"); 

// stdin_test.js


// directions
const X = "X";
const N = "N";
const E = "E";
const S = "S";
const W = "W";
const NW = "NW";
const NE = "NE";
const SE = "SE";
const SW = "SW";

function oppositeDirection(direction){
    let o = "";
    direction.split("").forEach( char=>{o+= "NSEWX".charAt( "SNWEX".indexOf(char) );} );
    return o;
}

console.log(`Opposites: SE:${oppositeDirection(SE)}`);

class Point{
    r= 0;
    c= 0;
    id = 0;
    string = `0,0`;
    constructor( r, c ){
        this.setRC(r,c)
    };

    setRC(r, c){
        this.r=r;
        this.c=c;
        this.id= r*1000+c;
        this.string = `${r}.${c}`;
    }
    setR(r){
        this.setRC(r,this.c);
    }
    setC(c){
        this.setRC(this.r,c);
    }

    adjacentPoint(direction){
        switch(direction){
            case N:  return new Point(this.r-1, this.c); break;
            case E:  return new Point(this.r, this.c+1); break;
            case S:  return new Point(this.r+1, this.c); break;
            case W:  return new Point(this.r, this.c-1); break;
            case NW: return new Point(this.r-1, this.c-1); break;
            case NE: return new Point(this.r-1, this.c+1); break;
            case SE: return new Point(this.r+1, this.c+1); break;
            case SW: return new Point(this.r+1, this.c-1); break;
            default:
        }
    };

    getCornerPoint( direction , verbose=false){
        if(verbose) console.log(`...calculating corner point in direction ${direction} from ${this.r + "," + this.c}`)
        let r = this.r + (direction==SE || direction==SW ? 1 : 0) ;
        if(verbose) console.log(`    row ${this.r} was changed to ${r}`)
        let c = this.c + (direction==NE || direction==SE ? 1 : 0);
        if(verbose) console.log(`    col ${this.c} was changed to ${c}`)
        return new Point(r,c);
    }
    
    toString(){ return `[${this.string}]`;};

};

const cornerDirections = [ NW, NE, SE, SW ];

// Maps the next move, given the last move
// and the index of the pipe shape of the current tile.
const validMoveTable ={
    "N|":N,
    "N7":W,
    "NF":E,
    "E-":E,
    "EJ":N,
    "E7":S,
    "S|":S,
    "SL":E,
    "SJ":W,
    "W-":W,
    "WL":N,
    "WF":S
};

function calcNextMove(lastMove, pipe){
    let nm = validMoveTable[lastMove + pipe];
    if(!nm) return null;
    return nm;
}

// The whole field as a 2-d array, stored in an object where the key is a number r * 1000 + c
//var wholePipeField = [];
const everyTile = [];
const tileDict = {}; // indexed on key calculated by rc2TileIx

// CORNERS ---
// Every tile has four corners, indexed by Row and Column in the same way as the tiles. Each corner is
// shared between four tiles.
// By convention the corner at NW (top left) of a tile has the same row and column indexes as the tile,
// which means that the corner at the SE (bottom right) is at row+1 and col+1.
// Corners are shared between tiles, so the SE corner of a tile is the SW of the next tile to the
// right and the NE of the tile below, etc. etc.
//                             
// tile x-1,y-1 |               | tile x-1, y   |               | tile x-1,y+1  |
//  ____________|'''''''''''''''|_______________|'''''''''''''''|_______________|
//            :                   :           :                   :
//            :    corner x,y     :           :   corner x,y+1    :
//  __________:__                _;___________;__                _;_____________
//   tile x,y-1 |               | tile x,y      |               | tile x,y+1    |
//              |'''''''''''''''|               |'''''''''''''''|               |
//  ____________|               |_______________|               |_______________|
//
const everyCorner = []; // array of every corner
const cornerMap = new Map(); // indexed using key calculated r*1000+c


// A Tile represents one of the grid of locations in which a pipe could be located.
// Each tile is a) on the pipe path that forms a ring, b) outside the path ring
// or c) inside the path ring. The Tile has four corners. Each corner is shared with
// three other Tiles in the grid whose corners meet at the same crossing point.
class Tile{
    moveDirection=X; // for a tile on the path, this indicates the direction taken OUT of the tile.
    prevTile = null; // points to the previous tile in the path
    zone = null;
    point = null;

    // Contructs a tile at a given point with given pipe character (shape)
    constructor(point, p){
        this.point = point;
        this.id = point.id;
        this.r = point.r; 
        this.c = point.c; 
        this.p = p; // pipe character from input data
        this.isMonitored = monitor.includes(this.point);
        if(p=="S") this.isMonitored = true;
        if(this.isMonitored) monitoredTiles.push( this );

        this.corners= { }; 
        cornerDirections.forEach( (direction, ix)=>{
            if(this.isMonitored) console.log( `Setting corner on ${this.id} in direction ${direction} from ${this.point.toString()}...`);
            let cornerPoint = this.point.getCornerPoint(direction, this.isMonitored);
            if(this.isMonitored) console.log( `.... corner point [${cornerPoint.toString()}]`)
            let corner = Corner.getCorner( cornerPoint );
        
            if(this.isMonitored) console.log( `.... corner [${corner.toString()}]`)
            this.corners[direction] = corner;
        })

        this.changeZone(unknownZone);

        // Add to the tile collections;
        everyTile.push(this);
        tileDict[ this.id ] = this;

    };

    makeMove(){
        this.changeZone(pathZone);
        this.moveDirection = calcNextMove(this.prevTile.moveDirection, this.p);
        let nextPoint = this.point.adjacentPoint(this.moveDirection);
        this.nextTile = getTile(nextPoint);
        nextTile.prevTile = this;
        return nextTile;
    };

    isOpenInMoveDirection(direction){
        console.log(`Checking valid move ${direction + this.p}?`)
        return validMoveTable[direction + this.p]? true: false;
    }

    changeZone( newZone ){
        if(this.zone) this.zone.removeTile( this );
        this.zone = newZone;
        newZone.addTile( this );
        // In here we will add the logic that propagates a zone from
        // top left corner to other corners if this tile is not on a path
        // and from the top right and bottom left if this tile is on
        // the path and we know whether they are to left or right of the
        // path.
        
    }



    reportToLog(tag){
        console.log(`At [${tag}] ${this.toString()}`);
    };
    toString(){
        let out=`Tile ${this.id}= zone: ${this.zone.name}, direction: ${this.moveDirection} corners:{ `
        cornerDirections.forEach(key=>{
            out+= (this.corners[key]? key + ": " + this.corners[key].toString() : "") + " ";
        })
        return out + "}"
    };

    neighbour(direction){
        return Tile.getTile( this.point.adjacentPoint(direction) );
    }

    static getTile(point){
        return tileDict[ point.id ];
    };
}

class PipeConnector{
    constructor( pipe, direction ){

    }
    pipes = {};
    connect(tile){

    };

}

class Corner{
    point;
    key; 
    zone; 
    constructor(point){
        this.point = point;
        this.r = point.r;
        this.c = point.c;
        this.id = point.id;
        this.zone = unknownZone;

        // add to the corner index
        cornerMap.set(point.id, this);
        // add to the list of all corners
        everyCorner.push(this)

    };
    toString(){
        return `+${this.point.toString()} ${this.zone.info()}+`;
    };
    static getCorner(point){
        let corner = cornerMap.get( point.id );
        if(!corner){
            corner = new Corner(point)
        }
        return corner;
    };
};

// Zone badges are used to mark corners as being to left 
// or right of the path. If a tile is not on the path, then all
// its corners must be in the zame zone. A tile that is on the
// path is not to the left or right, it is in the pathZone.
class Zone{
    I=0;
    L=0;
    io="U";
    name="U";
    tileMembers = new Set();

    constructor(name){
        this.name=name;
    };

    info(){
        return `lrp:${this.lrp} io:${this.io}`;
    };

    tiles = [];
    addTile(tile){
        this.tileMembers.add(tile.id);
    }
    removeTile(tile){
        this.tileMembers.delete(tile.id);
    }
};

// just add a tile address to this array to have
// that tile reported at various points in the code, for debugging
//
const monitor=[ new Point(60,61) , new Point(42,4), new Point(43,4) ];
const monitoredTiles = [];

// These are the only instances of Zone, they are shared across
// all the tiles and corners that are in the same zone
const unknownZone = new Zone("U");
const leftZone = new Zone("L");
const rightZone = new Zone("R");
const pathZone = new Zone("P"); // only used for tiles that are on the path


function main10a(){
    console.log("Starting 10A -----------------------------------------------------------------");

    // load the input file
    //var data = fs.readFileSync('Day10TestInput3.txt', 'utf8');
    var data = fs.readFileSync('Day10Input.txt', 'utf8');
    console.log("data", data);

    // Convert the input text into an array, each entry is one line
    let inputLines = data.toString().split("\r\n");

    let startTile = null;
    
    let rowCount = inputLines.length;
    let colCount = inputLines[0].length;
        

    // Bulid the whole field of tiles from the input file.
    // Each char of the input maps to a tile with the pipe shape from the input.
    inputLines.forEach( (line,rowIx)=>{
        // add a blank column at the front of the tho whole field, to make
        // sure that 
        //line =  line;
        line.split('').forEach( (char,colIx)=>{

            // create the next new tile in the row
            let tile = new Tile( new Point(rowIx, colIx) , char)

            // Check if this is the start cell, which has char S
            if(char=="S") startTile = tile;
            if (tile.isMonitored) tile.reportToLog(`A`);

        });

    });


    // We know by definition that all the top left & right corners of 
    // row 0 and left top and bottom corners of col 0 are definitely outside
    // the pipe loop, but we don't yet know if they are on the left or the right
    // of the pipes.

    // To find the first available exit from the start tile we need to check the
    // pipe shapes of its neighbouring tiles.  
    // Get the four neighbouring tiles up N, right E, down S and left W
    let nTile = startTile.neighbour(N);
    nTile.reportToLog("nTile");
    let sTile = startTile.neighbour(S);
    sTile.reportToLog("sTile");
    let eTile = startTile.neighbour(E);
    eTile.reportToLog("eTile");
    let wTile = startTile.neighbour(W) ;
    wTile.reportToLog("wTile");

    startTile.reportToLog("startTile");

    let firstMoveDirection = X;

    // We need to check the shapes of the pipes in adjacent cells to see
    // which direction we can move out of the starting cell.

    switch( true ){
        case wTile && wTile.isOpenInMoveDirection(W): firstMoveDirection = W; break;
        case sTile && sTile.isOpenInMoveDirection(S): firstMoveDirection = S; break;
        case eTile && eTile.isOpenInMoveDirection(E): firstMoveDirection = E; break;
        case nTile && nTile.isOpenInMoveDirection(N): firstMoveDirection = N; break;
        default:
            startTile.reportToLog("startTile invalid");
            throw new Error("Cannot find a valid move from the start tile")
    };

    // Set the move direction on the start cell.
   startTile.changeZone(pathZone);
   startTile.moveDirection = firstMoveDirection
   startTile.isOnPath = true;

    // check that the first move has been found
    reportTile("startCell", startTile);

    // Set the current cell in the path to the
    // starting cell and make it the first cell
    // in the path through the pipes
    var currentTile = startTile;
    let pathTiles = [ startTile ];
    if(currentTile.isMonitored) currentTile.reportToLog("B")

    // set the initial direction for the stepping loop.
    let moveDirection = firstMoveDirection;

    // This is the furthest left node detected in the path so far.
    var leftmostTileInPath=currentTile;

    let pathStepCount = 0;
    let pathLoopIsComplete = false;
return;



    do{
        // note: at the start of this loop, currentTile
        // holds the tile we are stepping OUT of

        // increment the number of steps
        pathStepCount++;

        // Get row and column from the current tile, so that we can work
        // out which tile we will step into. This depends on the direction.
        let nextRow = currentTile.r;
        let nextCol = currentTile.c;
        moveDirection = currentTile.moveDirection;

        // Adjust the next row or next column depending on the move direction.
        // Part B: Also mark the corners that we pass with left or right to
        // reflect which side of the pipe route they lie. 
        switch( moveDirection ){
            case N: // heading north
                currentTile.corners.NW.zone = leftZone; // top left corner
                currentTile.corners.NE.zone = rightZone; // top right corner
                nextRow--; // move up a row (North)
                break;
            case E: // heading East
                currentTile.corners.NE.zone = leftZone; // top right corner
                currentTile.corners.SE.zone = rightZone; // bottom right corner
                nextCol++; // move to the right (East)
                break;
            case S: // heading south
                currentTile.corners.SE.zone = leftZone; // bottom right corner
                 currentTile.corners.SW.zone =rightZone; // bottom left corner
                nextRow++; // move down a row (South)
                break;
            case W: // heading west
                currentTile.corners.SW.zone = leftZone; // // bottom left corner
                currentTile.corners.NW.zone = rightZone; // top left corner
                nextCol--; // move left (West)
                break;
            default:
                console.log(`Direction error at step ${pathStepCount}`, currentTile);
                throw new Error(`Move direction is invalid ${moveDirection}`)
        };

        currentTile.zone = pathZone;
        if(currentTile.isMonitored) reportTile("C", currentTile);

        // Now we can get the next tile in the path
        let nextTile = tileDict[ rc2TileId( nextRow, nextCol )];

        // mark it to show that it is on the pipe route
        nextTile.isOnPath = true;

        // Check if this is furthest left so far.
        if( nextTile.c < leftmostTileInPath.c ) leftmostTileInPath = nextTile;

        if(currentTile.isMonitored) reportTile("D", currentTile);

        // Check if we are back at the start tile
        pathLoopIsComplete = nextTile.id === startTile.id;

        // Add the next tile to the path
        if(!pathLoopIsComplete) {
            pathTiles.push(nextTile);
            
            // We have to set the default corner zones for the next cell based on the previous move 
            // direction, as if we were travelling straight on through the cell. If we are turning Right or Left, then
            // the zones will be changed on the corners to the left or right, as above, in the next loop.
            switch( moveDirection ){
                case N: // heading north
                    nextTile.corners.NW.zone = leftZone; // top left corner
                    nextTile.corners.NE.zone = rightZone; // top right corner
                    break;
                case E: // heading East
                    nextTile.corners.NE.zone = leftZone; // top right corner
                    nextTile.corners.SE.zone = rightZone; // bottom right corner
                    break;
                case S: // heading south
                    nextTile.corners.SE.zone = leftZone; // bottom right corner
                    nextTile.corners.SW.zone = rightZone; // bottom left corner
                    break;
                case W: // heading west
                    nextTile.corners.SW.zone = leftZone; // // bottom left corner
                    nextTile.corners.NW.zone = rightZone; // top left corner
                    break;
                default:
                    reportTile("Move direction error", currentTile );
                    throw new Error(`Move direction is invalid ${moveDirection}`)
            }

            // Now derive the new direction depending on the direction we moved in
            // and the shape of the pipe in the cell.
            let newMoveDirection = calcNextMove(moveDirection, nextTile.p);

            //console.log( `${count} - Moving ${dir2Index.charAt(moveDirection)} into pipe ${cell.p}, therefore out towards ${dir2Index.charAt(newMoveDirection)}`);
            nextTile.moveDirection = newMoveDirection;
            
            currentTile = nextTile;
            
            if(pathStepCount>999999) break;
        }
    } 
    // Carry on until we get back to the start cell
    while ( !pathLoopIsComplete )
    
    // Now we can determine which side of the path is Outside or Inside of the loop, by looking at the direction of the
    // leftmost node. The pathsides object is set to translate L and R into I and O accordingly.
    // Whatever side is the NW corner of the leftmost tile, that is the OUTSIDE of the loop.


    let outsideZone = leftmostTileInPath.corners.NW.zone

    let insideZone = unknownZone;
    if(outsideZone.lrp=="L" ) insideZone = rightZone;
    if(outsideZone.lrp=="R" ) insideZone = leftZone;
    if(insideZone.lrp =="U") throw new Error("Could not establish the outside and inside zones" );
    
    
    outsideZone.O = 1;
    outsideZone.inOut = "O";
    insideZone.I=1;
    insideZone.inOut = "I";

    console.log("Outside zone:", outsideZone);

    console.log("Inside zone:", insideZone);
    
                // // Now run round the path changing the L and R zones on the corners to I and O depending
                // // on the pathSides.
                // monitoredTiles.forEach(node=>{
                //     reportTile("F0", node);
                // })

                // function setCornerZone( corner ){
                //     let newZone = pathSides[corner.zone];
                //     if(newZone) corner.zone = newZone;
                // }
                // pathTiles.forEach(tile=>{
                //     let keys = Object.keys(tile.corners);
                //     keys.forEach(key=>{
                //         setCornerZone(tile.corners[key])
                //     });
                // })


                // monitoredTiles.forEach(node=>{
                //     reportTile("F1", node);
                // })

    // Mark the top left corner of the top left tile to the Outide zone.
    Corner.getCorner(new Point(0,0)).zone = outsideZone;

    
    // Now we just have to propagate the corners for all cells that are not on the pipe route. These
    // have no moveDirection. Each tile's zone is determined by the zone of its top left corner.

    // Ensure the corners of every node that is not on the path
    // has all its corners set to the zone of the top left corner,
    // so that the inside and outside areas are fully populated
    // with zoned nodes.
    everyTile.forEach(tile=>{
        if( !tile.isOnPath ){
            // set all the corners to the zone of the top left corner
            let cc = tile.corners;
            tile.zone = cc.NE.zone = cc.SE.zone = cc.SW.zone = cc.NW.zone;

            if(tile.isMonitored) tile.reportToLog("E");
           
        } 
    });

    monitoredTiles.forEach(tile=>{
        tile.reportToLog("F2");
    })

    // Now all cells have their corners set to the correct zones, one of L or R, indicating on the
    // left or right of the pipe route. 
    // everyCorner.forEach( corner=>{

    //     switch( corner.zone ){
    //         case "L": corner.zone = pathSides.L; break;
    //         case "R": corner.zone = pathSides.R; break;
    //     }
    // })

    // monitoredTiles.forEach(node=>{
    //     reportTile("G", node);
    // })

    console.log("From Start tile we went in direction", firstMoveDirection );
    console.log(`Part A: Count ${pathStepCount}, therefore furthest point is ${pathStepCount/2}`)
    let halfwayNode = pathTiles[pathStepCount/2];

    // Finally resolve all those nodes that are adjacent to the path
    let insideCount = 0;
    let outsideCount = 0;
    everyTile.forEach( tile=>{
        // if(!node.isOnPath){
        //     node.zone = node.corners.NW.zone;
        // };
        // switch(node.zone){
        //     case "L":
        //     case "R":
        //         node.zone = pathSides[node.zone];
        // }
        // if(!node.isOnPath){
        //     node.corners.SE.zone = node.corners.SW.zone = node.corners.NE.zone = node.zone;
        // };
        tile.class = tile.zone.io ;
        insideCount+= tile.zone.I
        outsideCount+= tile.zone.O
        if(tile.isMonitored) reportTile("H", tile)
    })

    console.log(`There are ${insideCount} nodes contained within the whole path`);

    //Now generate the map based on the route through the history
    var prv;
    pathTiles.forEach( (tile,ix)=>{
        if(ix==0){
            prv=tile.moveDirection; 
            return;
        };
        

        tile.class = prv + tile.moveDirection;

        // if(!pathClassIndex[jump]){
        //     console.log(`Could not find class for jump=${jump}`);
        //     reportTile( "JE", node);
        //     throw new Error(`Could not find class for jump=${jump}`)
        // };

        
        
        prv = tile.moveDirection;

        if(tile.isMonitored) reportTile("J", tile)
        
    })

    startTile.class = "start"

    halfwayNode.class = "halfway"

    // Now create an html file with the map
    //                 ( nodeCount, pathNodeCount, outsideNodeCount, insideNodeCount, halfwayNode, halfwayStepNumber)
    let htmlStats = statsDiv( everyTile.length, pathStepCount, outsideCount, insideCount, halfwayNode.ix, pathStepCount/2);

    let htmlMapTable = ``;

    for(let rowIx = 0; rowIx < rowCount; rowIx++) {
        
        //let sRow = `${("    " + rowIx).slice(-4)}:  `
        let tableRow = "";
        for (let colIx = 0; colIx < colCount; colIx++){
            let tileIx = rc2TileId(rowIx, colIx);
            let tile = tileDict[tileIx]

            tableRow+= tdTile( tile );
        };
        
        htmlMapTable+=tr(tableRow);
    };
    
    let htmlPage = page( htmlStats + mapTable( htmlMapTable ) + keyDiv(pathSides) )
    //console.log(html)
    // Part B

    fs.writeFile('map.html', htmlPage, function (err) {
        if (err) throw err;
        console.log('Map written!');
    });

};

var headerRow = `<th style="width: 10px; display: none;" ></th>`.repeat(141);

main10a();

function page( body ){ return `<html>
<head>
    <link rel="stylesheet" href="images/day10_style.css">
</head>
<body>` + body + "</body></html>" };

function keyDiv(ps){
    return `<div style="font-family: courier new; font-size: 10pt;"><b>Key</b><br/>
    <img src="images/start.png" style="height: 10px; width: 10px;"/>Start 
    <img src="images/halfway.png" style="height: 10px; width: 10px;"/>Halfway 
    <img src="images/${ps.O=='L'? 'left': 'right'}.png" style="height: 10px; width: 10px;"/>Outside
    <img src="images/${ps.I=='L'? 'left': 'right'}.png" style="height: 10px; width: 10px;"/>Inside
    </div>`
}

function mapTable( rows ){ return `<table style=" border-style: solid; border-color: green; border-width: 1px; border-collapse: collapse;" >${ headerRow }` + rows + `</table>` }

function tr( tds ){ return `<tr style="border-style: solid; border-width:0; ">` + tds + "</tr>"}

function tdTile( tile ){ return `<td  id="t${tile.id/1000}"  class="${tile.class}" style=" border-style: solid; border-color: green; border-width: 0px; border-collapse: collapse; padding: 0px;" corners="${tile.corners.NW.zone.io + tile.corners.NE.zone.io + tile.corners.SE.zone.io + tile.corners.SW.zone.io }"><div class="tileDiv"> </div></td>`}

function div( content ){ return "<div>" + content + "</div>"}

function img( filename ){ return `<img src="images/${filename}" style="width:10px; height: 10px;" />` }

function reportTile(tag, tile){
    tile.reportToLog(tag);    
}

function statsDiv( nodeCount, pathNodeCount, outsideNodeCount, insideNodeCount, halfwayNode, halfwayStepNumber){
    return `
<div>
<h3>Statistics</h3>
<pre>
         Node count: ${nodeCount}
        Path length: ${pathNodeCount}
            Outside: ${outsideNodeCount}
             Inside: ${insideNodeCount}
    Halfway node at: ${halfwayNode}
       Halfway step: ${halfwayStepNumber}

</pre></div>`;

};

