// Day 10 async script
function consoleLog(...args){
    console.log(...args);
}
// const { link } = require("fs");
var logIds = [ tileKey(5,1) ]; //[ tileKey(4,4), tileKey(4,5), tileKey(1,3) ];
consoleLog(`Logging turned on for`, logIds);
var fileInputElement
var fileDisplayElement
var footerElement
var tileInfoElement

var dtLoad = new Date();
var inputInfo = {};

var allTilesDict = {};
var allGridSquares = {};

var gridSquareSize = 20;
var gridTileSize = 20;

var actionQueue = new ActionQueue;
actionQueue.addAction(()=>{ consoleLog("Action queue is working") }, 0);
actionQueue.run();


const dirN = "dirN";
const dirS = "dirS";
const dirE = "dirE";
const dirW = "dirW";

function oppositeDir(dir) {
    switch(dir){
        case dirN: return dirS;
        case dirE: return dirW;
        case dirW: return dirE;
        case dirS: return dirN;
        default:
            throw new Error(`Given direction not recognised ${dir}`);
    };
};

/**
 * Pipeinfo provides basic data about the connectivity and appearance of a
 * pipe when placed in a tile. These data are used to determine how a
 * tile is displayed in the grid, and how it can be connected to pipes
 * in neighbouring tiles.
 */
const pipeInfo = {
    ".": { directions: [ ] , class: `pNone`},
    "|": { directions: [ dirN, dirS ], class:  `pNS` },
    "-": { directions: [ dirE, dirW ], class:  `pEW` },
    "J": { directions: [ dirN, dirW ], class:  `pNW` },
    "L": { directions: [ dirN, dirE ], class:  `pNE` },
    "F": { directions: [ dirS, dirE ], class:  `pSE` },
    "7": { directions: [ dirS, dirW ], class:  `pSW` },
    "S": { directions: [ dirN, dirE, dirS, dirW ], class:  `pSTRT` }
};



/** Returns the pipe information corresponding to the given pipe character */
function getPipeInfoFromChar(char){
    return pipeInfo[char] ? pipeInfo[char] : {} ;
};


function logEvent(type, eventData, userData){ consoleLog( `E[${type}]`, userData, eventData) };

function initEventStreams(){
        
    new EventStream("sysEvents");
    /** tileEvents are raised when something changes on a tile. The events 
     * are keyed on the type of event followed . then the tile key. */
    new EventStream("tileEvents");

    sysEvents.on("*", logEvent, "sys")
    tileEvents.on("*", logEvent, "tile")
    consoleLog("Event streams created");
}
initEventStreams();

/**
 * This is run when the initial page load is complete
 */
function runDay10Script(){
    //alert(`Running`)
    
    let msg = `Today's date is ${dtLoad.toISOString()}`;
    writeToDiv( "date_disp",  msg) ;

    consoleLog(`Starting ====================================`)
    
    // Get references to the dialog for loading the grid data
    fileInputElement = document.getElementById('fileInput');
    // add a listener for when the user chooses a file to be
    // loaded.
    fileInputElement.addEventListener('change', fileInput_change);

    /** JQuery references to screen display elements */
    fileDisplayElement = $('#file-display-area');
    footerElement = $(`#footer`);
    tileInfoElement = $(`#tile-info`);

}

/**
 * Runs when the input file has been selected by the user.
 * 
 * Loads the selected file and displays content to the user
 */
function fileInput_change() {
    var file = fileInputElement.files[0];
    consoleLog(`file`, file);

    // check that a text file was chosen
    var textType = /text.*/;
    if (file.type.match(textType)) {
        // get the file content
        var reader = new FileReader();
        reader.onload = 
            /** async function to display the data read from the file */
            function(e) {

                /** Get the whole file content from the reader */
                inputInfo.fileContent = reader.result;

                consoleLog(`fileContent`, inputInfo.fileContent)

                /** display content to the user
                 *  so the user can check; */
                displayDataToUser();

            }

        // start the async reading process
        reader.readAsText(file);    

    } else {
        /** could not read the file */
        fileDisplayElement.html(  "File not supported!" ) ;
    }

};


/**
 * Run after the input file has been chosen and loaded, to display
 * the raw content of the file to the user. This also reveals the
 * button "Run this input" to the user so the user can choose
 * to run the process to render the grid.
 */
function displayDataToUser(){
    //consoleLog(`data received` , readData);

    /** Put the whole content into the screen display element */
    fileDisplayElement.html(inputInfo.fileContent);
    let lineBreak = ``
    switch(true){
        case inputInfo.fileContent.includes(`\r\n`): lineBreak=/\r\n/g; break;
        case inputInfo.fileContent.includes(`\r`): lineBreak=/\r/g; break;
        default: lineBreak = /\n/g; 
    }

    inputInfo.lines = inputInfo.fileContent.split( lineBreak );
    inputInfo.rowsCount = inputInfo.lines.length;

    // Assuming that all lines in the file have the same length!!
    inputInfo.colsCount = inputInfo.lines[0].length;

    consoleLog(`${inputInfo.rowsCount} lines`);
    consoleLog(`Line length: ${inputInfo.colsCount}`);

    footerElement.html( `${inputInfo.rowsCount} rows x ${inputInfo.colsCount} cols` );

    // If there is at least one line, show the [run input] button
    switch( true ){
        case inputInfo.rowsCount==0:
        case inputInfo.colsCount==0:
            hideById(`btn-run-input`);
            break;
        default:
            showById(`btn-run-input`);
    }
    
    showByClass(`fileDisplayArea`);

}


/**
 *  Button click when the user confirms that they want to load the displayed data 
 * */
function btnRunInput_click(){
    runLoadedInput();
};


/** 
 * Create the display grid and start the whole grid loading process 
 * */
function runLoadedInput(){
    consoleLog(">> runLoadedInput")
    /** Hide the displayed file content and show the grid map area */
    hideById("data-load-area")
    showById("field-map-area")

    /** Generate the grid html elements in the display area */
    generateGridHTML(  );

    /** Async build the the grid elements objects that connect to the display grid */
    // setTimeout( ()=>{
    //     buildGridElementIndex();
    // }, 10);
    consoleLog("Adding first action...");
    actionQueue.addAction( buildGridElementIndex , 0);

    consoleLog("Running...");

    actionQueue.run();

}







/** User has selected the <Back button which goes
 *  back to the file selection and load panel */
function selectNewFile(){
    hideById("field-map-area")
    showById("data-load-area")
};



/** UTILITY FUNCTIONS FOR SHOWING AND HIDING ELEMENTS ON THE DISPLAY PANEL */
function hideById(id){
    consoleLog(`hiding ${id}`);
    $(`#${id}`).addClass("hidden");
}

function showById(id){
    $(`#${id}`).removeClass("hidden");
}
function hideByClass(cls){
    $(`.${cls}`).addClass("hidden");
}
function showByClass(cls){
    $(`.${cls}`).removeClass("hidden");
}

function getByClass(cls){
    consoleLog(`Selecting all elements by class [${cls}]`);
    return $(`.${cls}`);
}

/** Creates the complete HTML map of the grid,
 *  with the row/column count 
 *  taken from the input text file
 */
function generateGridHTML(gridSizePX=20, rows=inputInfo.rowsCount, cols=inputInfo.colsCount){
    consoleLog(">>generateGridHTML")
    //let grid = `<div style="height: ${gridSizePX*rows+20}px; width=${wpx*cols+20}px"  class="field" >`;
    let grid = `<div   class="field"   >`;
    for(let row = 0; row< rows; row++){
        let rowTop = 5+row*gridSizePX;
        for( let col=0; col< cols; col++){
            let colLeft = 5+col*gridSizePX;
            let key = tileKey(row, col)
            grid+=`<div id="${key}" ` 
                + ` class="tile" ` 
                + ` style=" top: ${rowTop}px; left: ${colLeft}px; "`  
                + ` onClick="showTileInfo( '${key}' ); return false; "   `
                + ` `
                + ` > <div id="${key}_pipe" class="" > </div></div>`
        
        }
        grid+=`<div class="tileEdge" style="top: ${rowTop}; left: ${5 + cols*gridSizePX };"></div>`
    }
    
    for( let col=0; col< cols; col++){
        let rowTop = rows*gridSizePX+5;
        let colLeft = 5+col*gridSizePX;
        grid+=`<div class="tileEdge" style=" top: ${rowTop}px; left: ${colLeft}px;"></div>`
    }

    grid+=`</div>`
    consoleLog(`grid`, grid);
    $(`#fieldDiv`).html(grid);

}
/**
 * 
 */
function showTileInfo( key ){
    let gs = allGridSquares[key];
    showById(`tile-info`)
    if(gs){
        consoleLog(`GS ${key} found!!`);

        getByClass(`selected`).removeClass(`selected fatborder`);

        gs.addClass(`selected fatborder`);

        let info=`Selected: ${gs.id}`;
        if(gs.tile) info+=` <b>${gs.tile.id}</b> [${gs.tile.pipeChar}]`;
        if(!gs.tile) info += " No tile yet....";
        tileInfoElement.html(info);
        return false;
    }

    consoleLog(`GS ${key} not found...??`);

}

/**
 * Reference to a grid html element in the display, providing
 * methods for changing the appearance of the element to 
 * indicate different status or attributes.
 */
class GridTileSquare{
    id;
    pipeChar;
    pipeClass;
    statusClass;

    gridHtmlElement;
    pipeHtmlElement;
    tile;
    classes="";
    pipeClasses = "";
    constructor(row, col){
        consoleLog(`Constructing GridTileSquare[${row}, ${col}]`)
        let key=this.key=tileKey(row,col);
        this.gridHtmlElement = $(`#${key}`);
        this.pipeHtmlElement = $(`#${key}_pipe`)
        if(!this.gridHtmlElement){
            consoleLog(`Could not link this GridTileSquare to html element with id [${key}]`)
        }if(!this.pipeHtmlElement){
            consoleLog(`Could not link this GridTileSquare to pipe element with id [${key}_pipe]`)
        }
        // Register in the index of all grid squares
        allGridSquares[key]=this;
        this.id = key;
        this.tile = null;
        sysEvents.raise( `tile.grid.${key}`, this )
        
    }

    /** Handler for the matching new tile event in the tileEvents stream */
    
    linkTile(tile){
        let GTS = this;
        GTS.tile = tile;
        GTS.setStatusClass("linkedTile");
        GTS.setPipe(tile.pipeChar);

    };

    setStatusClass(clss){
        if(this.statusClass) this.removeClass(this.statusClass)
        this.statusClass = clss;
        this.addClass(clss);
    }

    addClass(clss){
        this.gridHtmlElement.addClass(clss);
        if(!this.hasClass(clss)) this.classes+=`[${clss}]`
        consoleLog(`Adding class [${clss}] to element [${this.key}], now has classes [${this.classes}]`)
        return this;
    };

    addPipeClass(clss){
        this.pipeHtmlElement.addClass(clss);
        if(!this.hasPipeClass(clss)) this.pipeClasses+=`[${clss}]`
        consoleLog(`Adding class [${clss}] to pipe [${this.key}_pipe], now has classes [${this.pipeClasses}]`)
        return this;
    };
    removeClass(clss){
        this.gridHtmlElement.removeClass(clss);
        this.classes = this.classes.replace(`[${clss}]`,``);
        return this;
    };

    removeClasses( clss ){
        clss.forEach(cls=>{
            this.removeClass(cls);
        })
    }

    removePipeClass(clss){

        this.pipeHtmlElement.removeClass(clss);
        this.pipeClasses = this.pipeClasses.replace(`[${clss}]`,``);
        return this;
    };

    hasClass(clss){
        return this.classes.includes(`[${clss}]`);
    }
    hasPipeClass(clss){
        return this.pipeClasses.includes(  `[${clss}]`);
    }

    setTile( tile ){
        this.tile = tile;
        this.setPipe( this.tile.pipeChar );
    }

    setPipe(char){
        this.pipeChar=char;
        this.pipeInfo = getPipeInfoFromChar(char);
        if(this.pipeClass) this.removePipeClass(this.pipeClass);
        this.pipeClass = this.pipeInfo.class;
        this.addPipeClass(this.pipeClass)
        return this.pipeClass;
    }



}




/**
 * This function builds all the grid elements based on the given input file. Each 
 * line in the file corresponds to a line of the grid and each colum to a position
 * on the line. The character in the input gives the shape of the pipe in that
 * grid element.
 * 
 * The builder creates a new GridTileSquare instance or each row and column of the
 * grid, which connects itself to the corresponding HTML element in the display.
 * 
 * Having created all the grid elements, all the Tile objects are created for 
 * each row and column position, with the pipe shape character that the tile
 * contains as given in the input file.
 */
function buildGridElementIndex(){
    for(let ir = 0; ir < inputInfo.rowsCount; ir++ ){
        for(let ic=0; ic < inputInfo.colsCount; ic++){
            //let key = tileKey(ir,ic);
            if(ir==5 && ic == 10) consoleLog("creating tilegridsquare at r5 c10")
            new GridTileSquare(ir, ic)
        }
    }

    consoleLog("GridElementIndex completed")


    for(let ir = 0; ir < inputInfo.rowsCount; ir++ ){
        let chars = inputInfo.lines[ir].split("");
        for(let ic=0; ic < inputInfo.colsCount; ic++){
            //let key = tileKey(ir,ic);
            let char = chars[ic];
            //if(ir==5 && ic == 10) consoleLog("creating tilegridsquare at r5 c10")
            runRandomTime( ()=>{
                    new Tile(ir, ic, char)
                },
                3
                )
        }
    }


    //run10ms( ()=>{ new Tile( 2,  2, "F") } );

    //run10ms( ()=>{ new Tile(10, 12, "|") } );

}



class Tile{
    logging = false;
    id;
    pipeChar;
    start = false;
    neighbourKeys;
    neighbours;
    stepFromStart = -1;
    prevInChain;
    nextInChain;
    pipeInfo;
    connectedTiles = {};
    pipeDirections = [];

    constructor(row, col, char=`.`, logging=false){
        this.logging = logging;
        let key=tileKey(row,col);
        this.id=key;
        allTilesDict[key]=this;
        this.pipeChar = char;
        this.pipeInfo = getPipeInfoFromChar(char);

        if(!this.pipeInfo) {
            throw new Error(`Could not find pipe info for char[${char}]`)
        };

        this.linkGTS(allGridSquares[key]);

        this.start = (char=="S")
        this.neighbourKeys = neighbourKeys(row, col);

        if(this.start){
            tileEvents.raise(`start.${key}`, this);
            this.stepFromStart = 0;
        };

        let me = this;
        runRandomTime( ()=>{
            me.tryPipeConnections();
        },
        1)

        tileEvents.raise(`new.${key}`, this);

    }

    connectionMade( dir, tile ){
        this.log(`connectionMade in dir[${dir}] to tile [${tile.id}]`)
        this.connectedTiles[dir]=tile;
        this.connectedCount = Object.keys( this.connectedTiles ).length;
        
        this.linkedGS.setStatusClass( `cnx${this.connectedCount}`);

    };

    tryPipeConnections(){
        this.log(`....tryPipeConnections...`);
        if(this.fullyConnected) return null;
        let ngbrDirs = Object.keys(this.neighbourKeys);
        let neighbourTiles = {};
        ngbrDirs.forEach( dir=>{
                let gridKey = this.neighbourKeys[dir]
                let neighbour = allTilesDict[gridKey];
                if(neighbour){ neighbourTiles[dir]=neighbour };
            });

        let pipeDirections = this.pipeInfo.directions;
            
        this.log(`.. Checking directions:`, pipeDirections );
        if(pipeDirections.count > 0) this.linkedGS.setStatusClass("cnx0");
        this.connectedCount = 0;

        pipeDirections.forEach( dir=>{
            this.log(`.. direction check ${dir}`)
            let nt = neighbourTiles[dir];
            if(!nt) this.log("       ** no neighbour found in this direction")
            if(nt){;
                let oppDir = oppositeDir(dir);
                this.log(`    >> found neighbour tile is ${nt.id}, so checking their direction ${oppDir}`)
                if(nt.pipeInfo.directions.includes(oppDir)){
                    this.log(` >> Can connect...`)
                    nt.connectionMade(oppDir, this);
                    this.connectionMade(dir, nt);
                } else {
                    this.log( `     ** could not connect in direction ${oppDir}`)
                }
            }

        })
        
        
    }
    linkGTS( GTS ){
        
            this.linkedGS = GTS;
            GTS.linkTile(this);
            this.log(`Linked to grid: ${this.linkedGS.id} with char{${this.pipeChar}}`)
    };
    log(...params){
        if(this.logging)
         consoleLog(`*Tile ${this.id}:`, ...params);
    };

}

class ActionQueue{
/**
 * Randomized selection of actions to be done in a queue.
 * An action to be done is handed as a function with no parameters to the scheduler.
 * An action is given an index number which is used as a key on the actionsWaiting object.
 * The index number is a random number between 1 and 9999999.
 * The scheduler places the action in a random position in a queue of actions.
 * Actions are performed, in turn, from the front of the action queue, by
 */
    _logging = true;
    _buckets=[];
    actionCount = 0;
    _loopCheck = 0;

    constructor(){
        for(var ix=0; ix<1000; ix++ ){
            this._buckets.push( [] );
        }
        consoleLog("Action queue created");
    }

    addAction(actionFunction, bn="xxx"){
        
        consoleLog("Adding action ", bn)
        if(bn=="xxx") bn = this._randomBucketNumber();
        
        actionCount++;
        let bkt = _buckets[bn];
        bkt.push(actionFunction);

    }

    _runNext(){

        if (actionCount>1){
            this.log("No more actions to be run - End of run");
            return false;
        }

        let bucketnumber = 0;
        if(this._buckets[0].length == 0) bucketNumber = this._randomBucketNumber;
        
        let bkt = _buckets[bn];
        if( bkt.length == 0 ) { 
            // Nothing to run in this bucket - try another
            _loopCheck++;
            if(_loopCheck > 10000){
                this.log("Exceeded loop check limit");
                return false;
            }
            return true };

        _loopCheck=0;
        let fn = bkt.shift();
        if(fn) { actionCount--; fn(); }
        return true;

    }
    
    run(){
        this.log(">>RUNNING --------------------------------")
        let xxx = true;
        do {
            xxx = this._runNext();
        } while ( xxx );
    }

    _randomBucketNumber(){
        let ix = (Math.random() * 8999)
        return Math.trunc( 1 + ix/10 );
    }

    _log( ...args ){
        //if(this._logging) 
            consoleLog(`ActionQueue:`, ...args);
    }
}
/** PIPE CLASS ============================================================== */
class Pipe{
    row;
    col;
    key;
    char;
    tile;
    gridSquare;
    directions=[];
    connectedPipes={};
    
    moveInDirection;
    moveOutDirection;

    constructor( row, col, char) {
        this.row = row;
        this.col = col;
        this.char = char;
        directions = char2directions(char);

    }
}

/** Runs the given function f
 * after a delay up to the max limit
 * of secs seconds
 */
function runRandomTime(f, secs){
    // let tDelay = Math.round( Math.random() * secs * 1000 );
    // setTimeout( 
    //     f,
    //     tDelay
    // )
    actionQueue.addAction(f);
}

function run10ms(f){
    // setTimeout( 
    //     f
    //     , 10
    // );
    actionQueue.addAction(f,0);
}


/** Returns a standardised key string to locate a position
 * in the grid. The string incorporates the row and col
 * number of the position. If either the row or column is
 * outside the grid boundary it returns null.
 */
function tileKey(r,c){
    if( inputInfo && inputInfo.rowsCount ) if( r<0 || r>=inputInfo.rowsCount || c<0 || c>=inputInfo.colsCount ) return null;
    return `r${r}c${c}`;
};

/**
 * Returns an array of the keys of the grid elements that are neigbours to the given row/column location
 */
function neighbourKeys(r,c){
    let out = {};
    let a1 = tileKey( r-1, c );
    if(a1){ out[dirN]=a1 };
    let a2 = tileKey( r, c+1 );
    if(a2){ out[dirE]=a2 };
    let a3 = tileKey( r+1, c );
    if(a3){ out[dirS]=a3 };
    let a4 = tileKey( r, c-1 );
    if(a4){ out[dirW]=a4 };
    return out;
};



/** ----------------------------------------------------------------------------------------------------------------- HTML GENERATIVE FUNCTIONS */
function div( content ){return `<div>${content}</div>`}


function writeToDiv(id, content){ 
    //consoleLog(`Writing content to [${id}]`, content)
    $(`#${id}`).html(content);
}

function testEventStreamer(){
    consoleLog("Testing event streamer");
    let h1 = function(type, ev, userData){
        consoleLog("H1:", type, ev, userData )
    }
    let h2 = function(type, ev, userData){
        consoleLog("H2:", type, ev, userData )
    }

    let h3 = function(type, ev, userData){
        consoleLog("H3:", type, ev, userData )
    }
    
    sysEvents.on("A", h1, "A/H1" );
    sysEvents.on("B", h2, "B/H2" )
    sysEvents.on("B.*", h2, "B.*/H2");
    sysEvents.on("C", h3, "C/H3");
    sysEvents.on("A", h3, "A/H3");

    sysEvents.raise("A", { type: "A", n: 1})
    sysEvents.raise("B", { type: "B", n: 2});
    sysEvents.raise("A", { type: "A", n: 3})
    sysEvents.raise("B.XX", { type: "B.XX", n: 4});
    sysEvents.raise("C", { type: "C", n: 5});
    sysEvents.raise("A", { type: "A", n: 6});

    consoleLog("Finished testing event streamer")
}
//testEventStreamer();
