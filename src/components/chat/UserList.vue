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
var username;
export default {
  name: "UserList",
  props: ['username'],
  data() {
    return {
      users: [],
      socketList: []
    }
  },


  mounted: function () {
    

    this.sockets.subscribe('got kicked', (user) => {
      // console.log(this.$socket.username);
      // console.log(user.username);
      if (this.$socket.username === user.username) {
        
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

    this.sockets.subscribe('user list', (userList) => {
      this.users = userList;
      this.$socket.users = userList;
      console.log(this.$socket);
      
    });
    
    this.sockets.subscribe('user info', (user) => {
      if (this.$socket.username == undefined) {
        this.$socket.username = user.username;
        this.$socket.isHost = user.isHost;
      }
    });

    this.sockets.subscribe('user joined', (user) => {
      // console.log(this.users.length);
      // console.log(`user joined: ${user}`)
      // if (!this.users.some(u => u.username === user.username)) {
      if (this.users.length == 1) {
        this.users[0].isHost = true;
        this.$socket.isHost = true;
      } 
      // if (username == undefined) {
      //   // console.log("it works!");
      //   username 
      // }
    
      // console.log(this.$socket.username);
      
      // this.sockets.broadcast.emit('set host', user.username);
      // this.$socket.username = user.username;
      this.users.push(user);
      // this.$socket.users.push(user);
      // this.socketList.push(this.$socket);
      // }
      // console.log(this);
    });

    this.sockets.subscribe('user left', (user) => {
      if (!this.users[0].isHost) {
        this.users[0].isHost = true;
        if (this.username === this.users[0].username) {
          this.$socket.isHost = true;
        }
      }
      // console.log(`user left: ${user}`)
      this.users = this.users.filter(u => u.username !== user);
      this.$socket.users = this.users;
      // this.socketList = this.socketList.filter(u => u)
    });

    // this.sockets.subscribe('chat info', (info) => {
    //   // console.log(`chat info: ${info}`)
    //   this.users.push(...info.current_users);
    // });

    this.sockets.subscribe('user changed', (info) => {
      for (let i = 0; i < this.users.length; i++) {
        if (info.old_name === this.users[i].username) {
          this.users[i].username = info.new_name;
        }
      }
      this.$socket.users = this.users;
    });

    this.sockets.subscribe('color change', (color_info) => {
      // Update users color and all messages sent by that user
      for (let i = 0; i < this.users.length; i++) {
        if (this.users[i].username === color_info.username) {
          this.users[i].color = color_info.new_color;
          break;
        }
      }
      this.$socket.users = this.users;
    });


  },
  methods: {
    kick: function (user) {
      
      // console.log(this.$socket.isHost);
      if (this.$socket.isHost) {
        console.log(this.$socket);
        this.$socket.emit('got kicked', user);
        this.$socket.emit('alert message', user.username + " has been kicked!");
      } else {
        this.playerAlert();
      }
      
    },


    mute: function (user) {
      if (this.$socket.isHost) {
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
  margin: auto; 
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

</style>
