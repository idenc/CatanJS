"use strict";

const Tile = require("./tile");
const Settlement = require("./settlement");
const io = require('../socket').getio();
const Player = require("./player");
const Honeycomb = require('honeycomb-grid');

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
    players = [];
    availableDevCards = [];
    socketRoom = 'room';
    grid;
    turnNumber = 0;

    static gameboardRadius = 3;

    // socketRoom should be a string to identify
    // which room the game should communicate with
    constructor(socketRoom) {
        this.socketRoom = socketRoom;
        const Grid = Honeycomb.defineGrid();
        const Hex = Honeycomb.extendHex();
        this.grid = Grid.spiral({
            radius: Game.gameboardRadius - 1,
            center: Hex(2, 2),
        });

        // For some reason the bottom and top row start at 1
        // Change this to be 0-indexed
        const topRow = this.grid.filter((t) => t.y === 0);
        topRow.map((t) => t.x--);
        const bottomRow = this.grid.filter((t) => t.y === Game.gameboardRadius + 1);
        bottomRow.map((t) => t.x--);

        this.generateTiles();
        this.generateSettlements();
        this.generateDevCards();
    }

    generateTiles() {
        const tileResources = Game.shuffleArray(['brick', 'brick', 'brick', 'desert', 'grain',
            'grain', 'grain', 'grain', 'lumber', 'lumber', 'lumber', 'lumber',
            'ore', 'ore', 'ore', 'wool', 'wool', 'wool', 'wool']);
        const tileNumbers = Game.shuffleArray(['2', '3', '3', '4', '4', '5', '5', '6', '6',
            '8', '8', '9', '9', '10', '10', '11', '11', '12']);
        let numberIndex = 0;
        for (let i = 0; i < this.grid.length; i++) {
            let tile = {};
            if (tileResources[i] === 'desert') {
                tile = new Tile(tileResources[i], 0);
            } else {
                tile = new Tile(tileResources[i], tileNumbers[numberIndex]);
                numberIndex++;
            }

            tile.x = this.grid[i].x;
            tile.y = this.grid[i].y;
            // Get settlements for this
            let baseX = tile.x * 2;
            const halfRow = Math.ceil((Game.gameboardRadius + 1) / 2);

            if (tile.y < halfRow) {
                baseX++;
            }
            // SW
            tile.settlements.push({x: baseX, y: tile.y + 1});
            // S
            tile.settlements.push({x: baseX + 1, y: tile.y + 1});
            // SE
            tile.settlements.push({x: baseX + 2, y: tile.y + 1});
            if (tile.y < halfRow) {
                baseX--;
            } else if (tile.y > halfRow) {
                baseX++;
            }
            // NE
            tile.settlements.push({x: baseX + 2, y: tile.y});
            // N
            tile.settlements.push({x: baseX + 1, y: tile.y});
            // NW
            tile.settlements.push({x: baseX, y: tile.y});

            this.tiles.push(tile);
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
                    this.settlements.push(new Settlement(0, rowNumTop));
                    this.settlements.push(new Settlement(0, rowNumBottom));
                }

                this.settlements.push(new Settlement((j * 2) + 1, rowNumTop));
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

    generateDevCards() {
        let i;
        for (i = 0; i < 14; i++) {
            this.availableDevCards.push('knight');
        }
        for (i = 0; i < 5; i++) {
            this.availableDevCards.push('victoryPoint');
        }
        for (i = 0; i < 2; i++) {
            this.availableDevCards.push('roadBuilding');
        }
        for (i = 0; i < 2; i++) {
            this.availableDevCards.push('yearOfPlenty');
        }
        for (i = 0; i < 2; i++) {
            this.availableDevCards.push('monopoly');
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
        let selectedTiles = this.tiles.filter(obj => obj.number.toString() === diceRoll);
        //iterate through all selected tiles
        selectedTiles.forEach((tile) => {
            // Iterate through all settlement locations touching tile
            tile.settlements.forEach((settleCoord) => {
                const settlement = this.settlements.get(JSON.stringify(settleCoord));
                const player = this.players.find(p => p.name === settlement.player);
                if (player.length) {
                    player[tile.resource]++;
                }
            });
        });
    }

    robberEvent() {
        //check if each player has > 7, if they do remove half of their resources
        for(let i = 0; i < this.players.length; i++){
            let player = this.players[i];
            let totalResources = player['wool'] + player['brick'] + player['ore'] +
                                    + player['grain'] + player['lumber'];
            if(totalResources >= 7){
                let removalArray = ['brick', 'wool', 'ore', 'grain', 'lumber'];
                let numberToRemove = Math.floor(totalResources/2);
                let removed = 0;
                while(removed < numberToRemove){
                    let index = Math.floor(Math.random() * removalArray.length);
                    if(player[removalArray[index]] > 0){
                        player[removalArray[index]]--;
                        removed++;
                    }
                    else{
                        removalArray.splice(index, 1);
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
                settlements: JSON.stringify(Array.from(this.settlements.entries())),
                roads: this.roads,
                turnNumber: this.turnNumber,
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

            console.log(`dice roll was ${roll}`)

            if (roll === 7) {
                this.robberEvent();
                //Not sure how we want to update players
                socket.to(this.socketRoom).emit('update_players', {playerData: this.players, diceRoll: roll});
                //Somehow allow the player that rolled the 7 to move teh robber
                socket.to(this.socketRoom).emit('handle_robber_event');
            } else {
                this.dealOutResources(roll);
                //Not sure how we want to update players
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
            console.log(newSettlement);
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
            console.log('road received');
            this.roads.push(newRoad);
            io.to(this.socketRoom).emit('update_roads', this.roads);
        });

        //Build Development Card
        socket.on('build_dev_card', () => {
            console.log("dev card build")
            //index between 0 and length-1
            var index = Math.floor(Math.random() * this.availableDevCards.length);
            var card = this.availableDevCards.splice(index, 1);
            socket.emit('dev_card_selected', card); //Dont know where this would go

            //May need to send new length and counts to users to update dev card modal??

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
