<template>
  <div id="user-div">
    <h1>Players</h1>
    <div id="user-list">
      <div id="user-rows">
        <template v-for="user in users">
          <li
            v-if="user.username === 'username'"
            :key="user.username"
            :style="{'color': 'white'}"
          >
            <div 
              :id="'user-row'" 
              :class="user.username"
              :style="{'background-color': user.color}"
            >
              <div id="name">
                {{ user.username }} (You) 
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
                  :id="kick-button" 
                  :class="user.username"
                >
                  Kick
                </button>
                <button 
                  :id="mute-button" 
                  :class="user.username"
                >
                  Mute
                </button>
              </div> 
            </div>
          </li>  
          <li
            v-else
            :key="user.username"
            :style="{'color': 'white'}"
          >
            <div 
              :id="'user-row'" 
              :class="user.username"
              :style="{'background-color': user.color}"
            >
              <div id="name">
                {{ user.username }} <!-- (You) -->
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
                  :id="kick-button" 
                  :class="user.username"
                >
                  Kick
                </button>
                <button 
                  :id="mute-button" 
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
  props: ['username'],
  data() {
    return {
      users: [],
    }
  },
  mounted: function () {
    this.sockets.subscribe('user joined', (user) => {
      console.log(`user joined: ${user}`)
      if (!this.users.some(u => u.username === user.username)) {
        this.users.push(user);
      }
    });

    this.sockets.subscribe('user left', (user) => {
      console.log(`user left: ${user}`)
      this.users = this.users.filter(u => u.username !== user);
    });

    this.sockets.subscribe('chat info', (info) => {
      console.log(`chat info: ${info}`)
      this.users.push(...info.current_users);
    });

    this.sockets.subscribe('user changed', (info) => {
      for (let i = 0; i < this.users.length; i++) {
        if (info.old_name === this.users[i].username) {
          this.users[i].username = info.new_name;
        }
      }
    });

    this.sockets.subscribe('color change', (color_info) => {
      // Update users color and all messages sent by that user
      for (let i = 0; i < this.users.length; i++) {
        if (this.users[i].username === color_info.username) {
          this.users[i].color = color_info.new_color;
          break;
        }
      }
    });

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
  marker:none;
  list-style-type:none;
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
