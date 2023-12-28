"use strict";

/**
 * Day 8A
 */

const fs = require("fs");

const allNodes = {};

function main9a(){
    console.log("Starting 9A -----------------------------------------------------------------");

    // load the input file
    var data = fs.readFileSync('Day9Input.txt', 'utf8');
    
    // Convert the input text into an array, each entry is one line
    let txt = data.toString();
    let lines = txt.split("\r\n");
    //console.log(lines);
    let hists = lines.map((line,lineIX)=>{
            return line.split(" ").map(item=>{ return parseInt(item )} );
        });

    console.log(`hists 0`,hists[0])

    let totalResult = 0;
    hists.forEach(hist=>{
        let answer = traverse( hist );
        totalResult+=answer;
    })
    
    
        console.log(`result`, totalResult )
    console.log("Finished 9A -----------------------------------------------------------------");
}

function traverse( hist, level=0 ){
    level++;
    console.log(`L${level} hist`, hist)
    let diffs = [];
    let allZero = true;
    for(let ix=1; ix < hist.length; ix++){
        let diff = hist[ix] - hist[ix-1];
        console.log(`${hist[ix]}-${hist[ix-1]}=${diff}`)
        diffs.push( diff )
        allZero = (allZero && diff === 0);
    }

    console.log(`L ${level} diffs`, diffs)

    if(allZero) return hist[hist.length-1]; 

    let v = traverse(diffs, level);
    console.log(`L ${level} answer: ${v}`  )
    return hist[hist.length-1] + v
    
}

main9a()