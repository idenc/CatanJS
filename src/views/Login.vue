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
        <a
          href="/google"
          class="g-signin-button"
        >
          <img
            id="google-logo"
            alt="Google login"
            src="@/assets/btn_google_light_normal_ios.svg"
          >
          <span id="google-signin">Sign in with Google</span>
        </a>
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
      email: '',
      password: '',
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
          .then(() => this.$router.push('/lobby'))
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

#google-logo {
  padding: 0;
}

#google-signin {
  padding: 10px;
}

.g-signin-button {
  display: inline-block;
  width: fit-content;
  border-radius: 3px;
  background-color: #3c82f7;
  color: #fff;
  box-shadow: 0 3px 0 #0f69ff;
  cursor: pointer;
  margin: 10px auto auto;
}

</style>
