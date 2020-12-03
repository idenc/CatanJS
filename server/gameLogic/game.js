let tiles = [];
let settlements = [];
let roads = [];
let longestRod = null;
let largestArmy = null;
let curentTurnIndex = 0;
let players = []; 
let availableDevCards = [];
let socketRoom = tempRoom;


function shuffleArray(array){
    let tempArray = array;
    let remainingElements = tempArray.length, temp, index;

    while (remainingElements) {
        //pick a random remaining unshuffeled element from the array
        index = Math.floor(Math.random() * remainingElements--)
        //move that random element to the back of the array then decrease array size by 1
        //elements in the back of the array are shuffled
        temp = tempArray[remainingElements];
        tempArray[remainingElements] = tempArray[index];
        tempArray[index] = temp;
    }
    return tempArray;
}

//there has to be a more efficient way of doing this
function dealOutResources(diceRoll){
    let selectedTiles = tiles.filter(obj => obj.number === diceRoll);
    //iterate through all selected tiles
    for(let i = 0; i < selectedTiles; i++){
        //check every corner of a tile for a settlement
        for(let j = 0; j < selectedTiles[i].corners.length; j++){
            let settlement = settlements.filter(obj => obj.point === selectedTiles[i].corcers[j]);
            //if there is a settlment in that corner figure out who the owner is and 
            //allocate resources
            if(settlement){
                for(let pindex = 0; pindex < players.length; pindex++){
                    if(settlement.player === players[pindex].name){
                        if(settlement.type === 'settlement'){
                            players[pindex][selectedTiles[i].resource] += 1;
                        }
                        else if(settlement.type === 'city'){
                            players[pindex][selectedTiles[i].resource] += 2;
                        }
                    }
                }
            }
        }
    }
}

function shuffleDevCards(){
    let typesOfCards = ['knight', 'roadBuilding', 'yearOfPlenty', 'monopoly', 'victoryPoint'];
    let numberOfEach = [14, 2, 2, 2, 5];

    //populate dev card deck
    for(let i = 0; i < numberOfEach; i++){
        for(let j = 0; j < numberOfEach[i]; j++){
            availableDevCards.push(typesOfCards[i]);
        }
    }

    //shuffle dev card deck
    availableDevCards = shuffleArray(availableDevCards);
}

/////////////////Testing///////////////////////
function generateTestTiles(){
    let resources = ['brick', 'brick', 'brick', 'desert', 'grain', 'grain', 'grain', 'grain', 'lumber', 'lumber', 'lumber', 'lumber',
        'ore', 'ore', 'ore', 'wool', 'wool', 'wool', 'wool']
    let numberTokens = ['2', '3', '3', '4', '4', '5', '5', '6', '6', '8', '8', '9', '9', '10', '10', '11', '11', '12']

    resources = shuffleArray(resources);
    numberTokens = shuffleArray(numberTokens);
    let numberIndex = 0;
    for(let i = 0; i < resources.length; i++){
        if(resources[i] !== 'desert'){
            let tempTile = {resource: resources[i], number: numberTokens[numberIndex]};
            tiles.push(tempTile);
            numberIndex += 1;
        }
        else{
            tiles.push(tempTile);
            let tempTile = {resource: resources[i], number: 0};
        }
    }
}

function generateTestPlayers(){
    for(let i = 0; i < 4; i++){
        let tempName = 'player' + i;
        let tempPlayer = {name: tempName, victoryPoints: 0, clay: 0, ore: 0, sheep: 0, 
                            wheat: 0, lumber: 0, isTurn: false, devCards: [], knights: 0, harbourBonuses: [], color: blue};
        players.push(tempPlayer);
    }
    players[0].isTurn = true;
}

function generateTestSettlements(){
    let tempSettlement = {tiles:[1, 12], player: 'player0', type: 'settlement', harbour: {ratio: 2, type: 'lumber'}};
    settlements.push(tempSettlement);
    tempSettlement = {tiles:[3, 4, 15], player: 'player1', type: 'city', harbour: {}};
    settlements.push(tempSettlement);
    tempSettlement = {tiles:[1, 13, 14], player: 'player2', type: 'settlement', harbour: {}};
    settlements.push(tempSettlement);
    tempSettlement = {tiles:[8, 9, 17], player: 'player3', type: 'settlement', harbour: {}};
    settlements.push(tempSettlement);
}
/////////////////Testing///////////////////////

module.exports = socket => {
    //Prototype for creating game
    //initialize tiles, players, dev cards, and socketRoom
    socket.on('new_game', () => {
        shuffleDevCards();

        /////////Testing/////////
        generateTestTiles();
        generateTestPlayers();
        generateTestSettlements();
        /////////Testing/////////
    });

    //Turn Flow: roll dice -> trade -> build -> play development card -> end turn

    //Roll Dice
    socket.on('roll_dice', () =>{
        let die1 = Math.floor(Math.random() * 6) + 1;
        let die2 = Math.floor(Math.random() * 6) + 1;
        let roll = die1 + die2;
        socket.to(socketRoom).emit('roll_result', roll);
        if(roll === 7){
            //i think the client side should handle this then send the results back
            //this will send back info to the player that rolled a 7 allowing them to move the robber
            //once the robber has been moved send that data back here to the server
            //socket.on('robber_moved') will then handle updating server data and 
            //broadcasting the results back to other players
            socket.to(socket.id).emit('handle_robber_event');
        }
        else{
            dealOutResources(roll);
            socket.to(socketRoom).emit('update_players', players);
        }
    });

    //Trade
    socket.on('trade_offer', (dealer, customer) => {

    });

    socket.on('trade_outcome', (dealer, customer) => {

    });

    //Build Settlement
    socket.on('build_settlement', (newSettlement) => {

    });

    //Build Road
    socket.on('build_road', (newRoad) => {

    });

    //Build Development Card
    socket.on('build_dev_card', () => {
        let devCard = availableDevCards.shift();
        if(devCard){
            players[curentTurnIndex].devCards.push(devCard);
            socket.to(socket.id).emit('draw_result', devCard);
        }
        else{
            socket.to(socket.id).emit('draw_result', 'No More Dev Cards left in Deck');
        }
        
    });

    //Play Development Card
    //cardPlayed = string indicating what type of dev card was played
    socket.on('dev_card_played', (cardPlayed) =>{
        //['knight', 'roadBuilding', 'yearOfPlenty', 'monopoly', 'victoryPoint']
        let toBeRemoved = players[curentTurnIndex].devCards.indexOf(cardPlayed);
        players[curentTurnIndex].devCards.splice(toBeRemoved, 1);
        if(cardPlayed === 'knight'){
            socket.to(socket.id).emit('handle_robber_event');
        }
        else if(cardPlayed === 'roadBuilding'){
            socket.to(socket.id).emit('build_road');
        }
        else if(cardPlayed === 'yearOfPlenty'){
            socket.to(socket.id).emit('draw_resource_cards');
        }
        else if(cardPlayed === 'monopoly'){
            socket.to(socket.id).emit('pick_a_monopoly');
        }
        else if(cardPlayed === 'victoryPoint'){
            players[curentTurnIndex].victoryPoints += 1;
            socket.to(socketRoom).emit('update_players', players);
        }
    });

    //End Turn
    socket.on('end_turn', () => {
        if(curentTurnIndex === players.length - 1){
            curentTurnIndex = 0;
        }
        else{
            curentTurnIndex += 1;
        }
        //emitting the name of the player who is up next. 
        socket.to(socketRoom).emit('change_isTurn', players[curentTurnIndex].name);
    });

    socket.on('monopoly_claimed', () =>{

    });

    socket.on('robber_moved', (tile) => {
        
    });

    socket.on('update_player_resources', () =>{

    });

    socket.on('test_longest_road', ()=>{

    });

    socket.on('test_largest_army', () => {

    });
}