<template>
  <div class="row mt-5">
    <div class="col-md-6 m-auto">
      <div class="card card-body">
        <h1 class="text-center mb-3">
          <i class="fas fa-user-plus" /> Register
        </h1>
        <form
          v-if="getFinished"
          action="#"
          @submit.prevent="register"
        >
          <AuthenticationMessage
            :messages="errors"
            alert-type="alert-warning"
          />
          <div class="form-group">
            <label for="name">Username</label>
            <input
              id="name"
              v-model="name"
              type="text"
              name="name"
              class="form-control"
              placeholder="Enter Name"
            >
          </div>
          <div v-if="!fromGoogle">
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
          </div>
          <button
            type="submit"
            class="btn btn-primary btn-block"
          >
            Register
          </button>
        </form>
        <p class="lead mt-4">
          Have An Account?
          <router-link to="/">
            Login
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
  name: "Register",
  components: {
    AuthenticationMessage
  },
  data() {
    return {
      getFinished: false,
      fromGoogle: false,
      name: '',
      email: '',
      password: '',
      password2: '',
      errors: Array(),
    }
  },
  mounted() {
    axios.get('/register')
        .then(response => {
          this.fromGoogle = response.data
          this.getFinished = true;
        })
        .catch(err => console.log(err));

  },
  methods: {
    regularRegistration() {
      this.errors = [];

      // Validate form
      // Check required fields
      if (!this.name || !this.email || !this.password || !this.password2) {
        this.errors.push({msg: 'Please fill in all fields'});
      }

      // Check passwords match
      if (this.password !== this.password2) {
        this.errors.push({msg: 'Passwords do not match'});
      }

      if (this.errors.length === 0) { // Validation passed
        console.log("emitting registration");
        // Send registration request to server
        axios.post('/register', {
          name: this.name,
          email: this.email,
          password: this.password
        })
            .then(() => {
              // When user is successfully registered, redirect to login page.
              this.$router.push({
                name: 'Login',
                params: {statusMessage: 'Registration successful. You can now log in', alertType: 'alert-success'}
              });
            }).catch(err => this.errors.push(err.response.data.msg));
      }
    },
    googleRegistration() {
      axios.post('/register', {name: this.name}, { withCredentials: true})
          .then(() => this.$router.push('/lobby'))
          .catch(err => this.errors.push(err.response.data.msg));
    },
    register() {
      if (this.fromGoogle) {
        this.googleRegistration();
      } else {
        this.regularRegistration();
      }
    }
  }
}
</script>

<style scoped>

</style>
