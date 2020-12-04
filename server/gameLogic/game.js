"use strict";

const io = require('../socket');

/**
 * Handles an instance of a game
 * All the game logic is coordinated here
 * Game is synchronized through sockets to all players in a room
 * Each game should have a Game class instance
 */
class Game {
    tiles = Game.shuffleArray(['brick', 'brick', 'brick', 'desert', 'grain',
        'grain', 'grain', 'grain', 'lumber', 'lumber', 'lumber', 'lumber',
        'ore', 'ore', 'ore', 'wool', 'wool', 'wool', 'wool']);
    numberTokens = Game.shuffleArray(['2', '3', '3', '4', '4', '5', '5', '6', '6',
        '8', '8', '9', '9', '10', '10', '11', '11', '12']);

    settlements = [];
    roads = [];
    longestRoad = null;
    largestArmy = null;
    currentTurnIndex = 0;
    players = [];
    availableDevCards = [];
    socketRoom = 'room';

    // socketRoom should be a string to identify
    // which room the game should communicate with
    constructor(socketRoom) {
        this.socketRoom = socketRoom;
    }

    // Shuffle the elements of an inputted array
    static shuffleArray(array) {
        let tempArray = array;
        let remainingElements = tempArray.length, temp, index;

        while (remainingElements) {
            //pick a random remaining unshuffled element from the array
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
    dealOutResources(diceRoll) {
        let selectedTiles = this.tiles.filter(obj => obj.number === diceRoll);
        //iterate through all selected tiles
        for (let i = 0; i < selectedTiles; i++) {
            //check every corner of a tile for a settlement
            for (let j = 0; j < selectedTiles[i].corners.length; j++) {
                let settlement = this.settlements.filter(obj => obj.point === selectedTiles[i].corcers[j]);
                //if there is a settlment in that corner figure out who the owner is and
                //allocate resources
                if (settlement) {
                    for (let pindex = 0; pindex < this.players.length; pindex++) {
                        if (settlement.player === this.players[pindex].name) {
                            if (settlement.type === 'settlement') {
                                this.players[pindex][selectedTiles[i].resource] += 1;
                            } else if (settlement.type === 'city') {
                                this.players[pindex][selectedTiles[i].resource] += 2;
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * Probably this method should be called when a room is created
     * for each player in the room
     * @param socket the socket for a player
     */
    configureSocketInteractions(socket) {
        //Prototype for creating game
        //initialize tiles, players, and socketRoom
        socket.on('new_game', () => {

        });

        //Turn Flow: roll dice -> trade -> build -> play development card -> end turn

        //Roll Dice
        socket.on('roll_dice', () => {
            let die1 = Math.floor(Math.random() * 6) + 1;
            let die2 = Math.floor(Math.random() * 6) + 1;
            let roll = die1 + die2;

            if (roll === 7) {
                //i think the client side should handle this then send the results back
                socket.to(this.socketRoom).emit('handle_robber_event');
            } else {
                this.dealOutResources(roll);
                socket.to(this.socketRoom).emit('update_players', {playerData: this.players, diceRoll: roll});
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
        socket.on('dev_card_played', (cardPlayed) => {

        });

        //End Turn
        socket.on('end_turn', () => {
            if (this.currentTurnIndex === this.players.length - 1) {
                this.currentTurnIndex = 0;
            } else {
                this.currentTurnIndex += 1;
            }
            socket.to(this.socketRoom).emit('change_isTurn', this.players[this.currentTurnIndex].name);
        });

        socket.on('robber_moved', (tile) => {

        });

        socket.on('update_player_resources', () => {

        });

        socket.on('test_longest_road', () => {

        });

        socket.on('test_largest_army', () => {

        });
    }
}

export {
    Game
}
