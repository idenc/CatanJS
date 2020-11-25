<template>
  <div class="container">
    <div class="mb-3">
      <p>Game Name:</p>
      <div class="form-row">
        <div class="col-auto mx-auto">
          <input
            id="gameName"
            type="text"
            class="form-control"
            placeholder="super cool name"
          >
        </div>
      </div>
    </div>
    <div class="mb-3">
      <p>Game Type:</p>
      <div class="custom-control custom-radio custom-control-inline">
        <input 
          id="publicGameRadio"
          checked
          type="radio"
          name="gameRadio"
          class="custom-control-input"
          @click="showPass=false"
        >
        <label
          for="publicGameRadio"
          class="custom-control-label"
        >
          Public
        </label>
      </div>
      <div class="custom-control custom-radio custom-control-inline">
        <input 
          id="privateGameRadio"
          type="radio"
          name="gameRadio"
          class="custom-control-input"
          @click="showPass=true"
        >
        <label
          for="privateGameRadio"
          class="custom-control-label"
        >
          Private
        </label>
      </div>
    </div>

    <div class="mb-3">
      <p>Players:</p>
      <div class="custom-control custom-radio custom-control-inline">
        <input
          id="3PlayerRadio"
          checked
          type="radio"
          name="playerRadio"
          class="custom-control-input"
        >
        <label
          for="3PlayerRadio"
          class="custom-control-label"
        >
          3
        </label>
      </div>
      <div class="custom-control custom-radio custom-control-inline">
        <input
          id="4PlayerRadio"
          type="radio"
          name="playerRadio"
          class="custom-control-input"
        >
        <label
          for="4PlayerRadio"
          class="custom-control-label"
        >
          4
        </label>
      </div>
    </div>

    
    <div
      v-show="showPass"
      class="mb-3"
    >
      <p>Game Password:</p>
      <div class="form-row">
        <div class="col-auto mx-auto">
          <input
            id="gamePassword"
            type="text"
            class="form-control"
            placeholder="super secret password"
          >
        </div>
      </div>
    </div>
    <button
      class="btn btn-primary"
      @click="createGameSubmit()"
    >
      Create Game
    </button>
  </div>
</template>

<script>

export default {
  name: "CreateGame",
  data() {
    return {
      showPass : false
    }
  },
  methods : {
    createGameSubmit() {
      // Collect data from form
      const gameName = document.getElementById("gameName").value;
      const gameType = document.getElementById("publicGameRadio").checked ? "public" : "private";
      const playerType = document.getElementById("3PlayerRadio").checked ? 3 : 4;
      const gamePassword = document.getElementById("gamePassword").value;

      // Need to add user id in here (from websocket)
      const gameRequest = {
        name : gameName,
        type : gameType,
        numPlayers : 0,
        playerCap : playerType,
        players : [],
        password : gamePassword
      };
      //console.log(gameRequest);

      this.$socket.emit("create_game", gameRequest);
    }
  }
}

</script>