<template>
  <div
    id="board"
    ref="boardSvgContainer"
  >
    <svg>
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

export default {
  name: "GameBoard",
  components: {},
  mounted: function () {
    const gameboardRadius = 3;

    let gameboardContainer = this.$refs.boardSvgContainer;
    let offsetWidth = gameboardContainer.offsetWidth;
    let offsetHeight = gameboardContainer.offsetHeight;
    let hexWidth;
    if (offsetWidth < offsetHeight) {
      hexWidth = gameboardContainer.offsetWidth / (2 * gameboardRadius + 1);
    } else {
      hexWidth = gameboardContainer.offsetHeight / (2 * gameboardRadius + 1) * 1.25;
    }
    console.log(gameboardContainer)
    console.log(hexWidth)

    const resources = ['brick', 'desert', 'grain', 'lumber', 'ore', 'wool'];
    let resourceIndex = 0;


    const draw = SVG().addTo('#board').size('100%', '100%');
    // const use = draw.use('pattern1', require('../assets/img/tiles/tilepatterns.svg'))


    // Copy the defs into the dynamically created svg.
    // There should be a smarter way to do this but I was having trouble with scope or something.
    const defR = this.$refs.defRef
    draw.node.appendChild(defR)


    // Draw the settlements
    const renderSettlements = (settlement) => {
      const {x, y} = settlement.point;
      const r = 15;
      const settlementCircle = draw
          .circle(r * 2)
          .stroke({ width: 4, color: '#aaa' })
          .translate(x - r, y - r)

      const settlementSVG = settlementCircle.node;
      settlementSVG.classList.add('settlement-svg')
      settlementSVG.setAttribute('state', 'empty')


      settlementSVG.addEventListener('click', () => {
        settlementSVG.setAttribute('state', 'settlement')
      })
    };

    // Hex object
    const Hex = Honeycomb.extendHex({
      size: hexWidth / 2,

      render(draw) {
        const {x, y} = this.toPoint()
        const corners = this.corners()

        this.draw = draw
            .polygon(corners.map(({x, y}) => `${x},${y}`))
            .stroke({width: 5, color: '#f7eac3'})
            .fill('none')
            .translate(x, y)

        this.draw.node.classList.add('hex')

        console.log(resources[resourceIndex % 6])
        this.draw.node.setAttribute('resource', resources[resourceIndex % 6]);
        resourceIndex += 1;
      },

      renderOcean(draw) {
        const {x, y} = this.toPoint()
        const corners = this.corners()

        this.draw = draw
            .polygon(corners.map(({x, y}) => `${x},${y}`))
            .stroke({width: 5, color: '#f7eac3'})
            .fill('none')
            .translate(x, y)

        this.draw.node.classList.add('ocean-hex')
        this.draw.node.setAttribute('resource', 'ocean');
      },

      // highlight() {
      //   // stop running animation
      //   this.draw.timeline().stop()
      //   // run animation
      //   this.draw
      //     .fill({ opacity: 1, color: 'aquamarine' })
      //     .animate(1000)
      //     .fill({ opacity: 0, color: 'none' })
      // },

      handleMouseOver() {
        this.draw.node.classList.add('hex-hovered')
        draw.node.appendChild(this.draw.node)
      },

      handleMouseOut() {
        this.draw.node.classList.remove('hex-hovered')
        draw.node.prepend(this.draw.node)
      }
    });
    const Grid = Honeycomb.defineGrid(Hex)

    // render hexes
    const grid = Grid.spiral({
      radius: gameboardRadius - 1,
      center: Hex(3, 3),

      // render each hex, passing the draw instance
      onCreate(hex) {
        hex.render(draw)
      }
    })
    console.log(grid)

    const oceanGrid = Grid.ring({
      radius: gameboardRadius,
      center: Hex(3, 3),
      // render each hex, passing the draw instance
      onCreate(hex) {
        hex.renderOcean(draw)
      }
    })
    console.log(oceanGrid)

    // Create an array of settlement objects that contain the pixel coordinates of each settlement
    const locateSettlements = () => {
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
      console.log(settlements);
      return settlements;
    }
    const settlements = locateSettlements(grid)
    settlements.forEach(settlement => {
      renderSettlements(settlement);
    })

    // Add click listener to hexes
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
  }
}
</script>

<style scoped>
#board {
  /* padding: 100px 0; */
  width: 100%;
  height: 100%;
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

</style>
