"use strict";


const fs = require("fs");

function main(){
    console.log("Starting 1B");
    // Reat the file and convert the buffer to a string
    var data = fs.readFileSync('Day1Input.txt', 'utf8');
    let txt = data.toString();
    let original = txt.split("\r\n");
    txt = txt.replace(/one/g, `one1one`);
    txt = txt.replace(/two/g, `two2two`);
    txt = txt.replace(/three/g, `three3three`);
    txt = txt.replace(/four/g, `four4four`);
    txt = txt.replace(/five/g, `five5five`);
    txt = txt.replace(/six/g, `six6six`);
    txt = txt.replace(/seven/g, `seven7seven`);
    txt = txt.replace(/eight/g, `eight8eight`);
    txt = txt.replace(/nine/g, `nine9nine`);
    // but not zero

    
    // Remove all the non-numeric characters from the file using Regular expression
    let numData = txt.replace(/[^0-9\n]/g, ``);
    // Convert the text into an array of lines, splitting on the line divider
    let arry = numData.split("\n")
    // Set the total to zero
    let tot = 0;
    // Process each line
    arry.forEach( (line,ix)=>{
        // Get the first and last chars
        let n1 = line.charAt(0);
        let n2 = line.charAt(line.length-1);
        // Concatenate chars then convert into an integer.
        let n = parseInt( n1 + n2);
        // Report just to check
        console.log( {o: original[ix], l: line, n: n} )
        // Add the number to the total
        tot+=n;
    })
    //Report the total
    console.log("Total is " + tot )
    console.log("Finished 1B");
}

main();
