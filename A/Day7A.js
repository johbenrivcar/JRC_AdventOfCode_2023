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

const cardStrength = "-23456789TJQKA";



function main7a(){
    console.log("Starting 7A -----------------------------------------------------------------");

    // load the input file
    var data = fs.readFileSync('Day7Input.txt', 'utf8');
     
    // Convert the input text into an array, each entry is one line
    let txt = data.toString();
    let lines = txt.split("\r\n");

    lines.forEach( (line, ix)=>{
        let [ hand, sBid ]=line.split(' ');
        let bid = parseInt(sBid);
        let cards = hand.split('');
        let counts = {};
        
        let cardOrderStrength = 0;

        
        cards.forEach(card=>{
            if(counts[card]) { counts[card]++; } else { counts[card]=1 };
            let thisCardStrength = cardStrength.indexOf( card );
            cardOrderStrength = cardOrderStrength * 100 + thisCardStrength

        })

        let handShape = [];
        let cardKeys = Object.keys(counts);
        cardKeys.forEach(key=>{
            let count = counts[key];
            handShape.push(count);
        })

        let handType = parseInt( handShape.sort().join('') );
        let handStrength = handTypeStrength.indexOf(handType);
        let wholeHandStrength = handStrength * 10000000000 + cardOrderStrength;

        allHands.push( {ix, hand, bid, cards, counts, cardKeys, handType, handStrength, handOrderStrength: cardOrderStrength, wholeHandStrength, ls: wholeHandStrength.toLocaleString()} );
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
    console.log("Finished 7A");
};

main7a();