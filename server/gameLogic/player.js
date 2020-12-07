"use strict"

class Player{
    name;
    victoryPoints = 0;
    clay = 0;
    ore = 0;
    wool = 0;
    grain = 0;
    lumber = 0;
    isTurn = false;
    devCards = [];
    numKnights = 0;
    harbourBonuses = [];
    colour;
    constructor(name, colour) {
        this.name = name;
        this.colour = colour;
    }
}

module.exports = Player;
