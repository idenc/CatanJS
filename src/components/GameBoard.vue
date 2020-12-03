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
  locateSettlements,
  renderSettlements,
  drawRoadDebug,
  getSettlementsMap,
  updateSettlementLocations,
  redrawSettlements
} from "@/assets/js/settlements";
import {SCREEN_BREAKPOINTS} from "@/assets/js/constants";

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
      draw: SVG(),
      settlements: [],
      numberTokenSVGs: [],
      graphics: {
        oceanGap: 5,
        roadGap: 10,
        settlementRadius: 15,
        tokenBorder: 5,
        tokenDotRadius: 1.5,
        numberTokenPercentOfHex: 0.16,
      }
    }
  },
  created: function () {

  },
  mounted: function () {
    console.log(SCREEN_BREAKPOINTS.SM)
    this.updateGraphicsPropertiesByWindowSize();

    let gameboardContainer = this.$refs.boardSvgContainer;
    let maxHexSize = this.determineMaxHexSize(gameboardContainer);

    // Create svg container that fits the maximum gameboard size and store svg in draw variable
    this.draw = SVG().addTo('#board').size(`${(maxHexSize.width) * (2 * this.gameboardRadius + 2)}px`, `${(maxHexSize.height) + 2 * (this.gameboardRadius * (maxHexSize.height * 0.75))}px`);
    const draw = this.draw;
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

    this.numberTokenSVGs = this.renderNumberTokens(draw, grid);
    console.log(this.numberTokenSVGs)

    // Render ocean tiles
    const oceanGrid = this.renderOceanHexes(Hex, Grid, drawHexGroup);
    console.log(oceanGrid);

    // Setup settlements
    const maxRowWidth = grid.radius * 2 + 1;
    this.settlements = locateSettlements(grid);
    //renderSettlements(settlementsArray, draw, this.settlementRadius);
    assignNeighbours(this.settlements, maxRowWidth);
    //const settlementsMap = getSettlementsMap(settlementsArray);
    //drawRoadDebug(settlementsMap, draw, this.settlementRadius, this.roadGap);

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
    }, 150));

    const handleWindowResize = () => {
      this.updateGraphicsPropertiesByWindowSize();
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
      this.settlements = updateSettlementLocations(grid, this.settlements);
      this.redrawNumberTokens(draw, grid, this.numberTokenSVGs);
      redrawSettlements(this.settlements, draw, this.graphics.settlementRadius);
    }
    console.log((maxHexSize.width) / (2 * this.hexagonRatio))
  },
  methods: {
    updateGraphicsPropertiesByWindowSize() {
      // Set the road gap based on the window size
      console.log( window.innerWidth  );
      this.graphics.roadGap = window.innerWidth <= SCREEN_BREAKPOINTS.MD ? 5 : 10;
      this.graphics.oceanGap = window.innerWidth <= SCREEN_BREAKPOINTS.MD ? 2 : 5;
      this.graphics.tokenBorder = window.innerWidth <= SCREEN_BREAKPOINTS.MD ? 2 : 5;
      this.graphics.tokenDotRadius = window.innerWidth <= SCREEN_BREAKPOINTS.MD ? 1 : 1.5;
    },
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
      const self = this;
      return Honeycomb.extendHex({
        size: (maxHexSize.width) / (2 * hexagonRatio),

        render(draw, tiles, numberTokens) {
          const {x, y} = this.toPoint()
          const corners = this.corners()


          this.hexPolygon = draw
              .polygon(corners.map(({x, y}) => `${x},${y}`))
              .stroke({width: self.graphics.roadGap, color: '#f7eac3'})
              .fill('none')
              .translate(x, y)

          this.hexPolygon.node.classList.add('hex')

          this.hexPolygon.node.setAttribute('resource', tiles[resourceIndex]);

          //If the current resource is not a desert assign it a number
          //Store the assigned number in 'numberToken' attribute
          if (tiles[resourceIndex] !== 'desert') {
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
          this.hexPolygon.node.setAttribute('stroke-width', self.graphics.roadGap)
          this.hexPolygon.transform(0)
          this.hexPolygon.translate(x, y)
        },

        renderOcean(draw) {
          const {x, y} = this.toPoint()
          const corners = this.corners()

          this.hexPolygon = draw
              .polygon(corners.map(({x, y}) => `${x},${y}`))
              .stroke({width: self.graphics.oceanGap, color: '#f7eac3'})
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
          this.hexPolygon.node.setAttribute('stroke-width', self.graphics.oceanGap)
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
    // Shuffle the elements of an inputted array
    shuffleArray(array) {
      let tempArray = array;
      let remainingElements = tempArray.length, temp, index;

      while (remainingElements) {
        //pick a random remaining unshuffeled element from the array
        index = Math.floor(Math.random() * remainingElements--)
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
    // Draw the number tiles
    renderNumberTokens(drawSVG, grid) {
      const numberTokenSVGs = [];
      grid.forEach(hex => {
        const numberTokenSVG = this.renderNumberToken(drawSVG, hex);
        numberTokenSVGs.push(numberTokenSVG);
      })
      return numberTokenSVGs;
    },
    renderNumberToken(drawSVG, hex) {
      let number = hex.hexPolygon.node.getAttribute('numberToken')
      if (!number) {
        return;
      }
      const numberTokenRadius = hex.hexPolygon.height() * this.graphics.numberTokenPercentOfHex;
      const center = hex.center();
      const {x, y} = hex.toPoint();
      const numberToken = drawSVG.group();

      // Create Circle and add to group
      const numberTokenCircle = drawSVG
          .circle(numberTokenRadius * 2)
          .stroke({width: this.graphics.tokenBorder, color: '#aaa'})
          .fill("white")
      numberTokenCircle.node.setAttribute('cx', x + center.x)
      numberTokenCircle.node.setAttribute('cy', y + center.y)
      numberTokenCircle.node.classList.add('number-token-circle');
      numberTokenCircle.addTo(numberToken);

      // Create text and add to group
      const numberTokenText = drawSVG
          .text(`${number}`)
          .font({size: 10})
          .translate(x + center.x, y + center.y - this.graphics.roadGap/2);
      numberTokenText.node.classList.add('number-token-text');
      numberTokenText.addTo(numberToken);
      // Adjust by text up by its height/2
      numberTokenText.translate(0,-numberTokenText.node.getBBox().height / 2);
      if (number === '6' || number === '8') {
        numberTokenText.fill('red');
      }

      const dotGroup = this.renderNumberTokenDots(number, numberToken, numberTokenText, hex.toPoint(), hex.center());
      
      const numberTokenSVG = {
        container: numberToken,
        circle: numberTokenCircle,
        text: numberTokenText, 
        dots: dotGroup
      };
      return numberTokenSVG;
    },
    renderNumberTokenDots(number, numberToken, numberTokenText, {x, y}, center) {
      const dotRadius = this.graphics.tokenDotRadius;
      const dotGroup = numberToken.group();
      let numDots = 0;
      let fillColor = 'black'
      number = parseInt(number);
      number === 2 || number === 12 ? numDots = 1 : '';
      number === 3 || number === 11 ? numDots = 2 : '';
      number === 4 || number === 10 ? numDots = 3 : '';
      number === 5 || number === 9 ? numDots = 4 : '';
      number === 6 || number === 8 ? numDots = 5 : '';
      number === 6 || number === 8 ? fillColor = 'red' : '';
      for (let i = 0; i < numDots; i++) {
        const dot = dotGroup
            .circle(dotRadius)
            .stroke({width: 1, color: fillColor})
            .fill(fillColor)
        dot.node.setAttribute('cx', x + center.x + dotRadius/2)
        dot.node.setAttribute('cy', y + center.y)
        dot.translate(dotRadius*2.75*i, numberTokenText.node.getBBox().height/2);
      }
      dotGroup.translate(-dotGroup.node.getBBox().width / 2, 0)
      return dotGroup;
    },
    redrawNumberTokens(drawSVG, grid, numberTokenSVGs) {
      grid.forEach((hex, i) => {
        this.redrawNumberToken(drawSVG, hex, numberTokenSVGs[i]);
      })
    },
    redrawNumberToken(drawSVG, hex, numberTokenSVG) {
      let number = hex.hexPolygon.node.getAttribute('numberToken')
      if (!number) {
        return;
      }
      const numberTokenRadius = hex.hexPolygon.height() * this.graphics.numberTokenPercentOfHex;
      const center = hex.center();
      const {x, y} = hex.toPoint();

      // Redraw circle
      numberTokenSVG.circle.node.setAttribute('stroke-width', this.graphics.tokenBorder)
      numberTokenSVG.circle.node.setAttribute('r', numberTokenRadius)
      numberTokenSVG.circle.node.setAttribute('cx', x + center.x)
      numberTokenSVG.circle.node.setAttribute('cy', y + center.y)
      // redraw text
      numberTokenSVG.text
          .transform(0)
          .translate(x + center.x, y + center.y - this.graphics.roadGap/2);
      // Adjust by text up by its height/2
      numberTokenSVG.text.translate(0,-numberTokenSVG.text.node.getBBox().height / 2);

      numberTokenSVG.dots.remove();
      numberTokenSVG.dots = this.renderNumberTokenDots(number, numberTokenSVG.container, 
                                numberTokenSVG.text, hex.toPoint(), hex.center());
    },
    startBuild() {
      renderSettlements(this.settlements, this.draw, this.graphics.settlementRadius);
    }
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

::v-deep .settlement-svg[state="empty"]:hover {
  fill: green;
}

::v-deep .number-token-text {
  text-anchor: middle;
  /* dominant-baseline: text-after-edge; */
  font-weight: bold;
  pointer-events: none;
}

</style>
