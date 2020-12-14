<template>
  <div
    v-if="player"
    id="user-div"
  >
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
                v-if="user.username === player.name"
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
                # VP:<br> {{ user.victoryPoints }}
                <!-- here is where we put victory points *********************-->
              </div>
              <div id="num-roads">
                <!-- Do we need this?-->
                # Roads:<br> 0
                <!-- here is where we put num of roads *********************-->
              </div>
              <div id="num-cards">
                # Cards: <br> {{ user.numDevCards }}
                <!-- here is where we put num of cards *********************-->
              </div>
              <div

                :id="'host-buttons'"
              >
                <button
                  :id="'kick-button'"
                  :class="'btn btn-primary btn-block'"
                  @click="kick(user)"
                >
                  Kick
                </button>
                <button
                  :id="'mute-button'"
                  :class="'btn btn-primary btn-block'"
                  @click="mute(user)"
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
  props: [
    'player',
    'usersProp',
  ],
  data() {
    return {
      users: Array()
    }
  },
  watch: {
    usersProp: function(newVal) {
      this.users = newVal;
    }
  },
  mounted: function () {
    this.sockets.subscribe('got kicked', (user) => {
      if (this.player.name === user.username) {

        document.querySelector("#overlay.main").classList.add("active");
        document.querySelector("#overlayin.kicked").classList.add("active");
        document.querySelector("#overlay.main").addEventListener("click", () => {
          document.querySelector("#overlay.main").classList.remove("active");
          document.querySelector("#overlayin.kicked").classList.remove("active");
          this.$router.push('/');
        });

        this.$socket.unsubscribe('got kicked');
        this.$socket.unsubscribe('user list');
        this.$socket.unsubscribe('user info');
        this.$socket.unsubscribe('user joined');
        this.$socket.unsubscribe('user left');
        this.$socket.unsubscribe('user changed');
        this.$socket.unsubscribe('color change');
        this.$socket.unsubscribe('chat message');
        this.$socket.unsubscribe('chat info');
        this.$socket.unsubscribe('mute player');
      }


    });



  },
  methods: {
    kick: function (user) {
      console.log(this.player.name);
      console.log(this.users[0].username);
      // console.log(this.$socket.isHost);
      if (this.player.name == this.users[0].username) {
        this.$socket.emit('got kicked', user);
        this.$socket.emit('alert message', user.username + " has been kicked!");
      } else {
        this.playerAlert();
      }

    },
    mute: function (user) {
      if (this.player.name == this.users[0].username) {
        this.$socket.emit('mute player', user);
      } else {
        this.playerAlert();
      }
    },
    playerAlert: function () {
      document.querySelector("#overlay.main").classList.add("active");
      document.querySelector("#overlayin.player").classList.add("active");
      document.querySelector("#overlay.main").addEventListener("click", () => {
        document.querySelector("#overlay.main").classList.remove("active");
        document.querySelector("#overlayin.player").classList.remove("active");
      });
    },
    sendUserListUpdate: function () {
      console.log('sending updated user list')
      this.$emit('updateUsers', this.users);
    }
  },
  sockets: {
    chat_info: function (chatInfo) {
      console.log(`chat info: ${chatInfo}`)
      this.users = [];
      this.users.push(...chatInfo.current_users);
      this.sendUserListUpdate();
    },
    update_players: function (users) {
      this.users = users;
      this.sendUserListUpdate();
    },
    user_joined: function (user) {
      console.log(`user joined: ${user}`)
      if (!this.users.some(u => u.username === user.username)) {
        this.users.push(user);
      }
      this.sendUserListUpdate();
    },
    user_left: function (user) {
      console.log(`user left: ${user}`)
      this.users = this.users.filter(u => u.username !== user);
      this.sendUserListUpdate();
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

p.mute {
  display: none;
  color: red;

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
  flex-grow: 1;
  padding: 4px;
}

#host-buttons {
  padding-right: 8px !important;
}


li {
  padding: 1px;
  width: 100%;
  height: 33%;
  marker: none;
  list-style-type: none;
  color: white;
}

@media (max-height: 700px) {
  #kick-button, #mute-button {
    padding: 0px;
  }
}

@media (max-height: 600px) {
  h1 {
    font-size: 1rem;
    margin: 0.25rem;
  }

  #user-rows {
    font-size: 0.5rem;
  }
}



</style>
