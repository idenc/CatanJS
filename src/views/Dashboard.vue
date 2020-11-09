<template>
  <div>
    <h1 class="mt-4">
      Dashboard
    </h1>
    <p class="lead mb-3">
      Welcome
    </p>
    <router-link
      to="/logout"
      class="btn btn-secondary"
    >
      Logout
    </router-link>
  </div>
</template>

<script>
export default {
name: "Dashboard"
}
</script>

<style scoped>

</style>
