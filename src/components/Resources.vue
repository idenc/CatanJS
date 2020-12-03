<template>
  <div class="resources-container">
    <div class="resource" resource="clay">
      <img 
        class="resource-icon" 
        src="..\assets\svg\clay.svg"
      >
      <div>
        <span class="resource-count">1</span>
      </div>
    </div>
    <div class="resource" resource="wood">
      <img 
        class="resource-icon" 
        src="..\assets\svg\wood.svg"
      >
      <div>
        <span class="resource-count">1</span>
      </div>
    </div>
    <div class="resource" resource="sheep">
      <img 
        class="resource-icon" 
        src="..\assets\svg\sheep.svg"
      >
      <div>
        <span class="resource-count">1</span>
      </div>
    </div>
    <div class="resource" resource="wheat">
      <img 
        class="resource-icon" 
        src="..\assets\svg\wheat.svg"
      >
      <div>
        <span class="resource-count">1</span>
      </div>
    </div>
    <div class="resource" resource="ore">
      <img 
        class="resource-icon" 
        src="..\assets\svg\ore.svg"
      >
      <div>
        <span class="resource-count">1</span>
      </div>
    </div>
  </div>
</template>

<script>
"use strict";
export default {

  name: "Resources",
  components: {},
  mounted: function () {
  },
  methods: {
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
  /* background: red; */
  border-radius: 1rem;
  align-items: center;
}

.resource[resource="clay"] {
  background: #e03838;
}

.resource[resource="wood"] {
  background: green;
}

.resource[resource="sheep"] {
  background: #bababa;
}

.resource[resource="wheat"] {
  background: #cf9800;
}

.resource[resource="ore"] {
  background: #4d4d4d;
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

</style>
