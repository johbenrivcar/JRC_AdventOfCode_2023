// Day 10 async script

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

const linkTravelDirections = {
    N: { out: "N", in: "S" }
    , E: { out: "E", in: "W" }
    , S: { out: "S", in: "N" }
    , W: { out: "W", in: "E" }
}

    /** EventStream Class ===========================================================================================
     * Provides a means of publishing and subscribing to a stream of events.
     * Events are objects that are published, i.e. made available, by a publisher to a subscriber
     * Events are published in streams. The publisher uses a stream to publish events,
     * and many subscribers can use the stream to subscribe to those events. The publisher
     * optionally sends one item of data with the event which is sent to all subscribers.
     * When the publisher publishes an event the stream sends it **asynchronously** to all 
     *  the subscribers who have matching subscription keys.
     * An event has a type, which is a string set by the publisher. An event type can have multiple parts, each separated by a dot
     * A subscriber can specify which type of event they wish to recieve, by specifying the type string. A subscriber can use
     * an * as any part of a key to denote that they will accept any value in that part of the key. An * at the end of a subscription
     * key will match an event key that has multiple parts beyond the position of the *.
     * 
     * Example.                 Event with key A.B.C.D  Event with key A.X.Y.D
     *  Subscriber to key        - receives the event?    - receives the event?
     *  A.B.C.D                     yes                         No
     *  A                           No                          No
     *  A.*                         Yes                         Yes
     *  A.*.C                       No                          No
     *  A.*.C.*                     Yes                         No
     *  A.*.*.D                     Yes                         Yes
     *  
     * When registering to receive events, a subscriber may optionally supply a single data item
     * (of any type) to be associated with the subscription. This data is returned with the event
     * every time an event in the stream is sent to the subscriber.
     *  
     * */
    var eventSerial = 0;
    class EventStream{

        // List of subscribers
        subs = [];
        name = "";
        verbose = false;

        // Logging function
        log(xx, yy){ 
            console.log( `E[${this.name}]:`, xx ) ; 
            if(yy) console.log("           :", yy);
        };

        /** 
         * Subscribe function called by a consumer of 
         * events to register an event handler function, The
         * event handler function is called to handle the
         * event when an event is published with a matching
         * event type.
         * */
        on(type, handler , userData ){
            //this.log(`subscribing type ${type} with subtype ${ type.slice(0,-1) }`);
            let keys = type.split(".");
            let sub = { type, keys, handler, userData }
            //this.log("Registering event subscriber ", sub)

            this.subs.push( sub );
        }

        /**
         * Constructor for the event stream. The Optional
         * parameter is a string naming the event stream.
         * If given, the stream is added as a global 
         * variable with the name of the event stream.
         * @param {string} esName 
         */
        constructor( esName ){
            if( typeof esName == "string"&& esName.length > 0 ) {this.name = esName} else {esName = ""};
            let me = this;
            
            if(esName.length>0) window[esName] = me;

            this.raise = 
                function(type, eventData = {} ){
                    try{ eventData.sn = eventSerial++ } catch(e){};
                    this.log(`>>>>>>>>>>>>>>>>>>>>>>>> raising type ${type}`)
                    let evKeys = type.split(".");
                    let notifyType = (this.name.length>0? this.name + " " : "" ) + type;
                    me.subs.forEach( 
                        sub=>{
                            //this.log(`-- checking`, sub)
                            if(sub.keys.length > evKeys.length) return;
                            if (
                                sub.keys.every(
                                    (key, ix)=>{
                                        switch(true){
                                            // case ix >= evKeys.length:
                                            //     return false;
                                            case key == "*":            // wild card on the listener key
                                            case key == evKeys[ix]:     // match event to listener key
                                            case evKeys[ix]=="*":       // wild card on event key
                                                return true;            // we have a match
                                            default:
                                                return false;
                                        }
                                    }
                                )
                            ){
                                // This is the async function call to actually send the event to the 
                                // event handler for the subscriber.
                                setTimeout( 
                                    ()=>{
                                        sub.handler(notifyType, eventData, sub.userData );
                                    }
                                    , 10
                                );
                            }
                        }
                    );
                };
                
        };
    };

// =====================================================================================================


new EventStream("sysEvents");

/** tileEvents are raised when something changes on a tile. The events 
 * are keyed on the type of event followed . then the tile key. */
new EventStream("tileEvents");


function logEvent(type, eventData, userData){ console.log( `E[${type}]`, userData, eventData) }

sysEvents.on("*", logEvent, "sys")
tileEvents.on("*", logEvent, "tile")

/**
 * This is run when the initial page load is complete
 */
function runDay10Script(){
    //alert(`Running`)
    
    let msg = `Today's date is ${dtLoad.toISOString()}`;
    writeToDiv( "date_disp",  msg) ;
    console.log("Running ====================================")
    
    // Get references to the dialog for loading the grid data
    fileInputElement = document.getElementById('fileInput');
    fileDisplayElement = document.getElementById('file-display-area');
    footerElement = $(`#footer`);
    tileInfoElement = $(`#tile-info`);

    // add a listener for when the user chooses a file to be
    // loaded.
    fileInputElement.addEventListener('change', fileInput_change);


}

/**
 * Runs when the input file has been selected and opened by user
 * Loads the file and displays content to the user
 */
function fileInput_change() {
    var file = fileInputElement.files[0];
    console.log(`file`, file);

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

                console.log(`fileContent`, inputInfo.fileContent)

                /** display content to the user
                 *  so the user can check; */
                displayDataToUser();

            }
        // start the async reading process
        reader.readAsText(file);    

    } else {
        /** could not read the file */
        fileDisplayElement.innerText = "File not supported!";
    }
}


/**
 * Run after the input file has been chosen and loaded, to display
 * the content of the file to the user
 */
function displayDataToUser(){
    //console.log(`data received` , readData);

    /** Put the whole content into the screen display element */
    fileDisplayElement.innerText = inputInfo.fileContent;

    inputInfo.lines = inputInfo.fileContent.split( /\r/g );
    inputInfo.rowsCount = inputInfo.lines.length;

    // Assuming that all lines in the file have the same length!!
    inputInfo.colsCount = inputInfo.lines[0].length;

    console.log(`${inputInfo.rowsCount} lines`);
    console.log(`Line length: ${inputInfo.colsCount}`);


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

// function getDay10Input(jQueryFileElement){
    
//     fetch("Day10TestInput.txt",{
//         mode: 'no-cors'
//       })
//     .then((res) => { console.log( `res`, res ); return res.text()})
//     .then((text) => {
//         console.log("Fetch complete", text)
//         //$(`#testInput`).html(text);
//     })
//     .catch((e) => console.error(e));
// }

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
    /** Hide the displayed file content and show the grid map area */
    hideById("data-load-area")
    showById("field-map-area")

    /** Generate the grid html elements in the display area */
    generateGridHTML(  );

    /** Async build the the grid elements objects that connect to the display grid */
    setTimeout( ()=>{
        buildGridElementIndex();
    }, 10);

}







/** User has selected the <Back button which goes
 *  back to the file selection and load panel */
function selectNewFile(){
    hideById("field-map-area")
    showById("data-load-area")
};



/** UTILITY FUNCTIONS FOR SHOWING AND HIDING ELEMENTS ON THE DISPLAY PANEL */
function hideById(id){
    console.log(`hiding ${id}`);
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
    console.log(`Selecting all elements by class [${cls}]`);
    return $(`.${cls}`);
}

/** Creates the complete HTML map of the grid,
 *  with the row/column count 
 *  taken from the input text file
 */
function generateGridHTML(gridSizePX=20, rows=inputInfo.rowsCount, cols=inputInfo.colsCount){
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
                + ` > </div>`
        
        }
        grid+=`<div class="tileEdge" style="top: ${rowTop}; left: ${5 + cols*gridSizePX };"></div>`
    }
    
    for( let col=0; col< cols; col++){
        let rowTop = rows*gridSizePX+5;
        let colLeft = 5+col*gridSizePX;
        grid+=`<div class="tileEdge" style=" top: ${rowTop}px; left: ${colLeft}px;"></div>`
    }

    grid+=`</div>`
    console.log(`grid`, grid);
    $(`#fieldDiv`).html(grid);

}
/**
 * 
 */
function showTileInfo( key ){
    let gs = allGridSquares[key];
    showById(`tile-info`)
    if(gs){
        console.log(`GS ${key} found!!`);

        getByClass(`selected`).removeClass(`selected fatborder`);

        gs.addClass(`selected fatborder`);

        let info=`Selected: ${gs.id}`;
        if(gs.tile) info+=` <b>${gs.tile.id}</b> [${gs.tile.pipeChar}]`;
        if(!gs.tile) info += " No tile yet....";
        tileInfoElement.html(info);
        return false;
    }

    console.log(`GS ${key} not found...??`);

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
    gridHtmlElement;
    tile;
    classes="";

    constructor(row, col){
        console.log(`Constructing GridTileSquare[${row}, ${col}]`)
        let key=this.key=tileKey(row,col);
        this.gridHtmlElement = $(`#${key}`);
        if(!this.gridHtmlElement){
            console.log(`Could not link this GridTileSquare to html element with id [${key}]`)
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
        GTS.addClass("linkedTile");
        GTS.setPipe(tile.pipeChar);

    };


    addClass(clss){
        this.gridHtmlElement.addClass(clss);
        if(!this.hasClass(clss)) this.classes+=`[${clss}]`
        console.log(`Adding class [${clss}] to element [${this.key}], now has classes [${this.classes}]`)
        return this;
    };

    removeClass(clss){
        this.gridHtmlElement.removeClass(clss);
        this.classes = this.classes.replace(`[${clss}]`,``);
        return this;
    };
    hasClass(clss){
        return this.classes.includes(`[${clss}]`);
    }
    setTile( tile ){
        this.tile = tile;
        this.setPipe( this.tile.pipeChar );
    }

    setPipe(char){
        this.pipeChar=char;
        if(this.pipeClass) this.removeClass(this.pipeClass);
        this.pipeClass = pipeChar2Class(char);
        this.addClass(this.pipeClass)
    }
}





function buildGridElementIndex(){
    for(let ir = 0; ir < inputInfo.rowsCount; ir++ ){
        for(let ic=0; ic < inputInfo.colsCount; ic++){
            //let key = tileKey(ir,ic);
            if(ir==5 && ic == 10) console.log("creating tilegridsquare at r5 c10")
            new GridTileSquare(ir, ic)
        }
    }

    console.log("GridElementIndex completed")

    run10ms( ()=>{ new Tile(2, 2, "F") } );


}



class Tile{
    constructor(row, col, char=`.`){
        let key=tileKey(row,col);
        this.id=key;
        allTilesDict[key]=this;
        this.pipeChar = char;

        this.linkGTS(allGridSquares[key]);
        tileEvents.raise(`new.${key}`, this);
        this.start =(char=="S")
        if(this.start){
            tileEvents.raise(`start.${key}`, this);
            this.stepFromStart = 0;
        }
           
    }
    

    linkGTS( GTS ){
        
            this.linkedGS = GTS;
            GTS.linkTile(this);
            console.log(`Tile object [${this.key}] linked to ${this.linkedGS.id} with char{${this.pipeChar}}`)
    };

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


function run10ms(f){
    setTimeout( 
        f
        , 10
    );
}


function tileKey(r,c){
    return `r${r}c${c}`;
};

function pipeChar2Ix(char){
    return pipeChars.indexOf(char);
}
function pipeChar2Class(char){
    return pipeClasses[pipeChar2Ix(char)];
}
const pipeChars = ".|-JLF7S";
const pipeDirections =[
    []
    , [N, S]
    , [E, W]
    , [S, W]
    , [S, E]
    , [N, E]
    , [N, W]
    , [N, S, E, W]
]
const pipeClasses = [
    'pNone',
    'pNS',
    'pEW',
    'pSW',
    'pSE',
    'pNE',
    'pNW',
    'pSTRT'
];
function char2Directions(char){

}


function div( content ){return `<div>${content}</div>`}


function writeToDiv(id, content){ 
    console.log(`Writing content to [${id}]`, content)
    $(`#${id}`).html(content);
}

function testEventStreamer(){
    console.log("Testing event streamer");
    let h1 = function(type, ev, userData){
        console.log("H1:", type, ev, userData )
    }
    let h2 = function(type, ev, userData){
        console.log("H2:", type, ev, userData )
    }

    let h3 = function(type, ev, userData){
        console.log("H3:", type, ev, userData )
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

    console.log("Finished testing event streamer")
}
//testEventStreamer();
