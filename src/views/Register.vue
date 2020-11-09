<template>
  <div class="row mt-5">
    <div class="col-md-6 m-auto">
      <div class="card card-body">
        <h1 class="text-center mb-3">
          <i class="fas fa-user-plus" /> Register
        </h1>
        <form
          action="/users/register"
          method="POST"
        >
          <div class="form-group">
            <label for="name">Name</label>
            <input
              id="name"
              v-model="name"
              type="text"
              name="name"
              class="form-control"
              placeholder="Enter Name"
            >
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="email"
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
              v-model="password"
              type="password"
              name="password"
              class="form-control"
              placeholder="Create Password"
            >
          </div>
          <div class="form-group">
            <label for="password2">Confirm Password</label>
            <input
              id="password2"
              v-model="password2"
              type="password"
              name="password2"
              class="form-control"
              placeholder="Confirm Password"
            >
          </div>
          <button
            type="submit"
            class="btn btn-primary btn-block"
          >
            Register
          </button>
        </form>
        <p class="lead mt-4">
          Have An Account? <router-link to="/login">
            Login
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Register",
  data() {
    return {
      name: '',
      email: '',
      password: '',
      password2: ''
    }
  }
}
</script>

<style scoped>

</style>
