"use strict";

const fs = require("fs");

const colourLimits = { "red": 12, "green": 13, "blue": 14}
const nonSymbol = "0123456789.";

// Array of all the input seed numbers from line 1
const allSeeds=[];

// Array of the code maps e.g. from seed to soil, or humidity to location
// The key is the name of the from dimension e.g. "seed" or "humidity"
const mapsIndex = {};

function main5a(){
    console.log("Starting 5A");

    // load the input file
    var data = fs.readFileSync('Day5Input.txt', 'utf8');
    
    // Convert the input text into an array, each entry is one line
    let txt = data.toString();
    let lines = txt.split("\r\n")

    // Make sure there is a trailing blank line to mark the end of the input file.
    // This is used to end the last table in the state machine
    lines.push(""); 

    console.log(lines);

    // The initial state of the state machine
    let inputState = "start";

    // These variables hold information about the current map being
    // built by the state machine from the input file
    let buildingMap = null;
    let buildingFromName = "";
    let buildingToName = "";

    // Define the state machine function. This will be called
    // once for each line in the input file
    function processLine(line){
        // process the line depending on the state
        switch(inputState){
            case 'start':
                // looking for the seeds line, which is line 1 of the input
                // check that this is indeed the seeds line
                if(line.slice(0, 6)=="seeds:"){
                    // split the seed numbers in the line into an array of strings
                    let sSeeds = line.slice(7).split(" ");
                    // convert the strings into numbers and save in the allSeeds array
                    sSeeds.forEach(sSeed=>{
                        let seed = parseInt(sSeed);
                        allSeeds.push(seed)
                    })
                    console.log(`${allSeeds.length} seeds were loaded.`)
                    // change state. startMap means we are looking for the next map table
                    inputState = "startMap"
                }

                break;
            case "startMap":
                // looking for an map start line, i.e. in the forma [name-to-name map:]
                // check that the line ends with map:
                if(line.slice(-5)==" map:"){
                    // split this line to get the names of the two dimensions from and to
                    let mapName = line.split(" ")[0];
                    let fromTo = mapName.split("-");
                    // Get the from and to dimensions from the map name
                    buildingFromName = fromTo[0];
                    buildingToName = fromTo[2];
                    // Start with an empty map
                    buildingMap = [];
                    console.log(`Found start of map from ${buildingFromName} to ${buildingToName}`)

                    // state change to buildingMap, which means we expect to get entries to be added
                    // to the map being built until we hit a blank line, which marks the end of the map
                    inputState = "buildingMap";

                }
                break;

            case "buildingMap":
                // we are expecting three numbers on each line, up to a blank line which marks the end
                if( line.length==0 ){
                    // end of map
                    
                    // create a new instance of a mapper object, using the data from the building variable
                    let newMap = new Mapper(buildingFromName, buildingToName, buildingMap)

                    // save this mapper into the maps index using the name of the from dimension as the key
                    mapsIndex[buildingFromName] = newMap;

                    console.log(`Map for ${buildingFromName} to ${buildingToName} finished with ${buildingMap.length} entries;`);
                    // reset the building variables as we have reached the end of this map
                    buildingMap = null;
                    // change the state to startMap as we are expecting the next map in the input file
                    inputState = "startMap"
                    break;
                }
                // this line is another entry in the current map being built.
                // split the line into three numeric strings
                let sKeys = line.split(" ");
                if(sKeys.length != 3){
                    throw new Error(`map key line does not contain three numbers`, line)
                };

                // Get the three key values from the array. These are the base number of
                // the from dimension, the base number of the to dimension and the number
                // of key values that are covered by this map entry
                let [ sToKeyBase, sFromKeyBase, sKeyCount] = sKeys;
                let fromKeyBase = parseInt(sFromKeyBase);
                let toKeyBase = parseInt(sToKeyBase);
                let keyCount = parseInt(sKeyCount);

                // create a map entry using the values from the line
                let mapEntry = { fromKeyMin: fromKeyBase, fromKeyMax: fromKeyBase + keyCount - 1, toKeyMin: toKeyBase}

                // push the map entry into the map currently being built;
                buildingMap.push(mapEntry);

                break;

            default:
                throw new Error(`Input state ${inputState} is not recognised`)
        }
    }

    // run the state machine for every line in the input file
    lines.forEach(processLine)
    
    // report all the maps
    let mapNames = Object.keys(mapsIndex);

    console.log("Maps:", mapNames);
    console.log(`finished 5A`)

    // TEST -------------------------
    // let loc = mapsIndex["humidity"].getUltimateLocation(1659783208);
    // console.log(`Test: Location for humidity ${1659783208} is ${loc}`);

    // loc = mapsIndex["light"].getUltimateLocation(4144686847);
    // console.log(`Test: Location for light ${4144686847} is ${loc}`);
    // ------------------------------


    // now establish the location for all the input seeds ============================

    // get the seed map from the maps index
    let seedMap = mapsIndex["seed"];
    
    // set the lowest location to a high value. This will be replaced with the lowest location number
    let lowestLocation = 999999999999;

    // create an array of seed to location mapping results for reporting
    let results = [];

    // check the location code corresponding to every seed
    allSeeds.forEach(seed=>{
        // getUltimateLocation will call repeatedly down the maps until the location is discovered
        let loc = seedMap.getUltimateLocation(seed);

        // check if this is the lowest location number so far
        if(loc < lowestLocation) lowestLocation = loc;
        let result = {
            seed, loc
        }
        results.push( result )
    });

    // report the locations for all the seeds
    console.log(`Results:`, results );

    // report the lowest location
    console.log(`Lowest location is ${lowestLocation}`);

    console.log("Finished 5A");

}







class Mapper{
    mapFrom = "";
    mapTo = "";
    mapToMapper= null;

    // Each entry in mapping table is
    //  fromKeyMin - lowest input key value
    //  fromKeyMax - highest input key value
    //  toKeyMin - the starting output key value, corresponding the fromKeyMin.
    mapTable=[];

    constructor(fromName, toName, mappingTable){
        this.mapFrom = fromName;
        this.mapTo = toName;
        this.mapTable = mappingTable;
        console.log(`Map created for ${fromName} to ${toName} with ${mappingTable.length} entries`)
    }
    lookup(key){
        let mappedTo = -1;
        let matchingEntry;
        this.mapTable.every(entry=>{
            if(entry.fromKeyMin <= key && entry.fromKeyMax >= key){
                matchingEntry = entry;
                mappedTo = entry.toKeyMin - entry.fromKeyMin + key ;
                return false;
            }
            return true;
        })

        if(matchingEntry){
            console.log(`${this.mapFrom} code ${key} maps to ${this.mapTo} code ${mappedTo} using entry with base key ${matchingEntry.fromKeyMin}`)
        } else {
            mappedTo = key;
            console.log(`${this.mapFrom} code ${key} maps to ${this.mapTo} code ${key} because there is no mapping entry`)
        }
        return mappedTo; 
    };

    getUltimateLocation(fromKey){
        let toKey = this.lookup(fromKey)
        if(this.mapTo=="location"){
            return toKey;
        }
        if(!this.mapToMapper)   this.mapToMapper = mapsIndex[this.mapTo];
        if(!this.mapToMapper)  throw new Error(`There is no desitnation map from ${this.mapFrom} to ${this.mapTo} `);
        return this.mapToMapper.getUltimateLocation(toKey);
    }
}

main5a();