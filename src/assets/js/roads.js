import {renderBuildable, removeBuildSelectors} from "@/assets/js/settlements";

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
                .fill('white')
                .transform({translateX: settlementPoint.x, translateY: settlementPoint.y})
        });
        // Ensure roads are only drawn once
        visitedCoords.push({x: settlement.x, y: settlement.y});
    }
}

const calculateRoadAngle = (toPoint, fromPoint) => {
    return Math.atan2(
        fromPoint.y - toPoint.y,
        fromPoint.x - toPoint.x
    ) * 180 / Math.PI;
}

const buildRoad = (drawSVG, settlement, roads, settlementRadius, neighbour, roadGap) => {
    const settlementPoint = settlement.point;
    const neighbourPoint = neighbour.point;

    // Calculate angle between each neighbouring settlement
    const angleDeg = calculateRoadAngle(settlementPoint, neighbourPoint);
    // Calculate distance between the settlements and add a small gap
    const length = Math.hypot(
        neighbourPoint.x - settlementPoint.x,
        neighbourPoint.y - settlementPoint.y
    ) - (settlementRadius * 2 + 5);

    // Draw the road
    const road = drawSVG
        .rect(length, roadGap)
        .fill({color: 'blue'})
        .cx((settlementPoint.x + neighbourPoint.x) / 2)
        .cy((settlementPoint.y + neighbourPoint.y) / 2)
        .rotate(angleDeg);
    road.front();
    road.click(function () {
        console.log(`Clicked road (${settlement.x}, ${settlement.y})`);
    });

    // Keep track of road
    // Roads are bidirectional so from/to doesn't really matter
    roads.push({
        from: {x: settlement.x, y: settlement.y},
        to: {x: neighbour.x, y: neighbour.y},
        player: 'placeholder',
        svg: road
    });
}

const redrawRoads = (roads, settlements) => {
    roads.forEach((road) => {
        if (road.svg) {
            const to = settlements.get(JSON.stringify(road.to));
            const from = settlements.get(JSON.stringify(road.from));

            const angleDeg = calculateRoadAngle(to.point, from.point);

            road.svg.transform(0);
            road.svg
                .cx((to.point.x + from.point.x) / 2)
                .cy((to.point.y + from.point.y) / 2)
                .rotate(angleDeg);
        }
    });
}

const canBuildRoad = () => {
    // Need to check all conditions to build a road
    // This should be done on the backend
    // 1. The player has necessary resources
    // 2. The road space is empty
    // 3. The road is connected to another road or a settlement
    return true;
}


// This begins either after a user builds a settlement in their first two turns
// or when they choose to build a road
const startRoadSelection = (gameBoard) => {
    // Iterate through each settlement (i.e. grid intersection point)
    for (const [, settlement] of gameBoard.settlements.entries()) {
        const neighbours = settlement.neighbours;
        neighbours.forEach((neighbourCoord) => {
            const neighbour = gameBoard.settlements.get(JSON.stringify(neighbourCoord));
            if (canBuildRoad()) {
                const point = {
                    x: (settlement.point.x + neighbour.point.x) / 2,
                    y: (settlement.point.y + neighbour.point.y) / 2,
                }
                const nested = renderBuildable(gameBoard.draw,
                    point,
                    gameBoard.graphics.settlementRadius);

                const selectorSVG = nested.children()[1].node;
                selectorSVG.classList.add('build-selector');

                selectorSVG.addEventListener('click', () => {
                    console.log('road clicked');
                    removeBuildSelectors(gameBoard.draw);
                    buildRoad(gameBoard.draw,
                        settlement,
                        gameBoard.roads,
                        gameBoard.graphics.settlementRadius,
                        neighbour,
                        gameBoard.graphics.roadGap);
                    // TODO: add correct player
                    gameBoard.$socket.emit('build_road', {
                        to: {x: settlement.x, y: settlement.y},
                        from: {x: neighbour.x, y: neighbour.y},
                        player: 'placeholder'
                    });
                });
            }
        });
    }
}

const renderRoads = (gameBoard) => {
    for (const road of gameBoard.roads) {
        if (!road.svg) {
            const to = gameBoard.settlements.get(JSON.stringify({x: road.to.x, y: road.to.y}));
            const from = gameBoard.settlements.get(JSON.stringify({x: road.from.x, y: road.from.y}));

            buildRoad(gameBoard.draw,
                to,
                gameBoard.roads,
                gameBoard.graphics.settlementRadius,
                from,
                gameBoard.graphics.roadGap);
        }
    }
}

export {
    drawRoadDebug,
    startRoadSelection,
    redrawRoads,
    renderRoads
}
