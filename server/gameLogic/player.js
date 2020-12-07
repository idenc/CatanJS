"use strict"

class Player{
    name;
    victoryPoints;
    clay;
    ore;
    wool;
    grain;
    lumber;
    isTurn;
    devCards = [];
    numKnights;
    harbourBonuses = [];
    colour;
    constructor(name, colour) {
        this.name = name;
        this.colour = colour;
        isTurn = false;
    }
}

module.exports = Player;
