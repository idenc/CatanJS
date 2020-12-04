'use strict';

class Tile {
    x;
    y;
    resource;
    number;
    isRobber;
    isHarbour;

    constructor(resource, number) {
        this.resource = resource;
        this.number = number;
    }
}

module.exports = Tile;
