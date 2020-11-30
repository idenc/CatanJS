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
      roadGap: 10,
      settlementRadius: 15,
    }
  },
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


    const self = this;
    // Hex object
    const Hex = Honeycomb.extendHex({
      size: hexWidth / 2,

      render(draw) {
        const {x, y} = this.toPoint()
        const corners = this.corners()

        this.draw = draw
            .polygon(corners.map(({x, y}) => `${x},${y}`))
            .stroke({width: self.roadGap, color: '#f7eac3'})
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
            .stroke({width: self.roadGap, color: '#f7eac3'})
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

    const maxRowWidth = grid.radius * 2 + 1;
    // Create an array of settlement objects that contain the pixel coordinates of each settlement
    const settlementsArray = locateSettlements(grid, grid.radius + 1, maxRowWidth)
    for (const settlement of settlementsArray) {
      renderSettlements(settlement, draw, this.settlementRadius);
    }
    assignNeighbours(settlementsArray, maxRowWidth);
    console.log(settlementsArray);
    const settlementsMap = getSettlementsMap(settlementsArray);
    drawRoadDebug(settlementsMap, draw, this.settlementRadius, this.roadGap);

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
  },
  methods: {},
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

::v-deep .road {
  z-index: 100;
}

</style>
