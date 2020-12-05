"use strict";

class Settlement {
    x;
    y;
    player = "";
    type = "empty";
    harbour;
    neighbours = [];

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

module.exports = Settlement;
