"use strict"

class Player {
    name;
    victoryPoints = 0;
    brick = 0;
    ore = 0;
    wool = 0;
    grain = 0;
    lumber = 0;
    isTurn = false;
    hasRolled = false;
    devCards = [];
    numKnights = 0;
    harbourBonuses = [];
    colour;
    numSettlements = 5;
    numRoads = 15;
    numCities = 4;


    constructor(name, colour) {
        this.name = name;
        this.colour = colour;
    }
}

module.exports = Player;
