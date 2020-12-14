import {maxBuildings} from "../js/constants";
import {arePointsEqual} from "@/assets/js/roads";

const arrowImg = require('../img/arrow.svg');

/**
 * This is just for finding the correct x, y positions to draw settlements
 * @param grid
 * @param settlements
 * @returns {[]}
 */
const locateSettlements = (grid, settlements) => {
    const rowWidth = grid.radius + 1;
    const maxRowWidth = grid.radius * 2 + 1;
    let rowNumTop = 0;
    let rowNumBottom = maxRowWidth;
    for (let i = rowWidth; i <= maxRowWidth; i++) {
        // Locate settlements on the top half of the grid
        const topHexes = grid.filter(hex => hex.y === rowNumTop + 1).sort((a, b) => a.x - b.x);
        // Loops through each hex in the current row
        topHexes.forEach((hex, j) => {
            let corners = hex.corners();
            const {x, y} = hex.toPoint()
            if (j === 0) {
                settlements.get(JSON.stringify({x: 0, y: rowNumTop})).point = {
                    x: corners[4].x + x,
                    y: corners[4].y + y
                }
            }
            settlements.get(JSON.stringify({x: (j * 2) + 1, y: rowNumTop})).point = {
                x: corners[5].x + x,
                y: corners[5].y + y
            }
            settlements.get(JSON.stringify({x: (j * 2) + 2, y: rowNumTop})).point = {
                x: corners[0].x + x,
                y: corners[0].y + y
            }
        })
        // Locate settlements on the bottom half of the grid
        const bottomHexes = grid.filter(hex => hex.y === rowNumBottom).sort((a, b) => a.x - b.x);
        // Loops through each hex in the current row
        bottomHexes.forEach((hex, j) => {
            let corners = hex.corners();
            const {x, y} = hex.toPoint()
            if (j === 0) {
                settlements.get(JSON.stringify({x: 0, y: rowNumBottom})).point = {
                    x: corners[3].x + x,
                    y: corners[3].y + y
                }
            }
            settlements.get(JSON.stringify({x: (j * 2) + 2, y: rowNumBottom})).point = {
                x: corners[1].x + x,
                y: corners[1].y + y
            }
            settlements.get(JSON.stringify({x: (j * 2) + 1, y: rowNumBottom})).point = {
                x: corners[2].x + x,
                y: corners[2].y + y
            }
        })
        rowNumTop++;
        rowNumBottom--;
    }
    return settlements;
}

/**
 * Checks whether a settlement can be built on a space
 * @param gameBoard the GameBoard component
 * @param settlement The settlement location to build at
 * @returns {boolean} True if settlement can be built on else false
 */
const settlementAvailable = (gameBoard, settlement) => {
    if (settlement.state !== 'empty') {
        return false;
    }
    // Check distance rule
    for (const neighbourCoord of settlement.neighbours) {
        const neighbour = gameBoard.settlements.get(JSON.stringify(neighbourCoord));
        if (neighbour.state !== 'empty') {
            return false;
        }
    }

    if (gameBoard.turnNumber > 1) {
        const settlementCoord = {x: settlement.x, y: settlement.y}
        const adjacentRoads = gameBoard.roads.filter(road => road.player === gameBoard.player.name && (arePointsEqual(road.to, settlementCoord)
            || arePointsEqual(road.from, settlementCoord)));
        if (adjacentRoads.length === 0) {
            return false;
        }
    }

    return true;
}

/**
 * Starts selection of where to build settlement
 * @param gameBoard GameBoard component
 */
const startBuildSettlements = (gameBoard) => {
    // Need to check if player is eligible to build any settlements/cities
    const player = gameBoard.player;
    const canBuildSettlement = player.numSettlements > 0 && player.brick >= 1 && player.lumber >= 1 && player.wool >= 1 && player.grain >= 1;
    const canUpgrade = player.numCities > 0 && player.ore >= 3 && player.grain >= 2;
    const firstTwoTurn = player.numSettlements === maxBuildings.settlements && gameBoard.turnNumber === 0
        || player.numSettlements === maxBuildings.settlements - 1 && gameBoard.turnNumber === 1;

    // All players get 2 settlements and 2 roads to begin
    if (!firstTwoTurn) {
        if (!canBuildSettlement && !canUpgrade) {
            return;
        }
    }

    for (const [, settlement] of gameBoard.settlements.entries()) {
        if ((firstTwoTurn || canBuildSettlement) && settlementAvailable(gameBoard, settlement)) {
            settlement.svg = addSettlementSelector(gameBoard, settlement);
        } else if (canUpgrade && settlement.state === 'settlement') {
            addUpgradeSelector(gameBoard, settlement);
        }
    }
}

const addSelectSettlementAnimation = (drawSVG, x, y, settlementRadius) => {
    const animatedCircle = drawSVG
        .circle(settlementRadius * 2)
        .fill('none')
        .stroke({width: 2, color: 'white'})
        .translate(x - settlementRadius, y - settlementRadius);
    animatedCircle.node.classList.add("settlement-animation");
    const ringAnimation = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
    ringAnimation.setAttribute("attributeName", "r");
    ringAnimation.setAttribute("from", `${settlementRadius}`);
    ringAnimation.setAttribute("to", `${settlementRadius * 2}`);
    ringAnimation.setAttribute("dur", "1.5s");
    ringAnimation.setAttribute("begin", "0s");
    ringAnimation.setAttribute("repeatCount", "indefinite");
    animatedCircle.node.appendChild(ringAnimation);

    const fadeAnimation = document.createElementNS("http://www.w3.org/2000/svg", "animate");
    fadeAnimation.setAttribute("attributeName", "opacity");
    fadeAnimation.setAttribute("from", "1");
    fadeAnimation.setAttribute("to", "0");
    fadeAnimation.setAttribute("dur", "1.5s");
    fadeAnimation.setAttribute("begin", "0s");
    fadeAnimation.setAttribute("repeatCount", "indefinite");
    animatedCircle.node.appendChild(fadeAnimation);
}

const renderSettlements = (settlements, drawSVG, settlementRadius) => {
    drawSVG.find('.buildable').remove();
    for (const [, settlement] of settlements.entries()) {
        if (settlement.state !== 'empty' && !settlement.svg) {
            const nested = renderBuildable(drawSVG,
                settlement.state === 'city',
                settlement.point,
                settlementRadius,
                settlement.colour,
                false);
            const settlementSVG = nested.children()[0].node;
            settlementSVG.setAttribute('state', settlement.state);
            settlementSVG.classList.add('settlement-svg');
            settlement.svg = nested;
        }
    }
}

const renderBuildable = (drawSVG, isCity, point, settlementRadius, fillColour, isSelectable = true) => {
    const {x, y} = point;
    // Create an element to nest settlement graphics in for easier transforming
    const nested = drawSVG.group();
    nested.node.classList.add('buildable');
    if (isSelectable) {
        // Adds a pulsing circle animation
        addSelectSettlementAnimation(nested, x, y, settlementRadius);
    }
    // Handle null fillColour
    fillColour = fillColour ? fillColour : 'transparent';
    const size = settlementRadius * 2;

    nested
        .rect(size, size)
        .rotate(45)
        .radius(isCity ? 0 : settlementRadius)
        .fill(fillColour)
        .stroke({width: 4, color: 'white'})
        .translate(x - settlementRadius, y - settlementRadius);

    return nested;
}

const removeBuildSelectors = (drawSVG) => {
    drawSVG.find('.build-selector')
        .forEach((s) => s.parent().remove());
    drawSVG.find('.settlement-animation')
        .forEach((s) => s.remove());
}

const upgradeSettlement = (settlement) => {
    const settlementSVG = settlement.svg.children()[0];
    settlementSVG.animate(100).attr({rx: 0, ry: 0});
}

const addUpgradeSelector = (gameBoard, settlement) => {
    const size = gameBoard.graphics.settlementRadius * 2 - 10;
    settlement.svg
        .image(arrowImg)
        .size(size, size)
        .transform({
            position: [settlement.point.x, settlement.point.y],
            origin: 'center'
        })
        .addClass('settlement-upgrade');

    const settlementGroup = settlement.svg.node;
    settlementGroup.addEventListener('click', () => {
        gameBoard.draw.find('.settlement-upgrade').remove();

        upgradeSettlement(settlement);

        removeBuildSelectors(gameBoard.draw);
        gameBoard.$socket.emit('upgrade_settlement', {
            x: settlement.x,
            y: settlement.y
        });
    });
}

const addSettlementSelector = (gameBoard, settlement) => {
    const nested = renderBuildable(gameBoard.draw,
        settlement.state === 'city',
        settlement.point,
        gameBoard.graphics.settlementRadius,
        'transparent');

    const settlementSVG = nested.children()[1].node;
    settlementSVG.classList.add('build-selector');
    settlementSVG.setAttribute('state', settlement.state);

    settlementSVG.addEventListener('click', () => {
        settlementSVG.classList.remove('build-selector');
        settlementSVG.classList.add('settlement-svg');
        settlementSVG.setAttribute('state', 'settlement');
        settlementSVG.setAttribute("fill", gameBoard.player.colour);
        // Remove all the settlement selection graphics, keep selected settlement
        removeBuildSelectors(gameBoard.draw);
        settlement.state = "settlement";
        settlement.player = gameBoard.player.name;

        // TODO: handle upgrading to city
        console.log('emitting build')
        // Cannot JSON stringify DOM elements
        gameBoard.$socket.emit('build_settlement', {
            x: settlement.x,
            y: settlement.y,
            player: settlement.player,
            state: settlement.state
        });
    });

    return nested;
}

const redrawSettlements = (settlements, drawSVG) => {
    for (const [, settlement] of settlements.entries()) {
        redrawSettlement(drawSVG, settlement);
    }
}

const redrawSettlement = (drawSVG, settlement) => {
    if (settlement.svg) {
        const {x, y} = settlement.point;
        settlement.svg.transform(0);
        settlement.svg.transform({
            position: [x, y],
            origin: 'center'
        });
    }
}

const updateSettlementLocations = (grid, settlements) => {
    return locateSettlements(grid, settlements);
}

export {
    locateSettlements,
    startBuildSettlements,
    addSettlementSelector,
    updateSettlementLocations,
    redrawSettlements,
    redrawSettlement,
    renderBuildable,
    removeBuildSelectors,
    renderSettlements,
    upgradeSettlement
}
