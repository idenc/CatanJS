"use strict";

const Tile = require("./tile");
const Settlement = require("./settlement");
const io = require('../socket').getio();
const Player = require("./player");
const Honeycomb = require('honeycomb-grid');
const maxBuildings = require('../../src/assets/js/constants').maxBuildings;
const ChatRoom = require('../chat');

/**
 * Handles an instance of a game
 * All the game logic is coordinated here
 * Game is synchronized through sockets to all players in a room
 * Each game should have a Game class instance
 */
class Game {
    static MAX_ROADS = maxBuildings.roads;
    static MAX_SETTLEMENTS = maxBuildings.settlements;
    static MAX_CITIES = maxBuildings.cities;
    static GAMEBOARD_RADIUS = 3;

    tiles = []
    // Initialize settlements as an array,
    // Once the settlements are populated,
    // a hash map is generated with keys
    // being the settlement's (x, y) coordinate
    settlements = [];
    roads = [];
    longestRoadOwner = null;
    longestRoadLength = 0;
    largestArmy = null;
    players = [];
    availableDevCards = [];
    socketRoom = 'room';
    grid;
    turnNumber = 0;
    playerColours = ['#FF0000', '#008000', '#0000ff', '#FFA500'] // Red, green, blue, orange
    chatRoom;

    // socketRoom should be a string to identify
    // which room the game should communicate with
    constructor(socketRoom) {
        this.socketRoom = socketRoom;
        const Grid = Honeycomb.defineGrid();
        const Hex = Honeycomb.extendHex();
        this.grid = Grid.spiral({
            radius: Game.GAMEBOARD_RADIUS - 1,
            center: Hex(2, 2),
        });

        // For some reason the bottom and top row start at 1
        // Change this to be 0-indexed
        const topRow = this.grid.filter((t) => t.y === 0);
        topRow.map((t) => t.x--);
        const bottomRow = this.grid.filter((t) => t.y === Game.GAMEBOARD_RADIUS + 1);
        bottomRow.map((t) => t.x--);

        this.generateTiles();
        this.generateSettlements();
        this.generateDevCards();

        this.chatRoom = new ChatRoom(socketRoom);
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
                tile.isRobber = true;
            } else {
                tile = new Tile(tileResources[i], tileNumbers[numberIndex]);
                numberIndex++;
            }

            tile.x = this.grid[i].x;
            tile.y = this.grid[i].y;
            // Get settlements for this
            let baseX = tile.x * 2;
            const halfRow = Math.ceil((Game.GAMEBOARD_RADIUS + 1) / 2);

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
        const rowWidth = Game.GAMEBOARD_RADIUS;
        const maxRowWidth = (Game.GAMEBOARD_RADIUS - 1) * 2 + 1;
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

    dealOutResources(diceRoll) {
        let selectedTiles = this.tiles.filter(obj => obj.number === diceRoll.toString());
        //iterate through all selected tiles
        selectedTiles.forEach((tile) => {
            if (tile.isRobber === false) {
                // Iterate through all settlement locations touching tile
                tile.settlements.forEach((settleCoord) => {
                    const settlement = this.settlements.get(JSON.stringify(settleCoord));
                    if (settlement.state !== 'empty') {
                        const player = this.players.find(p => p.name === settlement.player);
                        console.log('player');
                        console.log(player);

                        if (player) {
                            if (settlement.state === 'city') {
                                player[tile.resource] += 2;
                            } else {
                                player[tile.resource]++;
                            }
                        }
                    }
                });
            }
        });
    }

    robberEvent() {
        //check if each player has > 7, if they do remove half of their resources
        for (let i = 0; i < this.players.length; i++) {
            let player = this.players[i];
            let totalResources = player['wool'] + player['brick'] + player['ore']
                + player['grain'] + player['lumber'];
            if (totalResources >= 7) {
                let removalArray = ['brick', 'wool', 'ore', 'grain', 'lumber'];
                let numberToRemove = Math.floor(totalResources / 2);
                let removed = 0;
                while (removed < numberToRemove) {
                    let index = Math.floor(Math.random() * removalArray.length);
                    if (player[removalArray[index]] > 0) {
                        player[removalArray[index]]--;
                        removed++;
                    } else {
                        removalArray.splice(index, 1);
                    }
                }
            }
        }
    }

    checkLongestRoad() {
        /*Road = {to, from, player} */
        //construct roads
        let currentLeader = '';
        let maxSize = 0;
        let currentSize = 1;
        let currentSegment = 0;
        let end = 0;
        let road = [];
        let visited = [];
        for (let i = 0; i < this.roads.length; i++) {
            visited.push(false)
        }
        //for every road segment check for all possible connections
        while (currentSegment < this.roads.length) {
            let tempMax = 0;
            let index = 0;
            let safeGuard = 0;
            road.push(currentSegment)
            //check all connections
            while (road.length === 0) {
                if (this.roads[currentSegment].player === this.roads[index].player && !visited[index]) {
                    if (JSON.stringify(this.roads[end].to) === JSON.stringify(this.roads[index].from)) {
                        road.push(end);
                        end = index;
                        index = 0;
                        currentSize++;
                    }
                }

                index++;
                if (index === this.roads.length) {
                    if (currentSize > tempMax) {
                        tempMax = currentSize;
                    }
                    visited[end] = true;
                    currentSize--;
                    end = road.pop();
                }

                safeGuard++;
                if (safeGuard >= 200) {
                    break;
                }
            }

            if (tempMax >= 5 && tempMax > maxSize) {
                maxSize = tempMax;
                currentLeader = this.roads[currentSegment].player;
            }

            //reset visited array
            for (let i = 0; i < visited.length; i++) {
                visited[i] = false;
            }
        }

        if (maxSize >= 5 && maxSize >= this.longestRoadLength) {
            this.longestRoadLength = maxSize;
            this.longestRoadOwner = currentLeader;
        }
    }

    /**
     * Finds the player x with the most knights:
     *  - x gets stored in game.largestArmy
     *  - x gains 2 victory points
     *  - if x gets replaced, x loses 2 victory points and the replacer gains 2
     */
    testLargestArmy() {
        let largest; // the size of the largest army
        let player_i = null; // tracks current record holder
        let new_i = null; // index of player whose army size = largest (if this is not -1)

        if (this.largestArmy == null) {
            largest = 0;
        } else {
            largest = this.largestArmy.num;
            player_i = this.largestArmy.player;
        }

        for (let i = 0; i < players.length; i++) {
            const numKnights = players[i].numKnights;
            if (numKnights >= 3 && numKnights > largest) {
                largest = numKnights;
                new_i = i;
            }
        }

        if (new_i != null && player_i != new_i) {
            this.largestArmy = {
                num: largest,
                player: new_i
            };

            if (player_i != null) {
                player[player_i].victoryPoints -= 2;
            }

            player[new_i].victoryPoints += 2;
        }
    }

    generateUsers() {
        const users = [];
        for (const player of this.players) {
            users.push({
                username: player.name,
                colour: player.colour,
                victoryPoints: player.victoryPoints,
                numDevCards: player.devCards.length,
            })
        }
        return users;
    }


    /**
     * Probably this method should be called when a room is created
     * for each player in the room
     * @param socket the socket for a player
     */
    configureSocketInteractions(socket) {
        socket.join(this.socketRoom);
        socket.on('player_joined', (username) => {
            // See if we can find player
            let newPlayer = this.players.find(p => p.name === username);
            if (!newPlayer) {
                // If not, create a new player
                newPlayer = new Player(username, this.playerColours.pop());
                this.players.push(newPlayer);
            }
            socket.player = newPlayer;
            const currentTurnPlayer = this.players[this.turnNumber % this.players.length];
            newPlayer.isTurn = currentTurnPlayer.name === newPlayer.name;
            console.log(this.players);

            socket.emit('board_info', {
                tiles: this.tiles,
                settlements: JSON.stringify(Array.from(this.settlements.entries())),
                roads: this.roads,
                turnNumber: this.turnNumber,
                player: newPlayer
            });
            this.chatRoom.configureSocket(socket);
            socket.emit('user_joined', {username: newPlayer.name, colour: socket.colour})
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
            this.players[this.turnNumber % this.players.length].hasRolled = true;

            if (roll === 7) {
                this.robberEvent();
                // io.to emits to everyone in room, socket.to emits to everyone except sender
                io.to(this.socketRoom).emit('dice_result', {playerData: this.players, diceRoll: roll});
            } else {
                this.dealOutResources(roll);
                io.to(this.socketRoom).emit('dice_result', {playerData: this.players, diceRoll: roll});
            }
        });

        socket.on('robber_moved', (robberIndex) => {
            let formerRobber = this.tiles.findIndex((t) => t.isRobber === true);
            console.log(`robber has moved to ${robberIndex}`);
            this.tiles[formerRobber].isRobber = false;
            this.tiles[robberIndex].isRobber = true;
            io.to(this.socketRoom).emit('update_robber_location', robberIndex);
        });

        //Trade
        socket.on('trade_offer', (users) => {
            const dealer = users[0];
            const customer = users[1];
            console.log(customer);
            io.emit('trade_request', dealer, customer);
            // this needs to be changed to the room thing!! **********************
        });

        socket.on('trade_accept', (users) => {
            const dealer = users[0];
            const customer = users[1];
            io.emit('alert message', dealer + " and " + customer + " are trading...");
            io.emit('trade_accept', dealer, customer);
        });

        socket.on('trade_refuse', (dealer) => {
            socket.to(this.socketRoom).emit('trade_refuse', dealer);
        });

        socket.on('trade_outcome', (dealer, customer) => {

        });

        socket.on('trade_cancel', (player) => {
            io.emit('trade_cancel', player);
        });

        //Build Settlement
        socket.on('build_settlement', (newSettlement) => {
            console.log('settlement received');
            const player = this.players[this.turnNumber % this.players.length];
            // This should be checked on client side but double check just in case
            if (player.isTurn
                && (player.brick >= 1 && player.lumber >= 1 && player.wool >= 1 && player.grain >= 1)
                || this.turnNumber < (this.players.length * 2)) {
                console.log(newSettlement);
                // Update the server's settlement object
                const settlement = this.settlements.get(JSON.stringify({
                    x: newSettlement.x,
                    y: newSettlement.y
                }));
                settlement.player = newSettlement.player;
                settlement.state = newSettlement.state;

                settlement.colour = player.colour;
                player.numSettlements--;
                player.victoryPoints++;
                // Remove resources if it isn't the first two turns
                if (this.turnNumber >= (this.players.length * 2)) {
                    player.brick--;
                    player.lumber--;
                    player.wool--;
                    player.grain--;
                }

                // Get tiles adjacent to this settlement
                const adjacentTiles = this.tiles.filter((t) =>
                    t.settlements.some((s) => s.x === settlement.x && s.y === settlement.y));

                // Give the player one resource for each adjacent tile
                adjacentTiles.forEach((tile) => {
                    player[tile.resource]++;
                });

                const jsonSettlements = JSON.stringify(Array.from(this.settlements.entries()));

                // Send the updated settlement to all players
                // Send the updated settlements and player info to player who built
                socket.to(this.socketRoom).emit('update_settlements', {
                    settlements: jsonSettlements
                });
                socket.emit('update_settlements', {
                    settlements: jsonSettlements,
                    player: player
                });
                io.to(this.socketRoom).emit('update_players', this.generateUsers());
            }
        });

        socket.on('upgrade_settlement', (settlementCoord) => {
            console.log('upgrading settlement');
            const player = this.players[this.turnNumber % this.players.length];
            if (player.isTurn && player.ore >= 3 && player.grain >= 2) {
                // Give back settlement and remove city
                player.numSettlements++;
                player.numCities--;
                player.victoryPoints++;
                player.ore -= 3;
                player.grain -= 2;

                const settlement = this.settlements.get(JSON.stringify(settlementCoord));
                settlement.state = 'city';

                socket.to(this.socketRoom).emit('update_city', {
                    city: settlementCoord
                });
                socket.emit('update_city', {
                    city: settlementCoord,
                    player: player
                });
                io.to(this.socketRoom).emit('update_players', this.generateUsers());
            }
        });

        //Build Road
        socket.on('build_road', (newRoad) => {
            console.log('road received');
            const player = this.players[this.turnNumber % this.players.length];
            if (player.isTurn
                && (player.brick >= 1 && player.lumber >= 1)
                || this.turnNumber < (this.players.length * 2)) {
                player.numRoads--;
                newRoad.colour = player.colour;

                if (this.turnNumber >= (this.players.length * 2)) {
                    player.brick--;
                    player.lumber--;
                } else {
                    console.log('updating end turn');
                    player.hasRolled = true;
                }

                this.roads.push(newRoad);
                //this.checkLongestRoad();
                socket.to(this.socketRoom).emit('update_roads', {
                    roads: this.roads
                });
                socket.emit('update_roads', {
                    roads: this.roads,
                    player: player
                });
            }
        });

        //Build Development Card
        socket.on('build_dev_card', () => {
            //Need to check resources of player first

            if (this.availableDevCards.length === 0) return;

            const playerIdx = this.turnNumber % this.players.length;

            const index = Math.floor(Math.random() * this.availableDevCards.length);
            const card = this.availableDevCards.splice(index, 1);
            this.players[playerIdx].devCards.push(card);

            //io.to(socket).emit('dev_card_selected', card); //Dont know where we would want to handle this

            //Add dev card to players dev card array
            socket.emit('dev_card_update', card); //Send dev card to player that drew the card
            io.to(this.socketRoom).emit('dev_card_count', this.availableDevCards.length); //Send info to all players to update overall dev card count
        });

        //Play Development Card
        socket.on('dev_card_played', (cardPlayed) => {

        });

        //Fill out devCardCounts in DevCardModel.vue when the vue is created
        socket.on('dev_card_info', (playerName) => {
            const player = this.players.find(p => p.name === playerName);
            let devCards = player.devCards;
            socket.emit('fill_dev_cards', devCards);
            socket.emit('dev_card_count', this.availableDevCards.length);
        });

        //End Turn
        socket.on('end_turn', () => {
            const playerEndingTurn = this.players[this.turnNumber % this.players.length];
            playerEndingTurn.isTurn = false;
            playerEndingTurn.hasRolled = false;
            this.turnNumber++;
            const playerStartingTurn = this.players[this.turnNumber % this.players.length];
            playerStartingTurn.isTurn = true;

            io.to(this.socketRoom).emit('start_turn', this.players);
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
