<template>
  <div
    id="board"
    ref="boardSvgContainer"
  >
    <svg id="defs-svg">
      <defs ref="defRef">
        <pattern
          id="pattern1"
          patternContentUnits="objectBoundingBox"
          height="100%"
          width="100%"
        >
          <image
            xlink:href="../assets/img/tiles/test.jpg"
            height="1"
            width="1"
            preserveAspectRatio="none"
          />
        </pattern>
        <pattern
          id="brick-pattern"
          patternContentUnits="objectBoundingBox"
          height="100%"
          width="100%"
        >
          <image
            xlink:href="../assets/img/tiles/brick.png"
            height="1"
            width="1"
            preserveAspectRatio="none"
          />
        </pattern>
        <pattern
          id="desert-pattern"
          patternContentUnits="objectBoundingBox"
          height="100%"
          width="100%"
        >
          <image
            xlink:href="../assets/img/tiles/desert.png"
            height="1"
            width="1"
            preserveAspectRatio="none"
          />
        </pattern>
        <pattern
          id="grain-pattern"
          patternContentUnits="objectBoundingBox"
          height="100%"
          width="100%"
        >
          <image
            xlink:href="../assets/img/tiles/grain.png"
            height="1"
            width="1"
            preserveAspectRatio="none"
          />
        </pattern>
        <pattern
          id="lumber-pattern"
          patternContentUnits="objectBoundingBox"
          height="100%"
          width="100%"
        >
          <image
            xlink:href="../assets/img/tiles/lumber.png"
            height="1"
            width="1"
            preserveAspectRatio="none"
          />
        </pattern>
        <pattern
          id="ocean-pattern"
          patternContentUnits="objectBoundingBox"
          height="100%"
          width="100%"
        >
          <image
            xlink:href="../assets/img/tiles/ocean.png"
            height="1"
            width="1"
            preserveAspectRatio="none"
          />
        </pattern>
        <pattern
          id="ore-pattern"
          patternContentUnits="objectBoundingBox"
          height="100%"
          width="100%"
        >
          <image
            xlink:href="../assets/img/tiles/ore.png"
            height="1"
            width="1"
            preserveAspectRatio="none"
          />
        </pattern>
        <pattern
          id="wool-pattern"
          patternContentUnits="objectBoundingBox"
          height="100%"
          width="100%"
        >
          <image
            xlink:href="../assets/img/tiles/wool.png"
            height="1"
            width="1"
            rotate="90"
            preserveAspectRatio="none"
          />
        </pattern>
      </defs>
    </svg>
  </div>
</template>

<script>
"use strict";
import * as Honeycomb from 'honeycomb-grid'
import {SVG} from '@svgdotjs/svg.js'
import {
  assignNeighbours,
  drawRoadDebug,
  getSettlementsMap,
  locateSettlements,
  renderSettlements
} from "@/assets/js/settlements";

export default {
  name: "GameBoard",
  components: {},
  data() {
    return {
      hexagonRatio: 0.866025, // Hexagon ration, height to width
      gameboardRadius: 3,
      resources: ['brick', 'desert', 'grain', 'lumber', 'ore', 'wool'],
      tiles: ['brick', 'brick', 'brick', 'desert', 'grain', 'grain', 'grain', 'grain', 'lumber', 'lumber', 'lumber', 'lumber',
                  'ore', 'ore', 'ore', 'wool', 'wool', 'wool', 'wool'],
      numberTokens: ['2', '3', '3', '4', '4', '5', '5', '6', '6', '8', '8', '9', '9', '10', '10', '11', '11', '12'],
      roadGap: 10,
      settlementRadius: 15,
    }
  },
  created: function () {

  },
  mounted: function () {
    let gameboardContainer = this.$refs.boardSvgContainer;
    let maxHexSize = this.determineMaxHexSize(gameboardContainer);

    // Create svg container that fits the maximum gameboard size and store svg in draw variable
    const draw = SVG().addTo('#board').size(`${(maxHexSize.width) * (2 * this.gameboardRadius + 2)}px`, `${(maxHexSize.height) + 2 * (this.gameboardRadius * (maxHexSize.height * 0.75))}px`);
    const drawHexGroup = draw.group();

    // Copy the defs into the dynamically created svg.
    // There should be a smarter way to do this but I was having trouble with scope or something.
    const defR = this.$refs.defRef
    draw.node.appendChild(defR)

    //Shuffle terrain tiles and number tokens
    this.tiles = this.shuffleArray(this.tiles);
    this.numberTokens = this.shuffleArray(this.numberTokens);

    // Hex object
    let Hex = this.defineHexObject(maxHexSize, drawHexGroup);
    console.log(Hex)
    let Grid = Honeycomb.defineGrid(Hex)
    console.log(Grid)

    // Render resource tiles
    const grid = this.renderResourceHexes(Hex, Grid, drawHexGroup, this.tiles, this.numberTokens);
    console.log(grid);

    // Render ocean tiles
    const oceanGrid = this.renderOceanHexes(Hex, Grid, drawHexGroup);
    console.log(oceanGrid);

    // Render the settlements
    let settlements = this.locateSettlements(grid);
    this.renderSettlements(settlements, draw);
    console.log(settlements)

    // Add a click listener to hexes
    this.$el.addEventListener('click', ({offsetX, offsetY}) => {
      const hexCoordinates = Grid.pointToHex([offsetX, offsetY])
      console.log(hexCoordinates)
      console.log(offsetX, offsetY)
      const hex = grid.get(hexCoordinates)
      console.log(hex)

      // if (hex) {
      //   hex.highlight()
      // }
    })

    // Add a hover listener to hexes
    this.$el.addEventListener('mousemove', ({offsetX, offsetY}) => {
      const hexCoordinates = Grid.pointToHex([offsetX, offsetY]);
      const hoveredHex = grid.get(hexCoordinates);

      grid.forEach(hex => {
        if (hex === hoveredHex) {
          hex.handleMouseOver();
        } else {
          hex.handleMouseOut();
        }
      })
    })

    // Add an event listener that run the function when window dimensions change
    window.addEventListener('resize', this.debounce(() => {
      handleWindowResize();
    }, 100));

    const handleWindowResize = () => {
      // Recalculate max dimensions, redefine the grid, edit svg container dimensions to max dims
      maxHexSize = this.determineMaxHexSize(gameboardContainer);
      Hex = this.defineHexObject(maxHexSize, drawHexGroup);
      Grid = Honeycomb.defineGrid(Hex);
      draw.width(`${(maxHexSize.width) * (2 * this.gameboardRadius + 2)}px`)
      draw.height(`${(maxHexSize.height) + 2 * (this.gameboardRadius * (maxHexSize.height * 0.75))}px`)
      // Update the dimensions of the grid and ocean tiles
      grid.forEach((hex) => {
        hex.redraw(maxHexSize);
      })
      grid.center.redraw(maxHexSize) // I'm not sure why it doesn't work without this.
      oceanGrid.forEach((hex) => {
        hex.redrawOcean(maxHexSize);
      })
      // Update the dimensions of the settlements
      settlements = this.updateSettlementLocations(grid, settlements);
      this.redrawSettlements(settlements, draw);
    }
    console.log((maxHexSize.width) / (2 * this.hexagonRatio))
  },
  methods: {
    // Determine maximum size of gameboard that fits play area div
    determineMaxHexSize(gameboardContainer) {
      let offsetWidth = gameboardContainer.offsetWidth;
      let offsetHeight = gameboardContainer.offsetHeight;
      let hexWidth;
      let hexHeight;

      if (offsetWidth < offsetHeight) {
        hexWidth = gameboardContainer.offsetWidth / (2 * this.gameboardRadius + 1) * this.hexagonRatio;
        hexHeight = gameboardContainer.offsetWidth / (2 * this.gameboardRadius + 1);
      } else {
        hexHeight = gameboardContainer.offsetHeight / (2 * 0.75 * this.gameboardRadius + 2);
        hexWidth = hexHeight * this.hexagonRatio;
      }

      return {width: hexWidth, height: hexHeight}
    },
    defineHexObject(maxHexSize, drawHexGroup) {
      let resourceIndex = 0;
      let tokenIndex = 0;
      const hexagonRatio = this.hexagonRatio;
      let Hex = Honeycomb.extendHex({
        size: (maxHexSize.width) / (2 * hexagonRatio),

        render(draw, tiles, numberTokens) {
          const {x, y} = this.toPoint()
          const corners = this.corners()


          this.hexPolygon = draw
              .polygon(corners.map(({x, y}) => `${x},${y}`))
              .stroke({width: 5, color: '#f7eac3'})
              .fill('none')
              .translate(x, y)

          this.hexPolygon.node.classList.add('hex')

          this.hexPolygon.node.setAttribute('resource', tiles[resourceIndex]);

          //If the current resource is not a desert assign it a number
          //Store the assigned number in 'numberToken' attribute
          if(tiles[resourceIndex] !== 'desert'){
            this.hexPolygon.node.setAttribute('numberToken', numberTokens[tokenIndex]);
            tokenIndex += 1;
          }
          resourceIndex += 1;
        },

        redraw(maxHexSize) {
          const {x, y} = this.toPoint()
          const corners = this.corners()

          this.size.xRadius = (maxHexSize.width) / (2 * hexagonRatio);
          this.size.yRadius = (maxHexSize.width) / (2 * hexagonRatio);
          this.hexPolygon.node.points.forEach((point, i) => {
            point.x = corners[i].x;
            point.y = corners[i].y;
          })
          this.hexPolygon.transform(0)
          this.hexPolygon.translate(x, y)
        },

        renderOcean(draw) {
          const {x, y} = this.toPoint()
          const corners = this.corners()

          this.hexPolygon = draw
              .polygon(corners.map(({x, y}) => `${x},${y}`))
              .stroke({width: self.roadGap, color: '#f7eac3'})
              .fill('none')
              .translate(x, y)

          this.hexPolygon.node.classList.add('ocean-hex')
          this.hexPolygon.node.setAttribute('resource', 'ocean');
        },

        redrawOcean(maxHexSize) {
          const {x, y} = this.toPoint()
          const corners = this.corners()

          this.size.xRadius = (maxHexSize.width) / (2 * hexagonRatio);
          this.size.yRadius = (maxHexSize.width) / (2 * hexagonRatio);
          this.hexPolygon.node.points.forEach((point, i) => {
            point.x = corners[i].x;
            point.y = corners[i].y;
          })
          this.hexPolygon.transform(0)
          this.hexPolygon.translate(x, y)
        },

        // highlight() {
        //   // stop running animation
        //   this.hexPolygon.timeline().stop()
        //   // run animation
        //   this.hexPolygon
        //     .fill({ opacity: 1, color: 'aquamarine' })
        //     .animate(1000)
        //     .fill({ opacity: 0, color: 'none' })
        // },

        handleMouseOver() {
          this.hexPolygon.node.classList.add('hex-hovered')
          drawHexGroup.node.appendChild(this.hexPolygon.node)
        },

        handleMouseOut() {
          this.hexPolygon.node.classList.remove('hex-hovered')
          drawHexGroup.node.prepend(this.hexPolygon.node)
        }
      });
      return Hex;
    },
    // Render hexes
    renderResourceHexes(Hex, Grid, drawHexGroup, tiles, numberTokens) {
      const grid = Grid.spiral({
        radius: this.gameboardRadius - 1,
        center: Hex(3, 3),

        // render each hex, passing the draw instance
        onCreate(hex) {
          hex.render(drawHexGroup, tiles, numberTokens);
        }
      })
      return grid;
    },
    renderOceanHexes(Hex, Grid, drawHexGroup) {
      const oceanGrid = Grid.ring({
        radius: this.gameboardRadius,
        center: Hex(3, 3),
        // render each hex, passing the draw instance
        onCreate(hex) {
          hex.renderOcean(drawHexGroup);
        }
      })
      return oceanGrid;
    },
    // Create an array of settlement objects that contain the pixel coordinates of each settlement
    locateSettlements(grid) {
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
            settlements.push({x: 0, y: rowNumTop, point: {x: corners[4].x + x, y: corners[4].y + y}})
          }
          settlements.push({x: (j * 2) + 1, y: rowNumTop, point: {x: corners[5].x + x, y: corners[5].y + y}})
          settlements.push({x: (j * 2) + 2, y: rowNumTop, point: {x: corners[0].x + x, y: corners[0].y + y}})
        })
        // Create settlements on the bottom half of the grid
        const bottomHexes = grid.filter(hex => hex.y === rowNumBottom).sort((a, b) => a.x - b.x);
        // Loops through each hex in the current row
        bottomHexes.forEach((hex, i) => {
          let corners = hex.corners();
          const {x, y} = hex.toPoint()
          if (i === 0) {
            settlements.push({x: 0, y: rowNumBottom, point: {x: corners[3].x + x, y: corners[3].y + y}})
          }
          settlements.push({x: (i * 2) + 1, y: rowNumBottom, point: {x: corners[1].x + x, y: corners[1].y + y}})
          settlements.push({x: (i * 2) + 2, y: rowNumBottom, point: {x: corners[2].x + x, y: corners[2].y + y}})
        })
        rowNumTop++;
        rowNumBottom--;
      }
      return settlements;
    },
    updateSettlementLocations(grid, settlements) {
      const newSettlements = this.locateSettlements(grid);
      settlements.forEach((settlement, i) => {
        settlement.x = newSettlements[i].x;
        settlement.y = newSettlements[i].y;
        settlement.point = newSettlements[i].point;
      })
      return settlements;
    },
    renderSettlements(settlements, drawSVG) {
      settlements.forEach(settlement => {
        let settlementSVG = this.renderSettlement(drawSVG, settlement);
        Object.assign(settlement, {svg: settlementSVG});
      })
      console.log(settlements)
    },
    // Draw the settlements
    renderSettlement(drawSVG, settlement) {
      const {x, y} = settlement.point;
      const r = 15;
      const settlementCircle = drawSVG
          .circle(r * 2)
          .stroke({ width: 4, color: '#aaa' })
          .translate(x - r, y - r);

      const settlementSVG = settlementCircle.node;
      settlementSVG.classList.add('settlement-svg');
      settlementSVG.setAttribute('state', 'empty');

      settlementSVG.addEventListener('click', () => {
        settlementSVG.setAttribute('state', 'settlement');
      })

      return settlementCircle;
    },
    redrawSettlements(settlements, drawSVG) {
      settlements.forEach(settlement => {
        this.redrawSettlement(drawSVG, settlement);
      })
    },
    redrawSettlement(drawSVG, settlement) {
      const {x, y} = settlement.point;
      const r = 15;
      settlement.svg.transform(0);
      settlement.svg.translate(x - r, y - r);
    },
    // Shuffle the elements of an inputted array
    shuffleArray(array) {
      let tempArray = array;
      let remainingElements = tempArray.length, temp, index;

      while(remainingElements){
        //pick a random remaining unshuffeled element from the array
        index = Math.floor(Math.random()* remainingElements--)
        //move that random element to the back of the array then decrease array size by 1
        //elements in the back of the array are shuffled
        temp = tempArray[remainingElements];
        tempArray[remainingElements] = tempArray[index];
        tempArray[index] = temp;
      }

      return tempArray;
    },
    // Debounce function for events
    debounce(fn, delay) {
      let timeoutID;
      return function (...args) {
        if (timeoutID) {
          clearTimeout(timeoutID);
        }
        timeoutID = setTimeout(() => {
          fn(...args);
        }, delay);
      };
    },
  }
}

</script>

<style scoped>
#board {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

#defs-svg {
  display: none;
}

#drawSVG {
  display: none;
}

::v-deep .settlement-svg[state="empty"] {
  fill: #fff;
}

::v-deep .settlement-svg[state="settlement"] {
  fill: url('#pattern1');
}

::v-deep .hex[resource="brick"] {
  fill: url('#brick-pattern');
}

::v-deep .hex[resource="desert"] {
  fill: url('#desert-pattern');
}

::v-deep .hex[resource="grain"] {
  fill: url('#grain-pattern');
}

::v-deep .hex[resource="lumber"] {
  fill: url('#lumber-pattern');
}

::v-deep .hex[resource="ore"] {
  fill: url('#ore-pattern');
}

::v-deep .hex[resource="wool"] {
  fill: url('#wool-pattern');
}

::v-deep .ocean-hex[resource="ocean"] {
  fill: url('#ocean-pattern');
}

::v-deep .hex.hex-hovered {
  stroke: #11efdd;
  z-index: 10;
}

::v-deep .road {
  z-index: 100;
}

</style>
