"use strict";

/**
 * Day 6A
 */
const fs = require("fs");

// Array of all the input seed numbers from line 1
const allHands=[];

const handTypeStrength=[
    0,
    , 11111
    , 1112
    , 122
    , 113
    , 23
    , 14
    , 5
];

const cardStrength = "-J23456789TQKA";



function main7b(){
    console.log("Starting 7B -----------------------------------------------------------------");

    // load the input file
    var data = fs.readFileSync('Day7Input.txt', 'utf8');
    
    // Convert the input text into an array, each entry is one line
    let txt = data.toString();
    let lines = txt.split("\r\n");

    lines.forEach( (line, lineIx)=>{
        let cardOut = {};
        
        let [ hand, sBid ]=line.split(' ');
        let bid = parseInt(sBid);
        let cards = hand.split('');
        let counts = {};
        


        let cardOrderStrength = 0;

        
        cards.forEach(card=>{
            if(counts[card]) { counts[card]++; } else { counts[card]=1 };
            let thisCardStrength = cardStrength.indexOf( card );
            cardOrderStrength = cardOrderStrength * 100 + thisCardStrength

        });
        let jokerCount = 0;
        if( counts["J"] ) jokerCount = counts["J"];
        
        cardOut.jokerCount = jokerCount;

        delete counts["J"];
        if(jokerCount==5) counts["A"]=0;

        let handShape = [];
        let cardKeys = Object.keys(counts);
        cardKeys.forEach((key, pp) =>{
            let count = counts[key];
            // add the joker count to the highest-count card
            handShape.push( count  );
        })
        //   + (pp==0? jokerCount : 0)
        let handType = parseInt( handShape.sort().join('') );
        let p10 = cardKeys.length - 1;
        handType += jokerCount //* (10 ^ p10);

        let handStrength = handTypeStrength.indexOf(handType);

        let wholeHandStrength = handStrength * 10000000000 + cardOrderStrength;
        Object.assign( cardOut , 
                { lineIx, 
                    hand, 
                    bid, 
                    cards, 
                    counts, 
                    p10, 
                    cardKeys, 
                    handType, 
                    handStrength, 
                    handOrderStrength: cardOrderStrength, 
                    wholeHandStrength, 
                    ls: wholeHandStrength.toLocaleString()
                });
        allHands.push( cardOut );
        if (handStrength < 0  ) { 
            console.log( cardOut );
            throw new Error(`Hand strength not correct on hand #${lineIx+1}`);
        }

    })
    console.log(allHands);

    let orderedHands = allHands.sort( (a,b)=>{ return a.wholeHandStrength - b.wholeHandStrength } );

    let totalHandWinnings = 0;
    orderedHands.forEach((hand,ix)=>{
        hand.rank = ix+1;
        let handWinnings = hand.bid * hand.rank;
        totalHandWinnings += handWinnings;
        hand.handWinnings = handWinnings;
    })

    console.log("ordered vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv\n", orderedHands)

    console.log(`Total hand winnings: ${totalHandWinnings} = ${totalHandWinnings.toLocaleString()}`)
    console.log("Finished 7B");
};

main7b();