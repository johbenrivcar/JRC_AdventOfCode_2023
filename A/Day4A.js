const fs = require("fs");

const colourLimits = { "red": 12, "green": 13, "blue": 14}
const nonSymbol = "0123456789.";


const allCards = [];

function main4a(){
    console.log("Starting 4A");

    var data = fs.readFileSync('Day4Input.txt', 'utf8');
    //var data = fs.readFileSync('Day4BtestInput.txt', 'utf8');
    let txt = data.toString();

    let lines = txt.split("\r\n")
    let totalValue = 0;


    lines.forEach( (line,ix)=>{
        console.log(ix, line)
        let thisCard = { line };
        allCards.push( thisCard );

        let p1 = line.split(": ");
        let p2 = p1[0].split(" ");
        let cardNo = parseInt( p2[1] );
        thisCard.cardNo = cardNo;

        let p3 = p1[1].split( " | ");
        let sWinners = p3[0].split(" ");
        let winners = thisCard.winners = []
        sWinners.forEach(winner=>{
            let n = parseInt(winner);
            if(n ) winners.push(n)
        })

        let sEntries = p3[1].split(" ");
        let entries = thisCard.entries = []
        sEntries.forEach(entry=>{
            let n = parseInt(entry);
            if(n ) entries.push(n)
        })
        console.log( cardNo, winners, entries);
        let cardValue =  0;
        let matchesCount = 0;
        entries.forEach( entry=>{
            if( winners.includes(entry) ){
                matchesCount++;
                cardValue = cardValue==0? 1 : cardValue * 2;
                console.log(`${entry} is a winner, so card value is now ${ cardValue }`)
            }

        })
        thisCard.matchesCount = matchesCount
        thisCard.cardValue = cardValue;
        totalValue += cardValue;
        console.log(`Card ${cardNo}`, thisCard)
        if(cardValue>0) console.log(`The total value is now ${totalValue}`)

    })


    console.log(`4A The total value of all card values is ${totalValue}.`)

    console.log("finished 4A");
}

function main4b(){
    console.log("starting 4B");
    // We have to go backwards up the list of cards to work out how many copies of cards we get
    // on each card. That gives us a cumulative card value.
    let totalCardsWon = allCards.length;
    for(let cardIx= allCards.length-1 ; cardIx >= 0; cardIx--){
        let thisCard = allCards[cardIx];
        let cardsWonCount = thisCard.matchesCount;
        for( let matchIx = 1; matchIx <= thisCard.matchesCount; matchIx++ ){
            let matchCard = allCards[matchIx + cardIx];
            cardsWonCount += matchCard.cardsWonCount;
        }
        thisCard.cardsWonCount=cardsWonCount;
        totalCardsWon+= cardsWonCount;
        console.log(`Card ${thisCard.cardNo} won ${thisCard.matchesCount} cards. So ${cardsWonCount} copies were added to the total`);
        console.log(`The total cards won now stands at ${totalCardsWon}.`)
    }
    
    console.log("finished 4B");
}

main4a();
main4b();
