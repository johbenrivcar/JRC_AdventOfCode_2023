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

function main6a(){
    console.log("Starting 6B");

    // load the input file
    var data = fs.readFileSync('Day6Input.txt', 'utf8');
    
    // Convert the input text into an array, each entry is one line
    let txt = data.toString();
    let lines = txt.split("\r\n");

    console.log(`Lines`, lines);
    let data1 = lines[0].split(":")[1];
    let data2 = lines[1].split(":")[1];

    console.log(`data1`, data1);
    console.log(`data2`, data2);

    let parts0 = data1.replace(/ /g, '').split(' ');
    let parts1 = data2.replace(/ /g, '').split( ' ' );

    console.log(`parts0`, parts0);
    console.log(`parts1`, parts1);
    let races = [];
    let totalWaysToWin = 1
    for( let ix=0; ix<parts0.length; ix++){
        let time = parseInt(parts0[ix]);
        let distance = parseInt( parts1[ix]);
        let targetAvgSpeed = distance / time;
        let minPressTime = Math.ceil(targetAvgSpeed);
        let minPressPerc = minPressTime * 100 / time;
        let minPressDistance = (time - minPressTime) * minPressTime;
        while( minPressDistance < distance ){
            
            minPressTime++;
            minPressPerc = minPressTime * 100 / time;
            minPressDistance = (time - minPressTime) * minPressTime;
        }

        let maxPressTime = time-1;
        let maxPressPerc = maxPressTime * 100 / time;
        let maxPressDistance = ( time - maxPressTime ) * maxPressTime;
        
        while( maxPressDistance < distance ){
            maxPressTime--;
            maxPressPerc = maxPressTime * 100 / time;
            maxPressDistance = (time - maxPressTime) * maxPressTime;
        }
        let numberOfWaysToWin = maxPressTime - minPressTime + 1;
        totalWaysToWin = numberOfWaysToWin * totalWaysToWin;
        races.push( { time , distance, targetAvgSpeed, minPressTime, minPressPerc, minPressDistance, maxPressTime, maxPressPerc, maxPressDistance, numberOfWaysToWin})

    }

    console.log(`Races:`, races);
    console.log(`Total of ways to win is ${totalWaysToWin}`)
    console.log(`Finished 6B`)
}

main6a();