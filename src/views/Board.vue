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
          .stroke({ width: 1, color: '#999' })
          .translate(x, y)
      },

      highlight() {
        this.draw
          // stop running animation
          // .stop(true, true)
          .fill({ opacity: 1, color: 'aquamarine' })
          .animate(1000)
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
    console.log(grid)

    document.addEventListener('click', ({ offsetX, offsetY }) => {
      console.log(offsetX)
      console.log(offsetY)
      const hexCoordinates = Grid.pointToHex([offsetX, offsetY])
      console.log(hexCoordinates)
      const hex = grid.get(hexCoordinates)
      console.log(hex)

      if (hex) {
        hex.highlight()
      }
    })
  }
}
</script>

<style scoped>
  #board {
    height: 100vh;
  }

</style>
