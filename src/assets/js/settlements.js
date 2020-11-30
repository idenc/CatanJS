const locateSettlements = (grid, rowWidth, maxRowWidth) => {
    const settlements = [];
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

// Draw the settlements
const renderSettlements = (settlement, draw, settlementRadius) => {
    const {x, y} = settlement.point;
    const settlementCircle = draw
        .circle(settlementRadius * 2)
        .stroke({width: 4, color: '#aaa'})
        .translate(x - settlementRadius, y - settlementRadius)

    const settlementSVG = settlementCircle.node;
    settlementSVG.classList.add('settlement-svg')
    settlementSVG.setAttribute('state', 'empty')


    settlementSVG.addEventListener('click', () => {
        settlementSVG.setAttribute('state', 'settlement')
    })
};

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
                if (settlement.y > 0
                    && (settlement.y < halfRow && settlement.x % 2 !== 0 || settlement.y >= halfRow && settlement.x % 2 === 0)) {
                    // above neighbour
                    neighbours.push({
                        x: i < halfRow ? settlement.x - 1 : i > halfRow ? settlement.x + 1 : settlement.x,
                        y: settlement.y - 1
                    })
                }
            }
            // right neighbour
            if (settlement.x < rowSettlements.length - 1) {
                neighbours.push({x: settlement.x + 1, y: settlement.y});
            }
            if (settlement.y < maxRowWidth
                && (settlement.y < halfRow && settlement.x % 2 === 0 || settlement.y >= halfRow && settlement.x % 2 !== 0)) {
                // below neighbour
                neighbours.push({x: i < halfRow - 1 ? settlement.x + 1 : i >= halfRow ? settlement.x - 1 : settlement.x, y: settlement.y + 1})
            }

            settlement.neighbours = neighbours;
        });
    }
}

const drawRoadDebug = (settlementsMap, draw) => {
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

            const length = Math.hypot(
                neighbourPoint.x - settlementPoint.x,
                neighbourPoint.y - settlementPoint.y
            );

            // Draw the road
            const transform = {
                rotate: angleDeg,
                translateX: settlementPoint.x,
                translateY: settlementPoint.y - 10,
                origin: 'top left'
            };
            draw
                .rect(length, 10)
                .fill({color: 'blue'})
                .transform(transform);
            draw
                .text(`${settlement.x}, ${settlement.y}`)
                .fill('black')
                .transform({translateX: settlementPoint.x, translateY: settlementPoint.y})
        });
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
    renderSettlements,
    assignNeighbours,
    drawRoadDebug,
    getSettlementsMap
}
