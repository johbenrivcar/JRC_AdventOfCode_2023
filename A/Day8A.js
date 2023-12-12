"use strict";

/**
 * Day 8A
 */
const fs = require("fs");

const allNodes = {};

function main8a(){
    console.log("Starting 8A -----------------------------------------------------------------");

    // load the input file
    var data = fs.readFileSync('Day8Input.txt', 'utf8');
    
    // Convert the input text into an array, each entry is one line
    let txt = data.toString();
    let lines = txt.split("\r\n");
    console.log(lines);


    let firstLine = lines[0];
    let steps = firstLine.split('');
    let stepCycleLimit = steps.length;

    console.log(`first line [${firstLine}]`);
    console.log( `steps`, steps)
    
    lines.forEach( (line, ix)=>{
        // skip the first two lines
        if(ix<2) return;

        let [key, node] = line.split( " = ");
        
        // (BBB, CCC)
        let left = node.slice(1,4)
        let right = node.slice(6,9)
        
        console.log(`key: [${key}] node: [${node}] left: [${left}] right:[${right}]`);
        allNodes[key] = ( {key, L: left, R: right , line: ix+1});
    })

    console.log( allNodes );

    let stepCount = 0;
    let stepCycle = 0;

    let currentNode = 'AAA';

    while( currentNode != 'ZZZ'){
        stepCount++;
        if(stepCount > 10000000) throw new Error (" Too many steps !");
        if(stepCycle == stepCycleLimit ){
            stepCycle = 0;
            console.log(`>>>>Recycling steps at step ${stepCount}`);
        } 
        let nextStep = steps[stepCycle];
        let node = allNodes[currentNode];

        let newNode = node[nextStep];

        console.log(`${stepCount}. Taking step ${nextStep} from ${currentNode} (on line ${node.line}) to ${newNode}.`)

        stepCycle++;
        currentNode = newNode;
    }
    console.log(`It took ${stepCount} steps to go from AAA to ZZZ`)
    console.log("Finished 8A -----------------------------------------------------------------");

};




main8a();
