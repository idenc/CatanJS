<template>
  <div class="row mt-5">
    <div class="col-md-6 m-auto">
      <div class="card card-body">
        <h1 class="text-center mb-3">
          <i class="fas fa-sign-in-alt" /> Login
        </h1>
        <form
          action="#"
          @submit.prevent="login"
        >
          <AuthenticationMessage
            :messages="status.msg ? [ status.msg ] : []"
            :alert-type="status.alertType"
          />
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
          No Account?
          <router-link to="/register">
            Register
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
"use strict";
import AuthenticationMessage from "@/components/AuthenticationMessage";
import axios from 'axios';

export default {
  name: "Login",
  components: {AuthenticationMessage},
  props: {
    status: {
      type: Object,
      default() {
        return {msg: '', alertType: ''}
      }
    }
  },
  data() {
    return {
      email: '',
      password: '',
    }
  },
  methods: {
    login() {
      axios.post('/login',
          {email: this.email, password: this.password},
          {
            headers: {
              'Content-Type': 'application/json'
            }
          })
          .then(() => this.$router.push('/dashboard'))
          .catch(err => {
            console.log(err.response);
            this.status.msg = err.response.data.info.message;
            this.status.alertType = 'alert-warning';
          });
    },
  }
}
</script>

<style scoped>

</style>
