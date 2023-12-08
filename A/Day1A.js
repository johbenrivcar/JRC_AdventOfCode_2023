"use strict";
console.log("Starting A");


const fs = require("fs");
function main(){
    // Reat the file and convert the buffer to a string
    var data = fs.readFileSync('Day1Input.txt', 'utf8');
    let txt = data.toString();
    // Remove all the non-numeric characters from the file using Regular expression
    let numData = txt.replace(/[^0-9\n]/g, ``);
    // Convert the text into an array of lines, splitting on the line divider
    let arry = numData.split("\n")
    // Set the total to zero
    let tot = 0;
    // Process each line
    arry.forEach( line=>{
        // Get the first and last chars
        let n1 = line.charAt(0);
        let n2 = line.charAt(line.length-1);
        // Concatenate chars then convert into an integer.
        let n = parseInt( n1 + n2);
        // Report just to check
        console.log( line, n )
        // Add the number to the total
        tot+=n;
    })
    //Report the total
    console.log("Total is " + tot )
}

main();
