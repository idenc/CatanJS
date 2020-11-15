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


    const draw = SVG().addTo('#board').size('100%', '100%')

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

      renderSettlements(draw) {
        const { x, y } = this.toPoint()
        const corners = this.corners();
        const r = 10;
        corners.forEach(corner => {
          this.drawSettlements = draw
            .circle(r * 2)
            .move(corner.x - r, corner.y - r)
            .translate(x, y)
        })
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
    })
    const Grid = Honeycomb.defineGrid(Hex)

    // render hexes
    const grid = Grid.spiral({ 
      radius: 2, 
      center: Hex(2,2),
      // render each hex, passing the draw instance
      onCreate(hex) {
        hex.render(draw)
      } 
    })

    grid.forEach(hex => {
      console.log(hex)
      console.log(hex.corners())
      hex.renderSettlements(draw)
    })

    document.addEventListener('click', ({ offsetX, offsetY }) => {
      const hexCoordinates = Grid.pointToHex([offsetX, offsetY])
      const hex = grid.get(hexCoordinates)

      if (hex) {
        hex.highlight()
      }
    })

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
