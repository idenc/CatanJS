<template>
  <div class="resources-container">
    <div
      class="resource"
      resource="clay"
      @click="select('brick')"
    >
      <img
        class="resource-icon"
        src="../assets/svg/clay.svg"
      >
      <div>
        <span class="resource-count">{{ player.brick }}</span>
      </div>
    </div>
    <div
      class="resource"
      resource="wood"
      @click="select('lumber')"
    >
      <img
        class="resource-icon"
        src="../assets/svg/wood.svg"
      >
      <div>
        <span class="resource-count">{{ player.lumber }}</span>
      </div>
    </div>
    <div
      class="resource"
      resource="sheep"
      @click="select('wool')"
    >
      <img
        class="resource-icon"
        src="../assets/svg/sheep.svg"
      >
      <div>
        <span class="resource-count">{{ player.wool }}</span>
      </div>
    </div>
    <div
      class="resource"
      resource="wheat"
      @click="select('grain')"
    >
      <img
        class="resource-icon"
        src="../assets/svg/wheat.svg"
      >
      <div>
        <span class="resource-count">{{ player.grain }}</span>
      </div>
    </div>
    <div
      class="resource"
      resource="ore"
      @click="select('ore')"
    >
      <img
        class="resource-icon"
        src="../assets/svg/ore.svg"
      >
      <div>
        <span class="resource-count">{{ player.ore }}</span>
      </div>
    </div>
  </div>
</template>

<script>
"use strict";
export default {

  name: "Resources",
  components: {},
  props: {
    player: Object()
  },
  data(){
    return {
      monopolySelect: false,
      yearOfPlentySelect: false,
      yearOfPlentySelected: 0
    }
  },
  mounted: function () {
  },
  sockets: {
    monopoly_played() {
      this.monopolySelect = true;
    },
    yearOfPlentyPlayed() {
      this.yearOfPlentySelect = true;
    }
  },
  methods: {
    select (resource){
      if(this.monopolySelect){
        this.$socket.emit('monopoly_selected', resource);
        this.monopolySelect = false;
      }
      else if(this.yearOfPlentySelect){
        this.yearOfPlentySelected++;
        if(this.yearOfPlentySelected === 2){
          this.$socket.emit('yearOfPlenty_selected', resource);
          this.yearOfPlentySelected = 0;
          this.yearOfPlentySelect = false;
          return;
        }
        this.$socket.emit('yearOfPlenty_selected', resource);
      }
    }
  }
}
</script>

<style scoped>

.resources-container {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  padding: 0.5rem;
}

.resource {
  display: flex;
  flex-direction: row;
  max-width: 20%;
  padding: 0.5em;
  margin: 0.125em;
  border-radius: 1rem;
  align-items: center;
}

.resource[resource="clay"] {
  background: #e03838;
  cursor: pointer;
}

.resource[resource="wood"] {
  background: green;
  cursor: pointer;
}

.resource[resource="sheep"] {
  background: #bababa;
  cursor: pointer;
}

.resource[resource="wheat"] {
  background: #cf9800;
  cursor: pointer;
}

.resource[resource="ore"] {
  background: #4d4d4d;
  cursor: pointer;
}

.resource-icon {
  height: 1.5em;
  width: 1.5em;
  margin-right: 0.75em;
}

.resource-count {
  color: white;
  height: 2rem;
  pointer-events: none;
}

@media (max-height: 600px) {
  .resources-container {
    padding: 0.25rem;
  }

  .resource {
    display: flex;
    flex-direction: row;
    max-width: 20%;
    padding: 0.125em 0.25em;
    margin: 0.05em 0.175em;
    border-radius: 0.75rem;
  }

  .resource-icon {
    height: 1.25em;
    width: 1.25em;
    margin-right: 0.25em;
  }
}

</style>
