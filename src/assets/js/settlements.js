const locateSettlements = (grid) => {
    const settlements = [];
    const rowWidth = grid.radius + 1;
    const maxRowWidth = grid.radius * 2 + 1;
    let rowNumTop = 0;
    let rowNumBottom = maxRowWidth;
    for (let i = rowWidth; i <= maxRowWidth; i++) {
        // Create settlements on the top half of the grid
        const topHexes = grid.filter(hex => hex.y === rowNumTop + 1).sort((a, b) => a.x - b.x);
        // Loops through each hex in the current row
        topHexes.forEach((hex, j) => {
            let corners = hex.corners();
            const {x, y} = hex.toPoint()
            if (j === 0) {
                settlements.push({
                    x: 0,
                    y: rowNumTop,
                    point: {
                        x: corners[4].x + x,
                        y: corners[4].y + y
                    }
                });
            }
            settlements.push({
                x: (j * 2) + 1,
                y: rowNumTop,
                point: {
                    x: corners[5].x + x,
                    y: corners[5].y + y
                }
            });
            settlements.push({
                x: (j * 2) + 2,
                y: rowNumTop,
                point: {
                    x: corners[0].x + x,
                    y: corners[0].y + y
                }
            });
        })
        // Create settlements on the bottom half of the grid
        const bottomHexes = grid.filter(hex => hex.y === rowNumBottom).sort((a, b) => a.x - b.x);
        // Loops through each hex in the current row
        bottomHexes.forEach((hex, j) => {
            let corners = hex.corners();
            const {x, y} = hex.toPoint()
            if (j === 0) {
                settlements.push({
                    x: 0,
                    y: rowNumBottom,
                    point: {
                        x: corners[3].x + x,
                        y: corners[3].y + y
                    }
                });
            }
            settlements.push({
                x: (j * 2) + 2,
                y: rowNumBottom,
                point: {
                    x: corners[1].x + x,
                    y: corners[1].y + y
                }
            });
            settlements.push({
                x: (j * 2) + 1,
                y: rowNumBottom,
                point: {
                    x: corners[2].x + x,
                    y: corners[2].y + y
                }
            });
        })
        rowNumTop++;
        rowNumBottom--;
    }
    console.log(settlements);
    return settlements;
}

// Will need to determine when a space is available to build a settlement
const settlementAvailable = (settlement) => {
    return true;
}

// Draw the settlements
const renderSettlements = (settlements, drawSVG, settlementRadius) => {
    settlements.forEach(settlement => {
        if (settlementAvailable(settlement)) {
            let settlementSVG = renderSettlement(drawSVG, settlement, settlementRadius);
            Object.assign(settlement, {svg: settlementSVG});
        }
    })
}

const addSelectSettlementAnimation = (drawSVG, x, y, settlementRadius) => {
    const animatedCircle = drawSVG
        .circle(settlementRadius * 2)
        .fill('none')
        .stroke({width: 2, color: '#aaa'})
        .translate(x - settlementRadius, y - settlementRadius);
    animatedCircle.node.classList.add("settlement-animation");
    const ringAnimation = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
    ringAnimation.setAttribute("attributeName", "r");
    ringAnimation.setAttribute("from", `${settlementRadius - 2}`);
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

const renderSettlement = (drawSVG, settlement, settlementRadius) => {
    const {x, y} = settlement.point;
    // Adds a pulsing circle animation
    addSelectSettlementAnimation(drawSVG, x, y, settlementRadius);

    const settlementCircle = drawSVG
        .circle(settlementRadius * 2)
        .stroke({width: 4, color: '#aaa'})
        .translate(x - settlementRadius, y - settlementRadius);

    const settlementSVG = settlementCircle.node;
    settlementSVG.classList.add('settlement-svg');
    settlementSVG.setAttribute('state', 'empty');

    settlementSVG.addEventListener('click', () => {
        settlementSVG.setAttribute('state', 'settlement');
        // Remove all the settlement selection graphics, keep selected settlement
        drawSVG.find('.settlement-svg')
            .forEach((s) => s.node.getAttribute("state") === "settlement" ? null : s.remove());
        drawSVG.find('.settlement-animation')
            .forEach((s) => s.node.getAttribute("state") === "settlement" ? null : s.remove());
        // TODO: call to backend to update settlements
    })

    return settlementCircle;
}

const redrawSettlements = (settlements, drawSVG, settlementRadius) => {
    settlements.forEach(settlement => {
        redrawSettlement(drawSVG, settlement, settlementRadius);
    })
}

const redrawSettlement = (drawSVG, settlement, settlementRadius) => {
    const {x, y} = settlement.point;
    settlement.svg.transform(0);
    settlement.svg.translate(x - settlementRadius, y - settlementRadius);
}

const assignNeighbours = (settlementArray, maxRowWidth) => {
    const numRows = maxRowWidth + 1;
    const halfRow = Math.ceil(numRows / 2);
    for (let i = 0; i < maxRowWidth + 1; i++) {

        // Get all settlements in a row
        const rowSettlements = settlementArray.filter(s => s.y === i);

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

const updateSettlementLocations = (grid, settlements) => {
    const newSettlements = locateSettlements(grid);
    settlements.forEach((settlement, i) => {
        settlement.x = newSettlements[i].x;
        settlement.y = newSettlements[i].y;
        settlement.point = newSettlements[i].point;
    })
    return settlements;
}

const drawRoadDebug = (settlementsMap, draw, settlementRadius, roadGap) => {
    const visitedCoords = [];
    // For each settlement
    for (const settlement of settlementsMap.values()) {
        const settlementPoint = settlement.point;
        // Iterate through all neighbouring settlements
        settlement.neighbours.forEach((neighbourCoord) => {
            if (visitedCoords.some((c) => c.x === neighbourCoord.x && c.y === neighbourCoord.y)) {
                return;
            }
            // Retrieve the neighbour's settlement object
            const neighbour = settlementsMap.get(JSON.stringify({x: neighbourCoord.x, y: neighbourCoord.y}));
            if (!neighbour) {
                console.error(`Invalid neighbour (${neighbourCoord.x}, ${neighbourCoord.y}) 
                at settlement (${settlement.x}, ${settlement.y})`);
            }
            const neighbourPoint = neighbour.point;

            // Calculate angle between each neighbouring settlement
            const angleDeg = Math.atan2(
                neighbourPoint.y - settlementPoint.y,
                neighbourPoint.x - settlementPoint.x
            ) * 180 / Math.PI;

            // Calculate distance between the settlements and add a small gap
            const length = Math.hypot(
                neighbourPoint.x - settlementPoint.x,
                neighbourPoint.y - settlementPoint.y
            ) - (settlementRadius * 2 + 5);

            // Draw the road
            const road = draw
                .rect(length, roadGap)
                .fill({color: 'blue'})
                .cx((settlementPoint.x + neighbourPoint.x) / 2)
                .cy((settlementPoint.y + neighbourPoint.y) / 2)
                .rotate(angleDeg);
            road.front();
            road.click(function () {
                console.log(`Clicked road (${settlement.x}, ${settlement.y})`);
            });

            // Draw coordinate for debugging
            draw
                .text(`${settlement.x}, ${settlement.y}`)
                .fill('red')
                .transform({translateX: settlementPoint.x, translateY: settlementPoint.y})
        });
        // Ensure roads are only drawn once
        visitedCoords.push({x: settlement.x, y: settlement.y});
    }
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

module.exports = {
    locateSettlements,
    assignNeighbours,
    drawRoadDebug,
    getSettlementsMap,
    renderSettlements,
    renderSettlement,
    updateSettlementLocations,
    redrawSettlements,
    redrawSettlement
}
