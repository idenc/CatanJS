let tiles = [];
let settlements = [];
let roads = [];
let longestRod = null;
let largestArmy = null;
let curentTurnIndex = 0;
let players = []; 
let availableDevCards = [];
let socketRoom = tempRoom;

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
                        else if(settlement.type === 'settlement'){
                            players[pindex][selectedTiles[i].resource] += 2;
                        }
                    }
                }
            }
        }
    }
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
            dealOutResources(roll);
            socket.to(socketRoom).emit('update_players', {playerData: players, diceRoll: roll});
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