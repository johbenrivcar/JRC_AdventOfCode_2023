"use strict";

/**
 * Day 5B. Same as 5A except we need to treat the seeds line as ranges of seed numbers.
 */
const fs = require("fs");

const colourLimits = { "red": 12, "green": 13, "blue": 14}
const nonSymbol = "0123456789.";

// Array of all the input seed numbers from line 1
const allSeedRanges=[];

// Array of the code maps e.g. from seed to soil, or humidity to location
// The key is the name of the from dimension e.g. "seed" or "humidity"
const mapsIndex = {};

function main5a(){
    console.log("Starting 5A");

    // load the input file
    var data = fs.readFileSync('Day5Input.txt', 'utf8');
    
    // Convert the input text into an array, each entry is one line
    let txt = data.toString();
    let lines = txt.split("\r\n");

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
                    // VERSION 5B
                    // split the seed numbers in the line into an array of strings
                    let sSeeds = line.slice(7).split(" ");

                    // convert the strings into numbers and save in the allSeedRanges array
                    let seedRange;

                    sSeeds.forEach( (sSeedId,ix) =>{
                        let seedId = parseInt(sSeedId);
                        // check odd and even entries. Even is start and odd is count of each range
                        if(ix%2==0){
                            // even, so this is the start of the range
                            seedRange ={ start: seedId }
                        } else {
                            // odd so this is the number of seeds in the range
                            // output all the seed numbers between start and end of the range
                            seedRange.count = seedId
                            allSeedRanges.push( seedRange );
                        }
                    })




                    console.log(`${allSeedRanges.length} seed ranges were loaded.`)
                    console.log( allSeedRanges )
                    // change state. startMap means we are looking for the next map table
                    console.log(`Now look for the first mapping table in the input file`)
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
                    console.log(`Start looking for the next map in the input file`)
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
        };
    };

    // run the state machine for every line in the input file
    lines.forEach(processLine)
    
    // report all the maps
    let mapNames = Object.keys(mapsIndex);
    console.log("Maps:", mapNames);

    // TEST -------------------------
    // let loc = mapsIndex["humidity"].getUltimateLocation(1659783208);
    // console.log(`Test: Location for humidity ${1659783208} is ${loc}`);

    // loc = mapsIndex["light"].getUltimateLocation(4144686847);
    // console.log(`Test: Location for light ${4144686847} is ${loc}`);
    // ------------------------------


    // now establish the lowest location for all the input seeds ============================

    // get the seed map from the maps index
    let seedMap = mapsIndex["seed"];
    
    // set the lowest location to a high value. This will be replaced with the lowest location number
    let lowestLocation = 999999999999;
    let seedCount = 0;
    // check the location code corresponding to every seed
    allSeedRanges.forEach( (seedRange, ix)=>{
        console.log(`Processing range`, seedRange);
        seedCount += seedRange.count;

        for( let ix = 0; ix < seedRange.count ; ix++){
            let seed = seedRange.start + ix;
            // getUltimateLocation will call repeatedly down the maps until the location is discovered
            let loc = seedMap.getUltimateLocation(seed);
            if(loc < lowestLocation) lowestLocation = loc;
        }
        console.log(`Processed ${seedCount} seeds so far, and lowest location is ${lowestLocation}....`)
    });


    // report the lowest location
    console.log(`Lowest location is ${lowestLocation}`);

    console.log("Finished 5A");

}






/**
 * This class provides the functionality for looking up a value of one dimenstion (the from key)
 * and returning the value of another (the to key). The table used to look up the from key->to key pairs 
 * is stored in the array mapTable[]. This holds entries which define ranges of keys and
 * corresponding values. When looking up a given fromKey, the algorithm hunts for a mapTable entry
 * whose fromKeyMin and fromKeyMax define a range that includes the given key. This entry is then
 * used to generate the toKey. See the code for more informaiton
 * 
 * As the objective is to follow a series of mapping tables to arrive at a location key starting
 * from a seed key, there is a function getUltimateLocation which can be called to follow the chain
 * of mapper tables to reach the table that returns a location. Then the desired location
 * is returned back up the call chain back to the original caller. The Mappers will automtically
 * find the correct next mapper in the chain by getting one that maps from the dimension that 
 * matches its own mapTo dimension. For example, the soil-to-fertilizer mapper will first 
 * find the fertilizer code that corresponds to the given soil code, then uses the mapper that 
 * maps from fertilizer in order to (eventually) reach the required location.
 * 
 */
class Mapper{
    // The dimension being mapped from e.g. "fertilizer"
    mapFrom = "";
    // The dimension being mapped to, e.g. "water"
    mapTo = "";
    // The next mapper, i.e. the one that maps _from_ the this.mapTo dimension
    mapToMapper= null;

    // Each entry in mapping table is
    //  fromKeyMin - lowest from key value
    //  fromKeyMax - highest from key value
    //      The above two numbers define the range of fromKeys that the entry can be used for
    //  toKeyMin - the starting toKey value, corresponding the fromKeyMin value.
    mapTable=[];

    constructor(fromName, toName, mappingTable){
        this.mapFrom = fromName;
        this.mapTo = toName;
        this.mapTable = mappingTable;
        console.log(`Map created for ${fromName} to ${toName} with ${mappingTable.length} entries`)
    }

    /**
     * Finds the value of the toKey that corresponds to the input fromKey
     * @param {number} fromKey 
     * @returns 
     */
    lookup(fromKey){
        let mappedTo = -1;

        // The entry that includes fromKey in its mapping range. This
        // needs to be found in the mapTable.
        let matchingEntry;

        // Scan the whole mapTable looking for the right map entry.
        this.mapTable.every(entry=>{
            // Check if this entry's range contains the given fromKey
            if(entry.fromKeyMin <= fromKey && entry.fromKeyMax >= fromKey){
                matchingEntry = entry;
                // Calculate the toKey that corresponds to the given fromKey
                mappedTo = entry.toKeyMin - entry.fromKeyMin + fromKey ;
                return false;
            }
            return true;
        })

        // Check if an entry was found in mapTable. If not, then the toKey is equal to the fromKey.
        if(matchingEntry){
            //console.log(`${this.mapFrom} code ${fromKey} maps to ${this.mapTo} code ${mappedTo} using entry with base key ${matchingEntry.fromKeyMin}`)
        } else {
            // There was no matching map entry so just return the input fromKey.
            mappedTo = fromKey;
            //console.log(`${this.mapFrom} code ${fromKey} maps to ${this.mapTo} code ${fromKey} because there is no mapping entry`)
        }

        return mappedTo; 
    };
    
    /**
     * This returns the location key value that corresponds to the given fromKey value.
     * @param {number} fromKey 
     * @returns {number} location key
     */
    getUltimateLocation(fromKey){
        // first, find the toKey that matches the fromKey in this mapping table
        let toKey = this.lookup(fromKey)
        // If this mapper is mapping to location, then return the found toKey
        if(this.mapTo=="location"){
            return toKey;
        }
        // This mapper does not map to location. So we have to find the mapper that maps
        // from the dimension that is our mapTo dimension, by looking it up in the 
        // maps index.
        if(!this.mapToMapper)   this.mapToMapper = mapsIndex[this.mapTo];
        if(!this.mapToMapper)  throw new Error(`There is no desitnation map from ${this.mapFrom} to ${this.mapTo} `);

        // Then we simply return the location value given by that mapping table.
        return this.mapToMapper.getUltimateLocation(toKey);
    }
}

main5a();