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
    <b-toast
      id="game-toast"
      class="align-self-start"
      title="BootstrapVue"
      static
      auto-hide-delay="5000"
    >
      <template #toast-title>
        <strong class="mr-2"> {{ toastTitle }} </strong>
      </template>
      {{ toastMessage }}
    </b-toast>
  </div>
</template>

<script>
"use strict";
import * as Honeycomb from 'honeycomb-grid'
import {SVG} from '@svgdotjs/svg.js'
import {
  locateSettlements,
  redrawSettlements,
  renderSettlements,
  startBuildSettlements,
  updateSettlementLocations,
  upgradeSettlement
} from "@/assets/js/settlements";
import {SCREEN_BREAKPOINTS, maxBuildings} from "@/assets/js/constants";
import {redrawRoads, renderRoads, startRoadSelection} from "@/assets/js/roads";
import {BToast} from 'bootstrap-vue'

export default {
  name: "GameBoard",
  components: {BToast},
  props: {
    turnNumber: Number(0)
  },
  data() {
    return {
      hexagonRatio: 0.866025, // Hexagon ration, height to width
      gameboardRadius: 3,
      resources: ['brick', 'desert', 'grain', 'lumber', 'ore', 'wool'],
      tiles: [],
      numberTokens: [],
      draw: SVG(),
      settlements: [],
      roads: [],
      player: {
        name: '',
        brick: 0,
        ore: 0,
        wool: 0,
        grain: 0,
        lumber: 0,
        numSettlements: maxBuildings.settlements,
        numRoads: maxBuildings.roads,
        numCities: maxBuildings.cities,
        colour: '',
        isTurn: false,
      },
      graphics: {
        oceanGap: 8,
        roadGap: 8,
        settlementRadius: 15,
        tokenBorder: 5,
        tokenDotRadius: 1.5,
        numberTokenPercentOfHex: 0.16,
        shipTokenPercentOfHex: 0.24,
        shipTokenBorder: 3,
      },
      toastTitle: 'Put toast title here',
      toastMessage: 'Put toast message here',
      robberEvent: false,
    }
  },
  watch: {
    player: function (val) {
      this.$emit('updatePlayer', val);
    }
  },
  created: function () {

  },
  mounted: function () {
    // this.$bvToast.show(`game-toast`)
  },
  methods: {
    initializeBoard() {
      console.log(SCREEN_BREAKPOINTS.SM)
      this.updateGraphicsPropertiesByWindowSize();

      let gameboardContainer = this.$refs.boardSvgContainer;
      let maxHexSize = this.determineMaxHexSize(gameboardContainer);

      // Create svg container that fits the maximum gameboard size and store svg in draw variable
      this.draw = SVG().addTo('#board')
      this.draw.width(`${(maxHexSize.width) * (2 * this.gameboardRadius + 2)}px`)
      this.draw.height(`${(maxHexSize.height) + 2 * (this.gameboardRadius * (maxHexSize.height * 0.75))}px`);
      const draw = this.draw;
      const drawOceanHexGroup = draw.group();
      const drawHexGroup = draw.group();


      // Copy the defs into the dynamically created svg.
      // There should be a smarter way to do this but I was having trouble with scope or something.
      const defR = this.$refs.defRef
      draw.node.appendChild(defR)

      // Hex object
      let Hex = this.defineHexObject(maxHexSize, drawHexGroup);
      console.log(Hex)
      let Grid = Honeycomb.defineGrid(Hex)
      console.log(Grid)

      // Render resource tiles
      const grid = this.renderResourceHexes(Hex, Grid, drawHexGroup, this.tiles);
      console.log(grid);

      this.renderNumberTokens(draw, grid);

      // Render ocean tiles
      const oceanGrid = this.renderOceanHexes(Hex, Grid, drawOceanHexGroup);
      console.log(oceanGrid);

      // Finds the proper location to render settlements
      locateSettlements(grid, this.settlements);
      // Render any settlements already built
      renderSettlements(this.settlements, this.draw, this.graphics.settlementRadius);
      // Render any roads already built
      renderRoads(this);

      // Add a click listener to hexes
      this.$el.addEventListener('click', ({offsetX, offsetY}) => {
        const hexCoordinates = Grid.pointToHex([offsetX, offsetY])
        console.log(hexCoordinates)
        console.log(offsetX, offsetY)
        const hex = grid.get(hexCoordinates)
        console.log(hex)
        //If it is this players turn and the robber event is true move the robber to the clicked tile
        /*if(this.player.isTurn && this.robberEvent){
          let newRobber = hex.hexPolygon.node.getAttribute('index');
          //console.log(`former robber = ${fomerRobber}, new robber = ${newRobber}`);
          this.robberEvent = false;
          this.$emit('updateRobberEvent', this.robberEvent);
          this.$socket.emit('robber_moved', newRobber);
        }*/

        //ForTesting
        if(this.player.isTurn){
          let newRobber = hex.hexPolygon.node.getAttribute('index');
          //console.log(`former robber = ${fomerRobber}, new robber = ${newRobber}`);
          this.robberEvent = false;
          this.$emit('updateRobberEvent', this.robberEvent);
          this.$socket.emit('robber_moved', newRobber);
        }
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
        console.log(grid)
        oceanGrid.forEach((hex) => {
          hex.redrawOcean(maxHexSize);
        })
        this.redrawNumberTokens(draw, grid);
        // Update the dimensions of the settlements
        updateSettlementLocations(grid, this.settlements);
        redrawSettlements(this.settlements, draw);
        redrawRoads(this);
        const roadSelectors = this.draw.find('.road-selector');
        if (roadSelectors.length > 0) {
          roadSelectors.remove();
          startRoadSelection(this);
        }

      }
      console.log((maxHexSize.width) / (2 * this.hexagonRatio))

      this.sockets.subscribe('update_settlements', (updatedInfo) => {
        console.log('updating settlements');
        this.settlements = new Map(JSON.parse(updatedInfo.settlements));
        if (updatedInfo.player) {
          this.player = updatedInfo.player;
        }

        // Update the dimensions of the settlements
        updateSettlementLocations(grid, this.settlements);
        renderSettlements(this.settlements, this.draw, this.graphics.settlementRadius);
      });

      this.sockets.subscribe('update_robber_location', (robberIndex) => {
        let fomerRobber = this.tiles.findIndex((t) => t.isRobber === true);
        this.tiles[fomerRobber].isRobber = false;
        this.tiles[robberIndex].isRobber = true;
        //let oldHex = grid.get({x: this.tiles[fomerRobber].x, y: this.tiles[fomerRobber].y});
        //let newHex = grid.get({x: this.tiles[robberIndex].x, y: this.tiles[robberIndex].y});
        //const oldCoordinates = [this.tiles[fomerRobber].x, this.tiles[fomerRobber].y];
        //const newCoordinates = [this.tiles[robberIndex].x, this.tiles[robberIndex].y];
        //console.log(`Old robber coordinates X:${oldCoordinates[0]}, Y:${oldCoordinates[1]}`);
        //console.log(`New robber coordinates X:${newCoordinates[0]}, Y:${newCoordinates[1]}`);
        this.redrawRobberToken(this.draw, grid, Number(fomerRobber), Number(robberIndex));
      });
    },
    updateGraphicsPropertiesByWindowSize() {
      // Set the road gap based on the window size
      console.log(window.innerWidth);
      this.graphics.roadGap = window.innerWidth <= SCREEN_BREAKPOINTS.MD ? 4 : 8;
      this.graphics.oceanGap = window.innerWidth <= SCREEN_BREAKPOINTS.MD ? 4 : 8;
      this.graphics.tokenBorder = window.innerWidth <= SCREEN_BREAKPOINTS.MD ? 2 : 5;
      this.graphics.tokenDotRadius = window.innerWidth <= SCREEN_BREAKPOINTS.MD ? 1 : 1.5;
      this.graphics.shipTokenBorder = window.innerWidth <= SCREEN_BREAKPOINTS.MD ? 1 : 3;
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
      const hexagonRatio = this.hexagonRatio;
      const self = this;
      const coords = [];
      return Honeycomb.extendHex({
        size: (maxHexSize.width) / (2 * hexagonRatio),

        render(draw, tiles) {
          const {x, y} = this.toPoint()
          const corners = this.corners()
          let gridX = this.x - 1;
          const gridY = this.y - 1;
          coords.push({x: this.x, y: this.y});
          console.log('coords');
          console.log(coords);

          // Fix shifting in coords
          // For some reason 1st, 2nd, and last rows are shifted right one
          if (gridY !== 2) {
            gridX--;
          }
          const tile = tiles.find((t) => t.x === gridX && t.y === gridY);
          const tileIndex = tiles.findIndex((t) => t.x === gridX && t.y === gridY);

          this.hexPolygon = draw
              .polygon(corners.map(({x, y}) => `${x},${y}`))
              .stroke({width: self.graphics.roadGap, color: '#f7eac3'})
              .fill('none')
              .translate(x, y)

          this.hexPolygon.node.classList.add('hex')

          if (!tile) {
            console.log("failed to find tile at " + gridX + ", " + gridY);
            return;
          }

          this.hexPolygon.node.setAttribute('resource', tile.resource);
          this.hexPolygon.node.setAttribute('index', tileIndex);
          //If the current resource is not a desert assign it a number
          //Store the assigned number in 'numberToken' attribute
          if (tile.resource !== 'desert') {
            this.hexPolygon.node.setAttribute('numberToken', tile.number);
          }
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
          const center = this.center()

          this.hexPolygon = draw
              .polygon(corners.map(({x, y}) => `${x},${y}`))
              .stroke({width: self.graphics.oceanGap, color: '#2357A5'})
              .fill('none')
              .translate(x, y)

          this.hexPolygon.node.classList.add('ocean-hex')
          this.hexPolygon.node.setAttribute('resource', 'ocean');

          let shipURL = '';
          let dockCorners;
          this.x === 2 && this.y === 6 ? shipURL = require('../assets/svg/ship-3to1.svg') : '';
          this.x === 2 && this.y === 6 ? dockCorners = [corners[5], center, center, corners[0]] : '';
          this.x === 1 && this.y === 4 ? shipURL = require('../assets/svg/ship-clay.svg') : '';
          this.x === 1 && this.y === 4 ? dockCorners = [corners[0], center, center, corners[1]] : '';
          this.x === 1 && this.y === 2 ? shipURL = require('../assets/svg/ship-wood.svg') : '';
          this.x === 1 && this.y === 2 ? dockCorners = [corners[0], center, center, corners[1]] : '';
          this.x === 2 && this.y === 0 ? shipURL = require('../assets/svg/ship-3to1.svg') : '';
          this.x === 2 && this.y === 0 ? dockCorners = [corners[1], center, center, corners[2]] : '';
          this.x === 4 && this.y === 0 ? shipURL = require('../assets/svg/ship-wheat.svg') : '';
          this.x === 4 && this.y === 0 ? dockCorners = [corners[2], center, center, corners[3]] : '';
          this.x === 5 && this.y === 1 ? shipURL = require('../assets/svg/ship-ore.svg') : '';
          this.x === 5 && this.y === 1 ? dockCorners = [corners[2], center, center, corners[3]] : '';
          this.x === 6 && this.y === 3 ? shipURL = require('../assets/svg/ship-3to1.svg') : '';
          this.x === 6 && this.y === 3 ? dockCorners = [corners[3], center, center, corners[4]] : '';
          this.x === 5 && this.y === 5 ? shipURL = require('../assets/svg/ship-sheep.svg') : '';
          this.x === 5 && this.y === 5 ? dockCorners = [corners[4], center, center, corners[5]] : '';
          this.x === 4 && this.y === 6 ? shipURL = require('../assets/svg/ship-3to1.svg') : '';
          this.x === 4 && this.y === 6 ? dockCorners = [corners[4], center, center, corners[5]] : '';

          if (dockCorners) {
            const dock = draw
                .polyline(dockCorners.map(({x, y}) => `${x},${y}`))
                .stroke({width: self.graphics.oceanGap, color: '#824d14'})
                .fill('transparent')
                .translate(x, y)
            Object.assign(this, {dock: dock});
          }

          if (shipURL !== '') {
            const shipTokenRadius = this.hexPolygon.height() * self.graphics.shipTokenPercentOfHex;
            const shipToken = draw.group()

            const shipTokenCircle = draw
                .circle(shipTokenRadius * 2.2)
                .stroke({width: self.graphics.shipTokenBorder, color: '#aaa'})
                .fill("white")
            shipTokenCircle.node.setAttribute('cx', x + center.x)
            shipTokenCircle.node.setAttribute('cy', y + center.y)
            shipTokenCircle.addTo(shipToken);

            const shipTokenImage = draw
                .image(shipURL)
                .size(`${shipTokenRadius * 1.9}px`, `${shipTokenRadius * 1.9}px`)
                .translate(x + center.x - (shipTokenRadius * 1.9 / 2), y + center.y - (shipTokenRadius * 1.9 / 2));
            shipTokenImage.addTo(shipToken);

            shipToken.node.setAttribute('cx', x + center.x)
            shipToken.node.setAttribute('cy', y + center.y)
            shipToken.node.classList.add('number-token-circle');
            Object.assign(this, {token: {group: shipToken, circle: shipTokenCircle, image: shipTokenImage}});
          }
        },

        redrawOcean(maxHexSize) {
          let {x, y} = this.toPoint()
          let corners = this.corners()
          let center = this.center();

          // Redraw ocean hex
          this.size.xRadius = (maxHexSize.width) / (2 * hexagonRatio);
          this.size.yRadius = (maxHexSize.width) / (2 * hexagonRatio);
          this.hexPolygon.node.points.forEach((point, i) => {
            point.x = corners[i].x;
            point.y = corners[i].y;
          })
          this.hexPolygon.node.setAttribute('stroke-width', self.graphics.oceanGap)
          this.hexPolygon.transform(0)
          this.hexPolygon.translate(x, y)

          // Redraw docks
          let dockCorners;
          this.x === 2 && this.y === 6 ? dockCorners = [corners[5], center, center, corners[0]] : '';
          this.x === 1 && this.y === 4 ? dockCorners = [corners[0], center, center, corners[1]] : '';
          this.x === 1 && this.y === 2 ? dockCorners = [corners[0], center, center, corners[1]] : '';
          this.x === 2 && this.y === 0 ? dockCorners = [corners[1], center, center, corners[2]] : '';
          this.x === 4 && this.y === 0 ? dockCorners = [corners[2], center, center, corners[3]] : '';
          this.x === 5 && this.y === 1 ? dockCorners = [corners[2], center, center, corners[3]] : '';
          this.x === 6 && this.y === 3 ? dockCorners = [corners[3], center, center, corners[4]] : '';
          this.x === 5 && this.y === 5 ? dockCorners = [corners[4], center, center, corners[5]] : '';
          this.x === 4 && this.y === 6 ? dockCorners = [corners[4], center, center, corners[5]] : '';
          if (dockCorners) {
            this.dock.node.points.forEach((point, i) => {
              point.x = dockCorners[i].x;
              point.y = dockCorners[i].y;
            })
            this.dock
                .transform(0)
                .translate(x, y)
          }

          if (this.token) {
            // Redraw circle
            const shipTokenRadius = this.hexPolygon.height() * self.graphics.shipTokenPercentOfHex;
            this.token.circle.node.setAttribute('stroke-width', self.graphics.shipTokenBorder)
            this.token.circle.node.setAttribute('r', shipTokenRadius * 1.1)
            this.token.circle.node.setAttribute('cx', x + center.x)
            this.token.circle.node.setAttribute('cy', y + center.y)

            this.token.image
                .size(`${shipTokenRadius * 1.9}px`, `${shipTokenRadius * 1.9}px`)
                .transform(0)
                .translate(x + center.x - (shipTokenRadius * 1.9 / 2), y + center.y - (shipTokenRadius * 1.9 / 2));
          }
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
    renderResourceHexes(Hex, Grid, drawHexGroup, tiles) {
      return Grid.spiral({
        radius: this.gameboardRadius - 1,
        center: Hex(3, 3),

        // render each hex, passing the draw instance
        onCreate(hex) {
          hex.render(drawHexGroup, tiles);
        }
      });
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
      console.log(numberTokenSVGs)
    },
    renderNumberToken(drawSVG, hex) {
      let number = hex.hexPolygon.node.getAttribute('numberToken');
      let resource = hex.hexPolygon.node.getAttribute('resource');
      const numberTokenRadius = hex.hexPolygon.height() * this.graphics.numberTokenPercentOfHex;
      const center = hex.center();
      const {x, y} = hex.toPoint();

      let numberTokenURL = '';
      number === '2' ? numberTokenURL = require('../assets/svg/token-2.svg') : '';
      number === '3' ? numberTokenURL = require('../assets/svg/token-3.svg') : '';
      number === '4' ? numberTokenURL = require('../assets/svg/token-4.svg') : '';
      number === '5' ? numberTokenURL = require('../assets/svg/token-5.svg') : '';
      number === '6' ? numberTokenURL = require('../assets/svg/token-6.svg') : '';
      number === '8' ? numberTokenURL = require('../assets/svg/token-8.svg') : '';
      number === '9' ? numberTokenURL = require('../assets/svg/token-9.svg') : '';
      number === '10' ? numberTokenURL = require('../assets/svg/token-10.svg') : '';
      number === '11' ? numberTokenURL = require('../assets/svg/token-11.svg') : '';
      number === '12' ? numberTokenURL = require('../assets/svg/token-12.svg') : '';
      resource === 'desert' ? numberTokenURL = require('../assets/svg/token-robber.svg') : '';
      if (numberTokenURL !== '') {
        const numberTokenRadius = hex.hexPolygon.height() * this.graphics.numberTokenPercentOfHex;

        const numberToken = drawSVG
            .image(numberTokenURL)
            .size(`${numberTokenRadius * 2}px`, `${numberTokenRadius * 2}px`)
            .translate(x + center.x - (numberTokenRadius), y + center.y - (numberTokenRadius));
        Object.assign(hex, {token: numberToken});
      }
    },
    redrawNumberTokens(drawSVG, grid) {
      grid.forEach((hex) => {
        this.redrawNumberToken(drawSVG, hex);
      })
    },
    redrawNumberToken(drawSVG, hex) {
      let number = hex.hexPolygon.node.getAttribute('numberToken')
      const numberTokenRadius = hex.hexPolygon.height() * this.graphics.numberTokenPercentOfHex;
      const center = hex.center();
      const {x, y} = hex.toPoint();
      console.log(center)
      console.log(x, y)
      console.log(hex)

      // Redraw number token
      hex.token
          .size(`${numberTokenRadius * 2}px`, `${numberTokenRadius * 2}px`)
          .transform(0)
          .translate(x + center.x - (numberTokenRadius), y + center.y - (numberTokenRadius));
    },
    redrawRobberToken(drawSVG, grid, oldTileIndex, newTileIndex){
      let oldHex = grid.get(oldTileIndex);
      let newHex = grid.get(newTileIndex);
      console.log(oldHex);
      console.log(newHex);
    },
    startBuild(type) {
      if (type === 'road') {
        startRoadSelection(this);
      } else if (type === 'settlement') {
        startBuildSettlements(this);
      }
    },
    setUsername(username) {
      // Let the server know a player has connected
      this.$socket.emit('player_joined', username);
      this.player.name = username;
    }
  },
  sockets: {
    board_info: function (boardInfo) {
      this.tiles = boardInfo.tiles;
      this.settlements = new Map(JSON.parse(boardInfo.settlements));
      this.roads = boardInfo.roads;
      this.$emit('updateTurnNumber', boardInfo.turnNumber);
      this.player = boardInfo.player;
      this.initializeBoard();
    },
    update_roads: function (newRoads) {
      if (newRoads.player) {
        this.player = newRoads.player;
      }
      this.roads = newRoads.roads;
      renderRoads(this);
    },
    update_city: function (info) {
      const settlement = this.settlements.get(JSON.stringify(info.city));
      settlement.state = 'city';
      if (info.player) {
        this.player = info.player;
      }
      upgradeSettlement(settlement);
    },
    start_turn: function (players) {
      const clientPlayer = players.find(p => p.name === this.player.name);
      if (clientPlayer) {
        this.player = clientPlayer;
      }
    },
    dice_result: function (result) {
      const newPlayer = result.playerData.find(p => p.name === this.player.name);
      if (newPlayer) {
        this.player = newPlayer;
      }
      if(result.diceRoll === 7 && this.player.isTurn){
        this.robberEvent = true;
        this.$emit('updateRobberEvent', this.robberEvent);
        this.toastTitle = "Rolled";
        this.toastMessage = `${result.diceRoll}: Click on a tile to move the robber`;
        this.$bvToast.show('game-toast');
      }
      else{
        this.toastTitle = "Rolled";
        this.toastMessage = result.diceRoll;
        this.$bvToast.show('game-toast');
      }
    },
    /*update_robber_location: function(robberIndex){
      let fomerRobber = this.tiles.findIndex((t) => t.isRobber === true);
      
      this.tiles[fomerRobber].isRobber = false;
      this.tiles[robberIndex].isRobber = true;
      const oldCoordinates = [this.tiles[fomerRobber].x, this.tiles[fomerRobber].y];
      const newCoordinates = [this.tiles[robberIndex].x, this.tiles[robberIndex].y];
      //console.log(`Old robber coordinates X:${oldCoordinates[0]}, Y:${oldCoordinates[1]}`);
      //console.log(`New robber coordinates X:${newCoordinates[0]}, Y:${newCoordinates[1]}`);
      this.redrawRobberToken(this.draw, oldCoordinates, newCoordinates);
    },*/
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

::v-deep .build-selector:hover {
  fill: green;
}

</style>
