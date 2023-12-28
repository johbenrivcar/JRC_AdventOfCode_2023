"use strict";

/**
 * Day 8A
 */
const fs = require("fs");
const { setTimeout } = require( 'node:timers/promises' );

const allNodes = {};
var steppers = []; // these all end with "A"
const matchReport = "";
var steps;
const starters  = []
/*
    [
         {
          endsInZ: true,
          stepCount: 2668516133,
          stepperID: 1,
          initialNode: 'DFA',
          currentNode: { key: 'MRZ', L: 'DMP', R: 'TJT', line: 581 }
        },
         {
          endsInZ: true,
          stepCount: 2668516133,
          stepperID: 2,
          initialNode: 'BLA',
          currentNode: { key: 'KMZ', L: 'VNR', R: 'XLR', line: 438 }
        },
         {
          endsInZ: false,
          stepCount: 2668516133,
          stepperID: 3,
          initialNode: 'TGA',
          currentNode: { key: 'JKC', L: 'TLG', R: 'CNT', line: 31 }
        },
         {
          endsInZ: true,
          stepCount: 2668516133,
          stepperID: 4,
          initialNode: 'AAA',
          currentNode: { key: 'ZZZ', L: 'LFM', R: 'MHM', line: 35 }
        },
         {
          endsInZ: false,
          stepCount: 2668516133,
          stepperID: 5,
          initialNode: 'PQA',
          currentNode: { key: 'VQM', L: 'FPB', R: 'HGR', line: 265 }
        },
         {
          endsInZ: true,
          stepCount: 2668516133,
          stepperID: 6,
          initialNode: 'CQA',
          currentNode: { key: 'RCZ', L: 'FGM', R: 'MRQ', line: 333 }
        }
      ]

*/

function allFinished(){
    let fin = true;
    let zCount = 0;
    steppers.forEach( (stepper, ix)=>{
        if(stepper.endsInZ) zCount++;
        //if (stepper.endsInZ) console.log(`Step ${stepper.stepCount}: Stepper ${stepper.stepperID} with key [${stepper.currentNode.key}] on line ${stepper.currentNode.line} ends in Z? ${stepper.endsInZ}`)
        fin = fin && stepper.endsInZ;
    })
    if(zCount >3) {
        console.log(`At step ${steppers[0].stepCount}, ${zCount} nodes end with Z`)
        console.log(steppers);
        steppers.forEach( stepper=>{
            if(stepper.endsInZ){
                console.log(`${stepper.stepperID}: At line ${stepper.currentNode.line} with key ${stepper.currentNode.key}`);
            }
        })
        if( zCount >4 ) return true;
    };
    return fin;
}
function allTakeAStep( step, stepCycle ) {
    if( step != steps[stepCycle]) throw new Error ("Mismatch of step cycle to step!")
    steppers.forEach(stepper=>{
        stepper.takeAStep( step, stepCycle );
    })
};

async function main8b(){
    console.log("Starting 8B -----------------------------------------------------------------");

    // load the input file
    var data = fs.readFileSync('Day8Input.txt', 'utf8');
    
    // Convert the input text into an array, each entry is one line
    let txt = data.toString();
    let lines = txt.split("\r\n");
    console.log(lines);


    let firstLine = lines[0];
    steps = firstLine.split('');
    let stepCycleLimit = steps.length;

    console.log(`first line [${firstLine}]`);
    //console.log( `steps`, steps)
    //console.log( `end of steps`, steps.slice(-10))
    console.log( `There are ${steps.length} steps per cycle.`)
   

    lines.forEach( (line,  ix)=>{
        // skip the first two lines
        //console.log(ix, line)
        if(ix<2) return;

        let [key, node] = line.split( " = ");
        
        // (BBB, CCC)
        let left = node.slice(1,4)
        let right = node.slice(6,9)
        
        //console.log(`key: [${key}] node: [${node}] left: [${left}] right:[${right}]`);


        let newNode = { key, L: left, R: right , line: ix+1 }
        allNodes[key] = newNode;
        
        // check if this is a starting node

        if (starters.length == 0 ) if( key.slice(-1)=='A'  ) {
            steppers.push( new Stepper( key , ix+1 ) );
        }
    })

    if(starters.length>0){
        steppers = [];
        starters.forEach(starter=>{
            steppers.push( new Stepper( "", 0, starter))
        })
    }


    console.log( steppers );
    console.log( `There are ${steppers.length} steppers`);
    

    let stepCount = steppers[0].stepCount;

    console.log( `Starting at step ${stepCount}`);
    let stepCycle =0;
    if( stepCount > 0)  stepCycle = ((stepCount - 1) % steps.length ) + 1;

    console.log( `Step cycle position starts at ${stepCycle}`);


    while( !allFinished() ){
        stepCount++;
         //console.log(`Step ${stepCount} >>>>>>>`)
        //if(stepCount > 100000000) throw new Error (" Reached step limit !");
        if(stepCycle == stepCycleLimit ){
            stepCycle = 0;
            //console.log(`>>>>Recycling steps at step ${stepCount}`);
        } 
        let nextStep = steps[stepCycle];

        if(stepCount%50000000 == 0){
            console.log(`Step ${stepCount} - ${stepCycle} - ${nextStep}`)
            //await setTimeout(1000);
        }
        allTakeAStep(nextStep, stepCycle)

        stepCycle++;
    }
    
    console.log(`It took ${stepCount} steps to go from --A to --Z, currently at step cycle ${stepCycle}`);
    console.log( steppers );
    console.log("Finished 8B -----------------------------------------------------------------");

};





var stepperCount = 0;
class Stepper{

    endsInZ = false;
    stepCount = 0;
    constructor( firstNodeKey , lineNo, starterInfo ){

        if(starterInfo){
            this.stepperID = starterInfo.stepperID
            this.endsInZ = starterInfo.endsInZ
            this.stepCount = starterInfo.stepCount
            firstNodeKey = this.initialNode = starterInfo.initialNode
            this.currentNode = starterInfo.currentNode

        } else {
            
            stepperCount++;
            this.stepperID = stepperCount;
            this.initialNode = firstNodeKey;
            this.currentNode = allNodes[firstNodeKey];
        }

        console.log(`New stepper starting at node ${this.currentNode.key} on line ${this.currentNode.line}.`)
        
    }


    takeAStep(L_or_R, stepCycle){
        this.stepCount++;
        let currentLine = this.currentNode.line;
        let currentKey = this.currentNode.key;
        let nextNodeKey = this.currentNode[ L_or_R ];

        this.currentNode = allNodes[nextNodeKey];
        this.stepCycle = stepCycle;
        this.endsInZ = nextNodeKey.slice(-1) == "Z";
        //if(this.stepperID==1) console.log(`${this.stepCount}. At line ${currentLine}, ${currentKey} > ${L_or_R} reaches ${nextNodeKey} at line ${this.currentNode.line}`)
        
        // if(this.endsInZ) {
        //     console.log("     ++++++++++++++++++++++++++ End in Z ! ++++++++++++++++++++++++++")
        //     throw new Error(` Ending in Z found`);
        // }
        
        return nextNodeKey;

    }

}

main8b();
