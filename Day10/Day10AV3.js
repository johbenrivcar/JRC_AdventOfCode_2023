"use strict";

/**
 * Day 8A
 */
// just add a tile address string in the form "r.c" to this array to have
// that tile reported at various points in the code, for debugging
const monitor=[ "60.61" , "42.4", "43.4"]
const monitoredTiles = [];


const fs = require("fs");


// Throughout, the directions NESW are converted to integers 0123 for indexing
// Directions are important to establishing the actual route through the whole
// pipe circuit. By convention N is up S is down etc. etc.
const dirIndex = "NESW";
function dirChar2Ix(char){ return dirIndex.indexOf(char)};
function dirIx2Char(ix){ return dirIndex.charAt(ix)};

// Translate pipe shape into an index number
const pipeIndex = "|-LJ7F.S";
function pipeChar2Ix(char){return pipeIndex.indexOf(char);}
function pipeIx2Char(ix){return pipeIndex.charAt(ix)};

// Maps the next move, given the last move
// and the index of the pipe shape of the current tile.
const moveAndPipe2NextMove = [
//  N> |   -   L   J   7   F   .   S
//  N> N               W   E
    [  0, -1, -1, -1,  3,  1, -1, -1],
//  E>     E       N   S
    [ -1,  1, -1,  0,  2, -1, -1, -1],
//  S> S       E   W  
    [  2, -1,  1,  3, -1, -1, -1, -1],
// W>      W   N           S
    [ -1,  3,  0, -1, -1,  2, -1, -1]
]


// The whole field as a 2-d array
//var wholePipeField = [];
const everyTile = [];
const tileCollection = {}; // indexed on string "r.c"

// creates a tile index string from row and column numbers
function rc2TileIx(r,c){ return `${r}.${c}` };

// every tile has four corners, indexed in the same way as the tiles, but shared between them.
// by convention the corner at top left of a tile has the same row and column index as the tile, which
// means that the corner at the bottom left (SE) is at row+1 and col+1.
// Corners are shared between tiles, so the bottom right corner is the bottom left of the next tile to the
// right and the top right of the next tile down etc. etc.
const everyCorner = []; // array of every corner
const cornerIndex ={}; // indexed using string r.c

function main10a(){
    console.log("Starting 10A -----------------------------------------------------------------");

    // load the input file
    //var data = fs.readFileSync('Day10TestInput3.txt', 'utf8');
    var data = fs.readFileSync('Day10TestInput3.txt', 'utf8');
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
            let tileKey = rc2TileIx(rowIx, colIx); 

            // create the next new tile in the row
            let tile = {ix: tileKey, r: rowIx, c: colIx, p: char, pi: pipeChar2Ix(char) , corners: { }, moveDirection:".", isMonitored:  monitor.includes(tileKey)} ;
            // Add to monitored list if being monitored
            if(tile.isMonitored) monitoredTiles.push( tile );

            // Add to the tile collections;
            everyTile.push(tile);
            tileCollection[ tileKey ] = tile;

            // keys of the four corners
            let NWCornerIx = rc2TileIx( rowIx,     colIx );
            let NECornerIx = rc2TileIx( rowIx,     colIx + 1);
            let SECornerIx = rc2TileIx( rowIx + 1, colIx + 1 );
            let SWCornerIx = rc2TileIx( rowIx + 1, colIx);

            // Set up the four corners.
            let cornerKeys = [ 
                {label: "NW", key: NWCornerIx}, 
                {label: "NE", key: NECornerIx}, 
                {label: "SE", key: SECornerIx}, 
                {label: "SW", key: SWCornerIx}
            ] 

            cornerKeys.forEach((ck, ix)=>{
                
                // get the corner using key, if it's already been created
                let corner = cornerIndex[ck.key];

                // if not created already, then create the corner
                if(!corner){
                    // by default, all corners are initially set to "outside"
                    // add to the corner index on "r.c"
                    cornerIndex[ck.key] = corner = { key: ck.key, zone: "O" };
                    // add to the list of all corners
                    everyCorner.push(corner)
                };

                // add the corner to the tile's collection of four corners
                tile.corners[ck.label]=corner;
                //node.corners = cornerKeys;

            })

            // Check if this is the start cell, which has char S
            if(char=="S") startTile = tile;

            if (tile.isMonitored) reportTile(`A`, tile);


        });

    });


    // We know by definition that all the top corners of 
    // row 0 and left corners of col 0 are definitely outside
    // the pipe loop.

    // find the first available exit from the start
    let startR =  startTile.r;
    let startC = startTile.c;
    // create the indexes of the four neighbouring tiles up, right, down and left
    let upIndex = rc2TileIx(startR - 1, startC);
    let downIndex = rc2TileIx(startR + 1, startC);
    let leftIndex = rc2TileIx(startR, startC - 1);
    let rightIndex = rc2TileIx( startR, startC + 1);
    let moveDirection = -1;

    console.log(`Starting cell`, startTile)

    // We need to check the shapes of the pipes in adjacent cells to see
    // which directions we can move out of the starting cell.
    if(startR>0) switch( tileCollection[upIndex].p ){
        case "7":
        case "|":
        case "F":
            // can go north
            moveDirection = 0;
    }
    if(moveDirection<0) if(startC+1 < colCount )switch( tileCollection[rightIndex].p ){
            
        case "J":
        case "-":
        case "7":
            // can go east
            moveDirection = 1;
    }

    if(moveDirection < 0) if(startR+1 < rowCount) switch( tileCollection[downIndex].p ){

        case "J":
        case "|":
        case "L":
            // can go south
            moveDirection = 2;
    }

    if(moveDirection<0) if(startC > 0) switch( tileCollection[leftIndex].p){
        case "L":
        case "-":
        case "F":
            // can go west
            moveDirection = 3;
    }

    // Set the move direction on the start cell.
    let firstMoveDirection = startTile.moveDirection = moveDirection;

    // check that the first move has been found
    reportTile("startCell", startTile);
    if(firstMoveDirection<0) throw new Error("Could not find a valid move from the start tile");

    // Set the current cell in the path to the
    // starting cell and make it the first cell
    // in the path through the pipes
    var currentTile = startTile;
    let pathTiles = [ startTile ];
    if(currentTile.isMonitored) reportTile("B", currentTile)

    // This is the furthest left node detected in the path so far.
    var leftmostTileInPath=currentTile;

    let pathStepCount = 0;
    let pathLoopIsComplete = false;

    do{
        // note, currentTile holds the tile we are stepping OUT of

        // increment the number of steps
        pathStepCount++;

        // Get row and column from the current cell, so that we can work
        // out which cell we will step into. This depends on the direction.
        let nextRow = currentTile.r;
        let nextCol = currentTile.c;
        moveDirection = currentTile.moveDirection;

        // Convert move direction (a number) into a symbol (just for easy recognition)
        let moveSymbol = currentTile.moveSymbol = "^>v<".charAt(moveDirection);

        // Adjust the next row or next column depending on the move direction.
        // Part B: Also mark the corners that we pass with left or right to
        // reflect which side of the pipe route they lie. 
        switch( moveDirection ){
            case 0: // heading north
                currentTile.corners.NW.zone = "L"; // top left corner
                currentTile.corners.NE.zone = "R"; // top right corner
                currentTile.zone = "+"
                nextRow--;
                break;
            case 1: // heading East
                currentTile.corners.NE.zone = "L"; // top right corner
                currentTile.corners.SE.zone = "R"; // bottom right corner
                currentTile.zone = "+"
                nextCol++;
                break;
            case 2: // heading south
                currentTile.corners.SE.zone = "L"; // bottom right corner
                 currentTile.corners.SW.zone = "R"; // bottom left corner
                 currentTile.zone = "+"
                nextRow++;
                break;
            case 3: // heading west
                currentTile.corners.SW.zone = "L"; // // bottom left corner
                currentTile.corners.NW.zone = "R"; // top left corner
                nextCol--;
                currentTile.zone="+"
                break;
            default:
                console.log(`Direction error at step ${pathStepCount}`, currentTile);
                throw new Error(`Move direction is invalid ${moveSymbol} (${moveDirection})`)
        };

        
        if(currentTile.isMonitored) reportTile("C", currentTile);

        let nextTileIx = rc2TileIx(nextRow, nextCol );

        let nextTile = tileCollection[nextTileIx];

        // mark it to show that it is on the pipe route, add it to the history
        nextTile.isOnPath = true;

        // Check if this is furthest left so far.
        if( nextTile.c < leftmostTileInPath.c ) leftmostTileInPath = nextTile;

        // Check if we are back at the start tile
        pathLoopIsComplete = nextTile.ix === startTile.ix;

        // Add the next tile to the path
        if(!pathLoopIsComplete) pathTiles.push(nextTile);

       
        // We have to set the default corner zones for the next cell based on the previous move 
        // direction, as if we were travelling straight on through the cell. If we are turning Right or Left, then
        // the zones will be changed on the corners to the left or right, as above, in the next loop.
        switch( moveDirection ){
            case 0: // heading north
                nextTile.corners.NW.zone = "L"; // top left corner
                nextTile.corners.NE.zone = "R"; // top right corner
                break;
            case 1: // heading East
                nextTile.corners.NE.zone = "L"; // top right corner
                nextTile.corners.SE.zone = "R"; // bottom right corner
                break;
            case 2: // heading south
                nextTile.corners.SE.zone = "L"; // bottom right corner
                nextTile.corners.SW.zone = "R"; // bottom left corner
                break;
            case 3: // heading west
                nextTile.corners.SW.zone = "L"; // // bottom left corner
                nextTile.corners.NW.zone = "R"; // top left corner
                break;
            default:
                reportTile("Move direction error", currentTile );
                throw new Error(`Move direction is invalid ${moveDirection}`)
        }

        // Now derive the new direction depending on the direction we moved in
        // and the shape of the pipe in the cell.
        let newMoveDirection = moveAndPipe2NextMove[moveDirection][nextTile.pi]
        //console.log( `${count} - Moving ${dir2Index.charAt(moveDirection)} into pipe ${cell.p}, therefore out towards ${dir2Index.charAt(newMoveDirection)}`);
        nextTile.moveDirection = newMoveDirection;
        
        currentTile = nextTile;
        
        if(currentTile.isMonitored) reportTile("D", currentTile);
        if(pathStepCount>999999) break;
    } 
    // Carry on until we get back to the start cell
    while ( !pathLoopIsComplete )
    
    // Now we can determine which side of the path is Outside or Inside of the loop, by looking at the direction of the
    // leftmost node. The pathsides object is set to translate L and R into I and O accordingly.
    // Whatever side is the NW corner of the leftmost tile, that is the OUTSIDE of the loop.
    let pathSides = { L: leftmostTileInPath.corners.NW.zone=="L"? "O" : "I", R: leftmostTileInPath.corners.NW.zone=="R"? "O" : "I" };

    console.log(`pathSides at definition`, pathSides )

    // Now run round the path changing the L and R zones on the corners to I and O depending
    // on the pathSides.
    monitoredTiles.forEach(node=>{
        reportTile("F0", node);
    })

    function setCornerZone( corner ){
        let newZone = pathSides[corner.zone];
        if(newZone) corner.zone = newZone;
    }
    pathTiles.forEach(tile=>{
        let keys = Object.keys(tile.corners);
        keys.forEach(key=>{
            setCornerZone(tile.corners[key])
        });
    })


    monitoredTiles.forEach(node=>{
        reportTile("F1", node);
    })

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

            if(tile.isMonitored) reportTile("E", tile);
           
        } 
    });

    monitoredTiles.forEach(node=>{
        reportTile("F2", node);
    })

    // // Now all cells have their corners set to the correct zones, one of O or I, indicating on the
    // // left or right of the pipe route or inside or outside. 
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
    everyTile.forEach( node=>{
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
        insideCount+= node.zone=="I"? 1 : 0;
        outsideCount+= node.zone=="O"? 1: 0;
        if(node.isMonitored) reportTile("H", node)
    })

    console.log(`There are ${insideCount} nodes contained within the whole path`);

    //Now generate the map based on the route through the history
    var prv;
    var imageIndex={">>": "EE", ">^": "EN", ">v": "ES", "vv": "SS", "v<": "SW", "v>": "SE", "^^": "NN", "^<": "NW", "^>": "NE", "<<": "WW", "<v": "WS", "<^": "WN"}

    pathTiles.forEach( (node,ix)=>{
        if(ix==0){
            prv=node.moveSymbol; 
            return}
        
        let jump = prv + node.moveSymbol;

        if(!imageIndex[jump]){
            //console.log(`Could not find image for jump=${jump}`);
        }
        let imageName = imageIndex[jump] + ".png";
        
        node.imageName = imageName
        
        prv=node.moveSymbol;

       
        if(node.isMonitored) reportTile("J", node)
        
    })

    startTile.imageName = "start.png"

    halfwayNode.imageName = "halfway.png"

    // Now create an html file with the map
    //                 ( nodeCount, pathNodeCount, outsideNodeCount, insideNodeCount, halfwayNode, halfwayStepNumber)
    let htmlStats = statsDiv( everyTile.length, pathStepCount, outsideCount, insideCount, halfwayNode.ix, pathStepCount/2);

    let htmlMapTable = ``;

    for(let rowIx = 0; rowIx < rowCount; rowIx++) {
        
        let sRow = `${("    " + rowIx).slice(-4)}:  `
        let tableRow = "";
        for (let colIx = 0; colIx < colCount; colIx++){
            let tileIx=rc2TileIx(rowIx, colIx);
            let tile = tileCollection[tileIx]
            if(!tile.imageName){
                tile.imageName= tile.zone=="I"? "inside.png" : "outside.png";
            }
            sRow+=tile.zone;
            tableRow+= td( tile.ix, tile.corners, img( tile.imageName ));
        };
        
        htmlMapTable+=tr(tableRow);
    };
    
    let htmlPage = page( htmlStats + mapTable( htmlMapTable ) + keyDiv() )
    //console.log(html)
    // Part B

    fs.writeFile('map.html', htmlPage, function (err) {
        if (err) throw err;
        console.log('Map written!');
    });

};

var headerRow = `<th style="width: 10px; display: none;" ></th>`.repeat(141);

main10a();

function page( body ){ return "<html><head></head><body>" + body + "</body></html>" };

function keyDiv(){
    return `<div style="font-family: courier new; font-size: 10pt;"><b>Key</b><br/>
    <img src="images/start.png" style="height: 10px; width: 10px;"/>Start 
    <img src="images/halfway.png" style="height: 10px; width: 10px;"/>Halfway 
    <img src="images/outside.png" style="height: 10px; width: 10px;"/>Outside
    <img src="images/inside.png" style="height: 10px; width: 10px;"/>Inside
    </div>`
}

function mapTable( rows ){ return `<table style=" border-style: solid; border-color: green; border-width: 1px; border-collapse: collapse;" >${ headerRow }` + rows + `</table>` }

function tr( tds ){ return `<tr style="border-style: solid; border-width:0; ">` + tds + "</tr>"}

function td( id, corners, content ){ return `<td style=" border-style: solid; border-color: green; border-width: 0px; border-collapse: collapse; padding: 0px;"  id="${id}" corners="${corners.NW.zone + corners.NE.zone + corners.SE.zone + corners.SW.zone}">` + content + "</td>"}

function div( content ){ return "<div>" + content + "</div>"}

function img( filename ){ return `<img src="images/${filename}" style="width:10px; height: 10px;" />` }

function reportTile(tag, tile){
    console.log(`M ${tile.ix} [${tag}] zone: ${tile.zone} direction: ${tile.moveDirection} corners: NW-${tile.corners.NW.zone} NE-${tile.corners.NE.zone} SE-${tile.corners.SE.zone} SW-${tile.corners.SW.zone}`)
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