"use strict";

/**
 * Day 8A
 */
const fs = require("fs");
const { setTimeout } = require( 'node:timers/promises' );

// This contains all the nodes from the input, with the alphabetic keys replaced by indexes
// So, for example, the input line DFA = (TJT, DMP) from line 53 of the input becomes the node
// with index 9 in the map [ 657, 710, 0, 50, 'DFA' ] which are:
//  657 index of the node to the Left i.e. TJT
//  710 index of the node to the Right i.e. DMP
//  0 node type: 0=ends with A, 1=ends with Z, -1=any other char
//  DFA original key for this node
var nodeMap;

// Array of L/R characters for left and right steps, from first line of the input
var steps;

// rray of L/R characters for left and right steps, from first line of the input,
// converted from strings to numbers, where 0 is L and 1 is R
var nSteps;

// Array containing the stepping nodes that we are currently positioned on, used to run through the steps.
// Initially these are the nodes whose key ends with the letter A. In the input data there are six of them.
// When each step is taken, all the steppers are replaced by the next node pointed to by the direction
// of the step, either left or right.
var steppers  = [];

// The original input, split into lines. After the initial load the first two lines are removed, so this
// contains only the lines that contain nodes, in the format XXXX = (YYYY, ZZZZ)
var lines;

// contains a lookup from the alpha key for a node to a specific index number in the nodes array
var index2Key = [];



async function main8b(){
    console.log("Starting 8B -----------------------------------------------------------------");

    loadInputData();

    // BUILD THE NODE MAP
    // The primary purpose is to convert all the alpha keys into numeric
    // indexes so that the stepping logic runs quickly.
    
    // Index of keys. Used to look up the index number for an alpha key
    let key2Index = {};
    // Array of keys, used to look up the alpha key value from an index number
    index2Key = [];

    lines.forEach( (line,lineIx)=>{
        let key=line.slice(0,3)
        key2Index[key]=lineIx;
        index2Key[lineIx]=key;
    })
    

    // create the node map, which gives the left and right turn directions for each
    // node, used to step through the nodes. 
    nodeMap=lines.map( (line,lineIx)=>{
        let key = line.slice(0,3);
        let leftKey = line.slice( 7, 10 );
        let rightKey = line.slice( 12, 15);
        
        // Determine type by last letter of key, 0 = ends with A, 1 = ends with Z, -1 otherwise
        let type = 'AZ'.indexOf(key.slice(-1));
        let starter = type===0 ? 1: 0;
        let ender = type===1? 1: 0;

        let leftIx = key2Index[leftKey];
        let rightIx = key2Index[rightKey];

        // check if this node will be a starter
        if( starter ) steppers.push([ leftIx, rightIx, starter, ender, lineIx, key]);

        // create a node object, comprising the L and R key codes for this node
        // index 0 and 1 - the left and right branches
        return [ leftIx, rightIx, starter, ender, lineIx, key] 
        
    });
    
    // Check that the node map and steppers have been set up correctly
    console.log(`nodeMap` , nodeMap);
    console.log(`steppers`, steppers);
    console.log(`Steppers>original lines`, steppers.map(
            stepper=>{
                return `${lines[stepper[4]]} L=> ${lines[stepper[0]]} R=> ${lines[stepper[1]]}`; ;
            }
        )
    );
    

    // Now we are ready to run the steps through the steppers
    

    // endsCount is the number of steppers that have reached the destination, i.e. that have
    // a key ending in Z
    var enderCount = 0;
    // finLimit is the number of steppers that must end in Z after they have all taken a step, to
    // indicate that we have reach the destination, i.e. all the steppers are on a node ending with Z
    var stepperCount = steppers.length;
    var stepInfo = { stepNumber: 0, nSteps: nSteps }
    // Create the nextstep function which provides a stream of steps cycling round the step list
    var nextStep = fnNextStep( stepInfo )
    // Loop until the all the steppers have reached an ender node (ending with Z)
    while( enderCount<stepperCount ){
        

            enderCount = 0; 
            let step = nextStep();

            steppers = steppers.map(
                
                (stepper, ix)=>{
                    var n = nodeMap[stepper[step]];
                    // increment the ender cound if this is an ender
                    enderCount+=n[3];
                    return n
                }
            );

            if(stepInfo.stepNumber%100000000===0) console.log(`Step #${stepInfo.stepNumber.toLocaleString()}.`);
            
            // Report when we get more than 3 enders at this step
            if( enderCount > 3 ){
                console.log(`${enderCount} enders at step #${stepInfo.stepNumber.toLocaleString()}`)
            };

        }
    console.log(`Completed at ${stepInfo.stepNumber.toLocaleString()} steps with ${enderCount} enders found at this step.`)
    console.log( steppers );

    console.log("Finished 8B -----------------------------------------------------------------");

};




main8b();


function fnNextStep( stepInfo ){
    stepInfo.stepNumber = 0;
    let nSteps = stepInfo.nSteps;
    return function(){ return nSteps[ stepInfo.stepNumber++ % nSteps.length ] }
}

function loadInputData(){
    
    // load the input file
    var data = fs.readFileSync('Day8Input.txt', 'utf8');
    
    // Convert the input text into an array, each entry is one line
    let txt = data.toString();
    lines = txt.split("\r\n");
    //console.log(lines);

    let firstLine = lines.shift();
    steps = firstLine.split('');

    // nSteps is the same as steps except using 0 and 1 instead of L and R
    nSteps = steps.map( step=>{ return step==='L'? 0: 1 ;})

    console.log(firstLine);
    console.log(nSteps.join(''));
    // remove the blank line
    lines.shift();
    console.log(`lines` , lines)

}



// =========================================================================================
// REPORTING FUNCTIONS ONLY
//

/**
 * Node format is [ leftIx, rightIx, starter, ender, lineIx, key ]
 *  Given an array of nodes in nodeMap format, returns an array of objects representing those nodes
 *  with numeric indexes converted to alphabetic node key. Used for reporting
 * @param {*} nodes 
 * @returns 
 */
function alphaNodes(nodes){
    return nodes.map((node)=>{
        //console.log(`Looking up entry at ${nodeIx}: `, node)
        return alphaNode(node) 
    })
}
/**
 * Converts a single given node into the alphabetic form for reporting
 * @param {*} node 
 * @returns 
 */
function alphaNode(node){
    return {key: node[4], L: index2Key[node[0]], R: index2Key[node[1]], starter, ender , ix: node[3] }
}

// /**
//  * Creates a string for reporting a node in compact format
//  * @param {*} node 
//  * @returns 
//  */
// function reportNode(node){
//     let aNode = alphaNode(node);
//     return ` #${aNode.ix} [${aNode.key}] ${aNode.L}<>${aNode.R}, ${ aNode.type  } }`
// }
