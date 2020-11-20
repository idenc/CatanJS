<template>
  <div class="row mt-5">
    <div class="col-md-6 m-auto">
      <div class="card card-body text-center">
        <h1><i class="fab fa-node-js fa-3x" /></h1>
        <p>Create an account or login</p>
        <router-link
          to="/register"
          class="btn btn-primary btn-block mb-2"
        >
          Register
        </router-link>
        <router-link
          to="/login"
          class="btn btn-secondary btn-block"
        >
          Login
        </router-link>
        <router-link
          to="/game"
          class="btn btn-secondary btn-block"
        >
          Skip
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>


export default {
  name: 'Home',
  components: {}
}
</script>
