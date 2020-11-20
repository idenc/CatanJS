<template>
  <div id="board">

  </div>
</template>

<script>
"use strict";
import * as Honeycomb from 'honeycomb-grid'
import { SVG } from '@svgdotjs/svg.js'

export default {
  name: "Board",
  components: {},
  mounted: function() {


    const draw = SVG().addTo('#board').size('100%', '100%');

    // Draw the settlements
    const renderSettlements = (settlement) => {
      const { x, y } = settlement.point;
      const r = 15;
      draw
        .circle(r * 2)
        .stroke({ width: 5, color: '#000' })
        .fill('none')
        .translate(x - r, y - r)
    };

    // Hex object
    const Hex = Honeycomb.extendHex({
      size: 80,

      render(draw) {
        const { x, y } = this.toPoint()
        const corners = this.corners()

        this.draw = draw
          .polygon(corners.map(({ x, y }) => `${x},${y}`))
          .fill('none')
          .stroke({ width: 5, color: '#999' })
          .translate(x, y)
      },

      renderOcean(draw) {
        const { x, y } = this.toPoint()
        const corners = this.corners()

        this.draw = draw
          .polygon(corners.map(({ x, y }) => `${x},${y}`))
          .fill('blue')
          .stroke({ width: 5, color: '#999' })
          .translate(x, y)
      },

      highlight() {
        // stop running animation
        this.draw.timeline().stop()
        // run animation
        this.draw
          .fill({ opacity: 1, color: 'aquamarine' })
          .animate(1000)
          .fill({ opacity: 0, color: 'none' })
      },

      handleMouseOver() {
        this.draw
          .fill({ opacity: 1, color: 'aquamarine' })
      },

      handleMouseOut() {
        this.draw
          .fill({ opacity: 0, color: 'none' })
      }
    });
    const Grid = Honeycomb.defineGrid(Hex)

    // render hexes
    const grid = Grid.spiral({ 
      radius: 2, 
      center: Hex(3,3),

      // render each hex, passing the draw instance
      onCreate(hex) {
        hex.render(draw)
      } 
    })
    console.log(grid)

    const oceanGrid = Grid.ring({ 
      radius: 3, 
      center: Hex(3,3),
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
        const topHexes = grid.filter(hex => hex.y === rowNumTop + 1).sort((a,b) => a.x - b.x);
        // Loops through each hex in the current row
        topHexes.forEach( (hex, j) => {
          let corners = hex.corners();
          const { x, y } = hex.toPoint()
          if (j === 0) {
            settlements.push({x: 0, y: rowNumTop, point: {x: corners[4].x + x, y: corners[4].y + y} })
          }
          settlements.push({x: (j * 2) + 1, y: rowNumTop, point: {x: corners[5].x + x, y: corners[5].y + y} })
          settlements.push({x: (j * 2) + 2, y: rowNumTop, point: {x: corners[0].x + x, y: corners[0].y + y} })
        })
        // Create settlements on the bottom half of the grid
        const bottomHexes = grid.filter(hex => hex.y === rowNumBottom).sort((a,b) => a.x - b.x);
        // Loops through each hex in the current row
        bottomHexes.forEach( (hex, i) => {
          let corners = hex.corners();
          const { x, y } = hex.toPoint()
          if (i === 0) {
            settlements.push({x: 0, y: rowNumBottom, point: {x: corners[3].x + x, y: corners[3].y + y} })
          }
          settlements.push({x: (i * 2) + 1, y: rowNumBottom, point: {x: corners[1].x + x, y: corners[1].y + y} })
          settlements.push({x: (i * 2) + 2, y: rowNumBottom, point: {x: corners[2].x + x, y: corners[2].y + y} })
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
    document.addEventListener('click', ({ offsetX, offsetY }) => {
      const hexCoordinates = Grid.pointToHex([offsetX, offsetY])
      console.log(hexCoordinates)
      console.log(offsetX, offsetY)
      const hex = grid.get(hexCoordinates)

      if (hex) {
        hex.highlight()
      }
    })

    // Add a hover listener to hexes
    document.addEventListener('mousemove', ({ offsetX, offsetY }) => {
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
    height: 100vh;
  }

</style>
