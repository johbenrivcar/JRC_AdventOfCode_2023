"use strict";

/**
 * Day 6A
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
    console.log("Starting 6A");

    // load the input file
    var data = fs.readFileSync('Day6Input.txt', 'utf8');
    
    // Convert the input text into an array, each entry is one line
    let txt = data.toString();
    let lines = txt.split("\r\n");

    console.log(`Lines`, lines);

    let parts0 = lines[0].replace(/ +/g, ' ').split( ' ' );
    let parts1 = lines[1].replace(/ +/g, ' ').split( ' ' );

    let races = [];
    let totalWaysToWin = 1
    for( let ix=1; ix<parts0.length; ix++){
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
    console.log(`Finished 6A`)
}

main6a();