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
            :messages="myStatusMessage ? [ myStatusMessage ] : []"
            :alert-type="myAlertType"
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
    statusMessage: String(''),
    alertType: String(''),
  },
  data() {
    return {
      email: 'iden.craven@gmail.com',
      password: '1235451',
      myStatusMessage: String(''),
      myAlertType: String(''),
    }
  },
  watch: {
    statusMessage: {
      immediate: true,
      handler(newVal) {
        console.log('status changed: ', newVal);
        this.myStatusMessage = newVal;
      },
    },
    alertType: {
      immediate: true,
      handler(newVal) {
        console.log('alert changed: ', newVal);
        this.myAlertType = newVal
      }
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
            this.myStatusMessage = err.response.data.info.message;
            this.myAlertType = 'alert-warning';
          });
    },
  }
}
</script>

<style scoped>

</style>
