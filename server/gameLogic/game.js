let tiles = [];
let settlements = [];
let roads = [];
let longestRod = null;
let largestArmy = null;
let curentTurnIndex = 0;
let players = []; 
let availableDevCards = [];
let socketRoom = tempRoom;

function dealOutResources(diceRoll){
    
}

module.exports = socket => {
    //Prototype for creating game
    //initialize tiles, players, and socketRoom
    socket.on('new_game', () => {

    });

    //Turn Flow: roll dice -> trade -> build -> play development card -> end turn

    //Roll Dice
    socket.on('roll_dice', () =>{
        let die1 = Math.floor(Math.random() * 6) + 1;
        let die2 = Math.floor(Math.random() * 6) + 1;
        let roll = die1 + die2;

        if(roll === 7){
            //i think the client side should handle this then send the results back
            socket.to(socketRoom).emit('handle_robber_event');
        }
        else{
            let updatedPlayers = dealOutResources(roll);
            socket.to(socketRoom).emit('update_players', {playerData: updatedPlayers, diceRoll: roll});
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

    });

    //Play Development Card
    socket.on('development_card', (cardPlayed) =>{

    })

    //End Turn
    socket.on('end_turn', () => {
        
    })

    socket.on('update_player_resources', () =>{

    });

    socket.on('test_longest_road', ()=>{

    });

    socket.on('test_largest_army', () => {

    });
}