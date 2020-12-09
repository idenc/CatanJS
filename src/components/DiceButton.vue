<template>
  <div>
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
      v-else-if="hasRolled"
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
export default {
  name: "DiceButton",
  props: {
    turnNumber: Number(0),
    hasRolled: Boolean(false),
    isTurn: Boolean(false)
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
  width: 25%;
}

.end-turn {
  background: red;
}
</style>
