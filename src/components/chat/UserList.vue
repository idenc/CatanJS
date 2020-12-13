<template>
  <div id="user-div">
    <h1>Players</h1>
    <div id="user-list">
      <div id="user-rows">
        <template v-for="user in users">
          <li
            :key="user.username"
            :style="{'color': 'white'}"
          >
            <div
              :id="'user-row'"
              :class="user.username"
              :style="{'background-color': user.colour}"
            >
              <div
                v-if="user.username === username"
                id="name"
              >
                {{ user.username }} (You)
              </div>
              <div
                v-else
                id="name"
              >
                {{ user.username }}
              </div>

              <div id="vic-points">
                # VP:<br> 0
                <!-- here is where we put victory points *********************-->
              </div>
              <div id="num-roads">
                # Roads:<br> 0
                <!-- here is where we put num of roads *********************-->
              </div>
              <div id="num-cards">
                # Cards: <br> 0
                <!-- here is where we put num of cards *********************-->
              </div>
              <div id="admin-buttons">
                <button
                  :class="user.username"
                >
                  Kick
                </button>
                <button
                  :class="user.username"
                >
                  Mute
                </button>
              </div>
            </div>
          </li>
        </template>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "UserList",
  props: {
    username: String('')
  },
  data() {
    return {
      users: [],
    }
  },
  mounted: function () {
    this.sockets.subscribe('update_victory_points', (player) => {
      let user = this.users.find(u => u.username === player.name);
      if(!user){
        return;
      }
      console.log(`${player.name} VP: ${player.victoryPoints}`);
      let container = document.getElementsByClassName(user.username);
      let victoryPoints = container[0].children[1];
      victoryPoints.innerHTML = `# VP:<br> ${player.victoryPoints}`;

    });
  },
  sockets: {
    chat_info: function (chatInfo) {
      console.log(`chat info: ${chatInfo}`)
      this.users.push(...chatInfo.current_users);
    },
    user_joined: function (user) {
      console.log(`user joined: ${user}`)
      if (!this.users.some(u => u.username === user.username)) {
        this.users.push(user);
      }
    },
    user_left: function (user) {
      console.log(`user left: ${user}`)
      this.users = this.users.filter(u => u.username !== user);
    }
  }
}
</script>

<style scoped>

ul {
  list-style-type: none;
  margin: 0;
  padding: 10px;
  text-align: left;
}

h1 {
  color: white;
}

#user-list {
  height: 88%;
}

#user-row {
  width: 100%;
  display: flex;
  height: 100%;
  flex-direction: row;
  align-content: stretch;
  justify-content: space-between;
  overflow: hidden;
}

#user-rows {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-content: stretch;
  align-items: flex-start;
}

#user-row div {
  align-self: center;
  align-content: space-between;
  /* margin: auto;  */
  padding: 0.25rem 0 0.25rem;
}

#name {
  width: 40%;
  padding: 1em;
  text-overflow: ellipsis;
  overflow: hidden;
}

#vic-points, #num-roads, #num-cards {
  text-decoration: underline;
}


#kick-button, #mute-button {
  margin: 2px;
}


li {
  padding: 1px;
  width: 100%;
  height: 33%;
  marker: none;
  list-style-type: none;
  color: white;
}

@media (max-width: 768px) {
  h1 {
    font-size: 1rem;
    margin: 0.25rem;
  }

  #user-rows {
    font-size: 0.5rem;
  }
}

</style>
