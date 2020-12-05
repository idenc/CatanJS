<template>
  <button
    class="btn btn-primary btn-block"
    @click="buildClicked"
  >
    Build
  </button>
</template>

<script>
export default {
  name: "BuildButton",
  methods: {
    buildClicked() {
      this.$emit('build');
    }
  }
}
</script>

<style scoped>

</style>
