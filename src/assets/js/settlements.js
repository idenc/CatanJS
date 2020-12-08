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
    return true;
    // Check distance rule
}

/**
 * Checks whether the player has the ability to build
 * a settlement
 * @param gameBoard the GameBoard component
 * @returns {boolean} True if the player can build else false
 */
const canPlay = (gameBoard) => {
    const player = gameBoard.player;
    // All players get 2 settlements and 2 roads to begin
    if (player.numSettlements === 5 && gameBoard.turnNumber === 0 || player.numSettlements === 4 && gameBoard.turnNumber === 1) {
        return true;
    }
    return player.clay >= 1 && player.lumber >= 1 && player.wool >= 1 && player.grain >= 1;
}

/**
 * Starts selection of where to build settlement
 * @param gameBoard GameBoard component
 */
const startBuildSettlements = (gameBoard) => {
    if (!canPlay(gameBoard)) {
        return;
    }
    for (const [, settlement] of gameBoard.settlements.entries()) {
        if (settlementAvailable(gameBoard, settlement)) {
            let settlementSVG = addSettlementSelector(gameBoard, settlement);
            Object.assign(settlement, {svg: settlementSVG});
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
    for (const [, settlement] of settlements.entries()) {
        if (settlement.state !== 'empty' && !settlement.svg) {
            const settlementSVG = renderBuildable(drawSVG,
                settlement.point,
                settlementRadius,
                settlement.colour,
                false).children()[0].node;
            settlementSVG.setAttribute('state', settlement.state);
            settlementSVG.classList.add('settlement-svg');
        }
    }
}

const renderBuildable = (drawSVG, point, settlementRadius, fillColour, isSelectable = true) => {
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

    nested
        .circle(settlementRadius * 2)
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

const addSettlementSelector = (gameBoard, settlement) => {
    const nested = renderBuildable(gameBoard.draw,
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
    renderSettlements
}
