"use strict";

class Settlement {
    x;
    y;
    player = "";
    state = "empty";
    harbour;
    neighbours = [];

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

module.exports = Settlement;
