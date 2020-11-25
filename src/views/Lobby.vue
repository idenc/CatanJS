<template>
  <div class="container">
    <div class="row mt-5">
      <div class="col-2">
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

export default {
  name: 'Lobby',
  components: {CreateGame, JoinGame},

  data() {
    return {
      showCreateScreen: true
    }
  },
  methods: {
    getGames() {
      this.$socket.emit("get_games", "");
    }
  }
}
</script>


<style></style>