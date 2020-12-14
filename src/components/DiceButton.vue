<template>
  <div v-resize-text="{ratio: 1.6, minFontSize: '0px'}">
    <button
      v-if="!isTurn"
      class="dice-button btn btn-primary btn-block disabled"
    >
      Not your turn!
    </button>
    <button
      v-else-if="turnNumber >= 2 && !hasRolled"
      class="dice-button btn btn-primary btn-block"
      @click="$emit('rollDice')"
    >
      Roll Dice
    </button>
    <button
      v-else-if="robberEvent"
      class="dice-button btn btn-primary btn-block disabled"
    >
      Move The Robber
    </button>
    <button
      v-else-if="roadEvent"
      class="dice-button btn btn-primary btn-block disabled"
    >
      Place Two Roads
    </button>
    <button
      v-else-if="hasRolled && !robberEvent && !roadEvent"
      class="dice-button btn btn-primary btn-block end-turn"
      @click="$emit('endTurn')"
    >
      End Turn
    </button>
    <button
      v-else
      class="dice-button btn btn-primary btn-block disabled"
    >
      Place Settlement & Road
    </button>
  </div>
</template>

<script>
import ResizeText from 'vue-resize-text';

export default {
  name: "DiceButton",
  directives: {
    ResizeText
  },
  props: {
    turnNumber: Number(0),
    hasRolled: Boolean(false),
    isTurn: Boolean(false),
    robberEvent: Boolean(false),
    roadEvent: Boolean(false),
  }
}
</script>

<style scoped>
.dice-button {
  margin: auto;
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
    width: fit-content;
    padding: 16px;
}

.end-turn {
  background: red;
}

@media (max-width: 950px) {
  .dice-button {
    padding: 8px;
  }
}

@media (max-width: 768px) {
  .dice-button {
    padding: 4px;
  }
}
</style>
