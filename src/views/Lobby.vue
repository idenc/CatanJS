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
          @click="showCreateScreen = true"
        >
          Create Game
        </button>
        <button
          class="btn btn-secondary"
          @click="showCreateScreen = false; getGames();"
        >
          Join Game
        </button>
        <button
          class="btn btn-secondary"
          @click="logout"
        >
          Logout
        </button>
      </div>
      <div class="col">
        <CreateGame v-show="showCreateScreen" />
        <JoinGame v-show="!showCreateScreen" />
      </div>
    </div>
  </div>
</template>

<script>
import CreateGame from "@/components/CreateGame";
import JoinGame from "@/components/JoinGame";
import axios from 'axios';

export default {
  name: 'Lobby',
  components: {CreateGame, JoinGame},

  data() {
    return {
      showCreateScreen: true,
      showUsername: false,
      username: ''
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
