<template>
  <div class="container">
    <div class="row mt-5">
      <div class="col-2">
        <h2
          v-if="showUsername"
          class="h2"
        >
          Welcome {{ username }}
        </h2>
        <button
          class="btn btn-secondary mb-2"
          @click="showCreateScreen = true; showAdmin = false;"
        >
          Create Game
        </button>
        <button
          class="btn btn-secondary"
          @click="showCreateScreen = false; showAdmin = false; getGames();"
        >
          Join Game
        </button>
        <button
          v-if="isAdmin"
          class="btn btn-secondary"
          @click="showAdmin = true;"
        >
          Admin Panel
        </button>
        <button
          class="btn btn-secondary"
          @click="logout"
        >
          Logout
        </button>
      </div>
      <div class="col">
        <CreateGame v-show="showCreateScreen && !showAdmin" />
        <JoinGame v-show="!showCreateScreen && !showAdmin" />
        <AdminPanel v-show="showAdmin" />
      </div>
    </div>
  </div>
</template>

<script>
import CreateGame from "@/components/CreateGame";
import JoinGame from "@/components/JoinGame";
import AdminPanel from "@/components/AdminPanel";
import axios from 'axios';

export default {
  name: 'Lobby',
  components: {CreateGame, JoinGame, AdminPanel},

  data() {
    return {
      showCreateScreen: true,
      showUsername: false,
      username: '',
      showAdmin: false,
      isAdmin: false // Super Secure Setting™
    }
  },
  mounted() {
    this.getUser();
  },
  methods: {
    getGames() {
      this.$socket.emit("get_games", "");
    },
    logout() {
      axios.get("/logout")
          .then(() => {
            this.$router.push({
              name: 'Login',
              params: {statusMessage: 'You are now logged out', alertType: 'alert-success'}
            });
          });
    },
    getUser() {
      axios.get("/user")
          .then((response) => {
            console.log(response)
            this.username = response.data.user.name;
            this.showUsername = true;
            this.isAdmin = response.data.user.isAdmin;
          })
          .catch((error) => {
            console.log('error')
            console.log(error);
            this.$router.push({
              name: 'Login',
              params: {statusMessage: error.response.data, alertType: 'alert-danger'}
            });
          });
    }
  }
}
</script>


<style></style>
