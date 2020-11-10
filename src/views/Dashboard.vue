<template>
  <div>
    <h1 class="mt-4">
      Dashboard
    </h1>
    <p class="lead mb-3">
      Welcome {{ user.name }}
    </p>
    <a
      class="btn btn-secondary"
      href="#"
      @click="logout"
    >
      Logout
    </a>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "Dashboard",
  data() {
    return {
      user: {
        name: "test"
      }
    }
  },
  mounted() {
    this.getUserData()
  },
  methods: {
    getUserData() {
      axios.get("/user")
          .then((response) => {
            console.log(response)
            this.user = response.data.user;
          })
          .catch((error) => {
            console.log(error.response);
            this.$router.push({
              name: 'Login',
              params: {statusMessage: error.response.data, alertType: 'alert-danger'}
            });
          })
    },
    logout() {
      axios.get("/logout")
          .then(() => {
            this.$router.push({
              name: 'Login',
              params: {statusMessage: 'You are now logged out', alertType: 'alert-success'}
            });
          });
    }
  },
}
</script>

<style scoped>

</style>
