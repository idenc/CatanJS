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
            
            <button class="btn btn-secondary rounded-pill">
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
    }
  },
  watch: {
    searchQuery: function() {
      this.$socket.emit("get_games", this.searchQuery);
    }
  }
}

</script>