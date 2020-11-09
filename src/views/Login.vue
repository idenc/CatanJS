<template>
  <div class="row mt-5">
    <div class="col-md-6 m-auto">
      <div class="card card-body">
        <h1 class="text-center mb-3">
          <i class="fas fa-sign-in-alt" />  Login
        </h1>
        <form
          action="/users/login"
          method="POST"
        >
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              class="form-control"
              placeholder="Enter Email"
            >
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              class="form-control"
              placeholder="Enter Password"
            >
          </div>
          <button
            type="submit"
            class="btn btn-primary btn-block"
          >
            Login
          </button>
        </form>
        <p class="lead mt-4">
          No Account? <router-link to="/register">
            Register
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
name: "Login"
}
</script>

<style scoped>

</style>
