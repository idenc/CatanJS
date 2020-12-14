<template>
  <div
    v-if="showPage"
    class="container"
  >
    <h2
      class="h2 pt-5"
    >
      Welcome {{ username }}
    </h2>
    <div
      id="body-container"
      class="row mt-5"
    >
      <div class="col-2">
        <button
          class="btn mb-2"
          :class="{ 'btn-primary' : pageNumber == 0, 'btn-secondary' : pageNumber != 0 }"
          @click="pageNumber = 0;"
        >
          Create Game
        </button>
        <button
          class="btn"
          :class="{ 'btn-primary' : pageNumber == 1, 'btn-secondary' : pageNumber != 1 }"
          @click="pageNumber = 1; getGames();"
        >
          Join Game
        </button>
        <button
          v-if="isAdmin"
          class="btn"
          :class="{ 'btn-primary' : pageNumber == 2, 'btn-secondary' : pageNumber != 2 }"
          @click="pageNumber = 2;"
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
        <CreateGame v-show="pageNumber == 0" />
        <JoinGame v-show="pageNumber == 1" />
        <AdminPanel v-show="pageNumber == 2" />
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
      pageNumber: 0,
      showPage: false,
      username: '',
      isAdmin: false // Super Secure Setting™
    }
  },
  mounted() {
    this.getUser();
  },
  methods: {
    getGames() {
      this.$socket.emit("lobby_get_games", "");
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
            this.$socket.emit('request_game');
            this.username = response.data.user.name;
            this.showPage = true;
            this.isAdmin = response.data.user.isAdmin;
          })
          .catch((error) => {
            //console.log(error.response);
            this.$router.push({
              name: 'Login',
              params: {statusMessage: error.response.data, alertType: 'alert-danger'}
            });
          })
    },
  },
  sockets: {
    is_in_game: function () {
      this.$router.push({name: 'Game'});
    }
  }
}
</script>


<style>
@media (max-height: 500px) {
  #body-container {
    margin-top: 0.75rem !important;
  }
}
</style>
