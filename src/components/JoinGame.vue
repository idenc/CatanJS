<template>
  <div class="container">
    <div class="input-group mb-3">
      <input
        v-model="searchQuery"
        type="text"
        class="form-control"
        placeholder="Search by name..."
      >
    </div>

    <div class="container overflow-auto">
      <div
        v-for="game in games"
        :key="game.name"
      >
        <div class="card bg-info text-white mb-3">
          <h5 class="card-header">
            {{ game.name }}
          </h5>
          <div class="card-body">
            <p class="card-text">
              <span>
                TYPE: {{ game.type }}
              </span>
              <span class="ml-3">
                Players: {{ game.numPlayers }}/{{ game.playerCap }}
              </span>
            </p>
            
            <button
              v-if="game.numPlayers < game.playerCap"
              class="btn btn-secondary rounded-pill"
              @click="joinGame(game.name)"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "JoinGame",
  data() {
    return {
      games : {
        
      },
      searchQuery : ""
    }
  },
  sockets: {
    get_games: function(games) {
      //console.log(games);
      this.games = games;
    },
    enter_password: function(game_name) {
      const user_input = prompt("Enter password for game '" + name + "'");
      
      const bundle = { 
        name : game_name,
        password : user_input
      };

      this.$socket.emit("lobby_join_game_passworded", bundle);
    },
    lobby_error: function(error_message) {
      alert(error_message);
    }
  },
  watch: {
    searchQuery: function() {
      this.$socket.emit("lobby_get_games", this.searchQuery);
    }
  },
  methods: {
    joinGame(name) {
      this.$socket.emit("lobby_join_game", name);
    }
  }
}

</script>