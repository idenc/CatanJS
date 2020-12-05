"use strict";

const Tile = require("./tile");
const Settlement = require("./settlement");
const io = require('../socket').getio();

/**
 * Handles an instance of a game
 * All the game logic is coordinated here
 * Game is synchronized through sockets to all players in a room
 * Each game should have a Game class instance
 */
class Game {
    tiles = []
    // Initialize settlements as an array,
    // Once the settlements are populated,
    // a hash map is generated with keys
    // being the settlement's (x, y) coordinate
    settlements = [];
    roads = [];
    longestRoad = null;
    largestArmy = null;
    currentTurnIndex = 0;
    players = [];
    availableDevCards = [];
    socketRoom = 'room';
    static gameboardRadius = 3;

    // socketRoom should be a string to identify
    // which room the game should communicate with
    constructor(socketRoom) {
        this.socketRoom = socketRoom;
        this.generateTiles();
        this.generateSettlements();
    }

    generateTiles() {
        const tileResources = Game.shuffleArray(['brick', 'brick', 'brick', 'desert', 'grain',
            'grain', 'grain', 'grain', 'lumber', 'lumber', 'lumber', 'lumber',
            'ore', 'ore', 'ore', 'wool', 'wool', 'wool', 'wool']);
        const tileNumbers = Game.shuffleArray(['2', '3', '3', '4', '4', '5', '5', '6', '6',
            '8', '8', '9', '9', '10', '10', '11', '11', '12']);

        for (let i = 0; i < tileResources.length; i++) {
            this.tiles.push(new Tile(tileResources[i], tileNumbers[i]));
        }
    }

    getSettlementsMap() {
        const settlementsMap = new Map();
        for (const settlement of this.settlements) {
            settlementsMap.set(
                JSON.stringify({x: settlement.x, y: settlement.y}),
                settlement
            );
        }
        return settlementsMap;
    }

    /**
     * Sets the initial state of each settlement
     * @returns {[]}
     */
    generateSettlements() {
        const rowWidth = Game.gameboardRadius;
        const maxRowWidth = (Game.gameboardRadius - 1) * 2 + 1;
        let rowNumTop = 0;
        let rowNumBottom = maxRowWidth;
        for (let i = rowWidth; i <= maxRowWidth; i++) {
            // Loops through each hex in the current row
            for (let j = 0; j < i; j++) {
                if (j === 0) {
                    this.settlements.push(new Settlement(0,rowNumTop));
                    this.settlements.push(new Settlement(0, rowNumBottom));
                }

                this.settlements.push(new Settlement((j * 2) + 1,rowNumTop));
                this.settlements.push(new Settlement((j * 2) + 2, rowNumTop));
                this.settlements.push(new Settlement((j * 2) + 2, rowNumBottom));
                this.settlements.push(new Settlement((j * 2) + 1, rowNumBottom));
            }
            rowNumTop++;
            rowNumBottom--;
        }
        this.assignNeighbours(maxRowWidth);
        this.settlements = this.getSettlementsMap();
    }

    assignNeighbours(maxRowWidth) {
        const numRows = maxRowWidth + 1;
        const halfRow = Math.ceil(numRows / 2);
        for (let i = 0; i < maxRowWidth + 1; i++) {

            // Get all settlements in a row
            const rowSettlements = this.settlements.filter(s => s.y === i);

            rowSettlements.forEach((settlement) => {
                const neighbours = [];
                if (settlement.x > 0) {
                    // left neighbour
                    neighbours.push({x: settlement.x - 1, y: settlement.y});
                }
                if (settlement.y > 0
                    && (settlement.y < halfRow && settlement.x % 2 !== 0 || settlement.y >= halfRow && settlement.x % 2 === 0)) {
                    // above neighbour
                    neighbours.push({
                        x: i < halfRow ? settlement.x - 1 : i > halfRow ? settlement.x + 1 : settlement.x,
                        y: settlement.y - 1
                    })
                }
                // right neighbour
                if (settlement.x < rowSettlements.length - 1) {
                    neighbours.push({x: settlement.x + 1, y: settlement.y});
                }
                if (settlement.y < maxRowWidth
                    && (settlement.y < halfRow && settlement.x % 2 === 0 || settlement.y >= halfRow && settlement.x % 2 !== 0)) {
                    // below neighbour
                    neighbours.push({
                        x: i < halfRow - 1 ? settlement.x + 1 : i >= halfRow ? settlement.x - 1 : settlement.x,
                        y: settlement.y + 1
                    })
                }

                settlement.neighbours = neighbours;
            });
        }
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
        socket.join(this.socketRoom);
        socket.on('player_joined', (username) => {
            socket.emit('board_info', {
                tiles: this.tiles,
                settlements: JSON.stringify(Array.from(this.settlements.entries()))
            });
        });

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
            console.log('settlement received');
            // Update the server's settlement object
            const settlement = this.settlements.get(JSON.stringify({
                x: newSettlement.x,
                y: newSettlement.y
            }));
            settlement.player = newSettlement.player;
            settlement.state = newSettlement.state;

            // Send the updated settlement to all players
            io.to(this.socketRoom).emit('update_settlements',
                JSON.stringify(Array.from(this.settlements.entries())));
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

module.exports = {
    Game
}
