
const fs = require("fs");

const colourLimits = { "red": 12, "green": 13, "blue": 14}
const nonSymbol = "0123456789.";


const oLines = [];

const allSymbols = {};
const allNumbers = [];
const allStars = {};


function main3a(){
    console.log("Starting 3A");

    var partNums = [];
    var sumOfPossibleGameIds = 0;
    var sumOfMinSetPowers = 0;

    var data = fs.readFileSync('Day3Input.txt', 'utf8');
    let txt = data.toString();

    let lines = txt.split("\r\n")


    lines.forEach( (line, lineIx)=>{
        // Process a line

        // Create the line object in the lines array
        oLine = oLines[lineIx] = { lineIx, line, chars: [] }

        // Get the array of characters in the line
        let chars = oLine.chars = line.split("");

        // For each character in the line;
        let prevDigit = { isADigit: false, numValue: 0 };
        chars.forEach( (char, charIx)=>{

            // Create a character entry
            let thisChar = oLine.chars[charIx]={ lineIx, charIx, char, charValue : nonSymbol.indexOf(char) }



            thisChar.isASymbol = thisChar.charValue < 0;
            thisChar.isAStar = thisChar.char = "*";
            thisChar.isADigit = ( -1 < thisChar.charValue && thisChar.charValue  < 10 ? true : false );
            thisChar.isADot = thisChar.charValue == 10;
            thisChar.appendDigit = appendDigit;
            thisChar.isNextToASymbol = isNextToASymbol;



            if(thisChar.isADigit && prevDigit.isADigit ) thisChar.prevDigit = prevDigit;

            
            if(thisChar.isASymbol) {
                thisChar.adjacentNumberCount = 0;
                allSymbols[ `${lineIx}.${charIx}`] = thisChar;
                if( thisChar.isAStar ) {
                    allStars[`${lineIx}.${charIx}` ] = thisChar;
                    thisChar.adjacentNumbers = [];
                }

            }

            if(thisChar.isADigit) { 
            
                let aCells = thisChar.adjacentCells = {};

                for(var r=-1; r<2; r++){
                    for(var c=-1; c<2; c++){
                        if(r!=0||c!=0){
                            let xr = thisChar.lineIx + r
                            let xc = thisChar.charIx + c
                            let key=`${xr}.${xc}`
                            aCells[key]=key ;
                        }   
                    };
                };

                if( prevDigit.isADigit ) { 
                        prevDigit.nextDigit = thisChar;
                        prevDigit.appendDigit( thisChar  )
                        thisChar.numValue = prevDigit.numValue;
                        console.log(` -- Digit at ${lineIx}.${charIx}: ${thisChar.charValue} added to number, now ${ thisChar.numValue }`)
                } else {
                    thisChar.numValue = thisChar.charValue;
                    allNumbers.push(thisChar);
                    console.log(`===============\n Adding the number starting at ${lineIx}.${charIx}`, thisChar)
                }

            };


            prevDigit = thisChar;
        });
        //console.log( oLine );

    });

    // Now we have to find which numbers are valid

    let sumOfParts = 0;
    let numbersAdded = [];
    console.log( `There are ${allNumbers.length} numbers in the data`)
    let symKeys = Object.keys(allSymbols)
    console.log( `There are ${symKeys.length} symbols in the data`);
    console.log( symKeys.toString() )
    allNumbers.forEach( number=>{
        if( number.isNextToASymbol() ){
             sumOfParts += number.numValue;
             numbersAdded.push( number.numValue);
             //console.log (`Adding number`, number)
        }

    })

    console.log(`Total of all part numbers: ${sumOfParts}`)
    console.log(`All the part numbers added: ${numbersAdded.toString()}`)
    console.log("Finished 3A")

}



function appendDigit ( oChar ){
    this.numValue = this.numValue * 10 + oChar.charValue;
    // add all the adjacent cells of the added digit for this number
    Object.assign( this.adjacentCells, oChar.adjacentCells )
    if(this.prevDigit) if(this.prevDigit.isADigit){
        this.prevDigit.appendDigit( oChar );
        this.numValue = this.prevDigit.numValue ;
    }
};

function isNextToASymbol(){
    let r = this.lineIx;
    let c = this.charIx;
    //console.log(`Checking if number at ${r}.${c} is next to a symbol`);
    let neighbours = [ {r: r-1, c: c-1}, {r: r-1, c: c}, {r: r-1, c: c+1}, {r: r, c: c-1}, {r: r, c: c+1 },{r: r+1, c: c-1}, {r: r+1, c: c}, {r: r+1, c: c+1} ]
    let isNextToSymbol = false;
    neighbours.every( ref=>{
        let key=`${ref.r}.${ref.c}`
        if(allSymbols[key]){
            isNextToSymbol=true;
            return false;
        }
        return true;
    })

    if(isNextToSymbol) return true;

    if(this.nextDigit) return this.nextDigit.isNextToASymbol();

    return false;




};

function registerWithAdjacentStars(number){
    
    let r = number.lineIx;
    let c = number.charIx;
    //console.log(`Checking if number at ${r}.${c} is next to a symbol`);
    let neighbours = number.adjacentCells;
    let keys = Object.keys( neighbours );

    keys.forEach( key=>{
        
        let star = allStars[key]
        if(star){
            star.adjacentNumbers.push( number )
        }
    })

}

function main3b(){
    
    let totalRatios = 0;
    
    allNumbers.forEach( number=>{
        registerWithAdjacentStars(number);
    });

    let keys = Object.keys(allStars);
    
    keys.forEach( key=>{
        let star = allStars[key];
        if( star.adjacentNumbers.length == 2 ){
            let n1 = star.adjacentNumbers[0].numValue
            let n2 = star.adjacentNumbers[1].numValue
            let ratio = n1 * n2;
            totalRatios += ratio;
            console.log(`Star at ${star.lineIx}.${star.charIx} has 2 adjecent numbers, ${n1} and ${n2} so it is a gear with ratio ${ratio} `)
        }
    })
    console.log(`Total of all ratios is ${totalRatios}`);
}


main3a();
main3b();
