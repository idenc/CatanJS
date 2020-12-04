import {startRoadSelection} from "@/assets/js/roads";

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
    console.log(settlements);
    return settlements;
}

// TODO: Will need to determine when a space is available to build a settlement
const settlementAvailable = (settlement) => {
    return true;
}

// Draw the settlements
const renderSettlements = (settlements, drawSVG, settlementRadius, roadGap) => {
    for (const [, settlement] of settlements.entries()) {
        if (settlementAvailable(settlement)) {
            let settlementSVG = renderSettlement(drawSVG,
                settlement,
                settlements,
                settlementRadius,
                roadGap);
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

const renderBuildable = (drawSVG, point, settlementRadius) => {
    const {x, y} = point;
    // Create an element to nest settlement graphics in for easier transforming
    const nested = drawSVG.group();
    nested.node.classList.add('buildable');
    // Adds a pulsing circle animation
    addSelectSettlementAnimation(nested, x, y, settlementRadius);

    nested
        .circle(settlementRadius * 2)
        .fill('none')
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

const renderSettlement = (drawSVG, settlement, settlements, settlementRadius, roadGap) => {
    const nested = renderBuildable(drawSVG, settlement.point, settlementRadius);

    const settlementSVG = nested.children()[1].node;
    settlementSVG.classList.add('build-selector');
    settlementSVG.setAttribute('state', settlement.state);

    settlementSVG.addEventListener('click', () => {
        settlementSVG.classList.remove('build-selector');
        settlementSVG.classList.add('settlement-svg');
        settlementSVG.setAttribute('state', 'settlement');
        // Remove all the settlement selection graphics, keep selected settlement
        removeBuildSelectors(drawSVG);
        // TODO: call to backend to update settlements
        settlement.state = "settlement";
        startRoadSelection(drawSVG, settlements, settlementRadius, roadGap);
    })

    return nested;
}

const redrawSettlements = (settlements, drawSVG) => {
    settlements.forEach(settlement => {
        redrawSettlement(drawSVG, settlement);
    })
}

const redrawSettlement = (drawSVG, settlement) => {
    const {x, y} = settlement.point;
    settlement.svg.transform(0);
    settlement.svg.transform({
        position: [x, y],
        origin: 'center'
    });
}

const updateSettlementLocations = (grid, settlements) => {
    const newSettlements = locateSettlements(grid);
    settlements.forEach((settlement, i) => {
        settlement.x = newSettlements[i].x;
        settlement.y = newSettlements[i].y;
        settlement.point = newSettlements[i].point;
    })
    return settlements;
}


const getSettlementsMap = (settlementsArray) => {
    const settlementsMap = new Map();
    for (const settlement of settlementsArray) {
        settlementsMap.set(
            JSON.stringify({x: settlement.x, y: settlement.y}),
            settlement
        );
    }
    return settlementsMap;
}

export {
    locateSettlements,
    getSettlementsMap,
    renderSettlements,
    renderSettlement,
    updateSettlementLocations,
    redrawSettlements,
    redrawSettlement,
    renderBuildable,
    removeBuildSelectors
}
