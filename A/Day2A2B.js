"use strict";


const fs = require("fs");

const colourLimits = { "red": 12, "green": 13, "blue": 14}

function main(){
    console.log("Starting 2A");

    var sumOfPossibleGameIds = 0;
    var sumOfMinSetPowers = 0;

    var data = fs.readFileSync('Day2Input.txt', 'utf8');
    let txt = data.toString();

    // Convert the text into an array of lines, one line per game, splitting on the crlf line divider
    let games = txt.split("\r\n");

    // define the games object to hold index of all the games
    console.log("Processing all the games...")
    games.forEach( (game,ix)=>{
        // Split the line on the colon
        let gameIsPossible = true;

        // --- Challenge 2B
        let minSet = { red: 0, blue: 0, green: 0 }

        let aa = game.split(": ")

        // Get the game number from the LH part
        let gameID = parseInt(aa[0].split(" ")[1]);
        // Separate all the samples
        let samples = aa[1].split("; ");
        // create the game object
        
        let report = false;
        //if ( gameID%10 == 0) 
        if (gameID == 49) report= true;

        if(report) console.log(`=========================\n[${game}]`)
        // Get the list of samples for this game

        samples.forEach((sample, sampleIx)=>{ 
            let sampleIsPossible = true;

            // Split up the entries for each colour in this sample
            let allColours = sample.split(", ");

            if(report) console.log(`Sample ${sampleIx}:`, `[${sample}]`)

            // Now check the counts
            allColours.forEach( (oneColour, colourIx)=>{
                
                if(report) console.log(`  ${colourIx}: [${oneColour}]`)
                let [sCount, hue]=oneColour.split(" ");
                let count = parseInt(sCount);
                let poss = colourLimits[hue] < count? false : true;
                
                if(!poss) sampleIsPossible = false;
                if(!poss) gameIsPossible = false;

                if( count > minSet[hue] ) minSet[hue] = count;

                // --- Challenge 2B
                if(report){
                    console.log(` The count for ${hue} is ${count} and the current min is`, minSet)
                }

                if(report || !poss )  console.log( `     ${hue} count ${count}/${colourLimits[hue] } Possible? ${ (poss? "Yes" : "No" )}`);
                return sampleIsPossible;
            })

            return sampleIsPossible;
        })

        if(gameIsPossible) {
            sumOfPossibleGameIds+= gameID;
        }

        console.log(`Game #${gameID} is ${ gameIsPossible? ``: `not ` }possible, sum of possible game IDs is ${ gameIsPossible? `now`: `still` } ${sumOfPossibleGameIds}`);
        console.log(` The miniumum set for this game was:`, minSet );
        let setPower = minSet.red * minSet.green * minSet.blue;
        sumOfMinSetPowers+= setPower;
        console.log(` The minimum set power is ${setPower} so the total of all of them is now ${sumOfMinSetPowers}`);
    })

    console.log(`\nConclusion: Sum of all possible game IDs is ${sumOfPossibleGameIds}`);
    console.log(`            The final total of all of minimum set powers is ${sumOfMinSetPowers}`);
    


    console.log("Finished 2A");
}
main();