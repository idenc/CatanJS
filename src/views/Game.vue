<template>
  <div id="game-container">
    <div id="board-container">
      <GameBoard ref="gameBoard" />
    </div>
    <div id="sidebar-container">
      <div id="sidebar-players-container">
        <UserList
          id="user-list"
          username=""
        />
      </div>
      <div id="sidebar-chat-container">
        <ChatWindow id="chat" />
      </div>
      <div id="sidebar-buttons-container">
        <button
          class="btn btn-primary btn-block"
          @click="startBuild"
        >
          Build
        </button>
        <button 
          class="btn btn-primary btn-block"
          @click="attemptTrade()"
        >
          Trade
          
        </button>
        <button class="btn btn-primary btn-block">
          Dev Cards
        </button>
      </div>
      <div id="sidebar-resources-container">
        <Resources />
      </div>
    </div>
    <div id="overlay" class="trade">
      <div id="overlayin" class="trade">
        <p class="big"> Choose someone to trade with: </p>
        <template v-for="user in users">
          <li
            v-if="$socket.username !== user.username"
            :key="user.username"
            :style="{'color': 'white', 'list-style':'none'}"
          >
            <div 
              :id="'user-row'" 
              :class="user.username"
            >
              <div id="name">
                {{ user.username }} <!-- (You) -->
              </div>
              <button 
                :class="'btn btn-primary btn-block'"
                @click="tradeRequest(user.username)"
              >
                Request
              </button>
            </div>
          </li>
        </template>
        <button
          :class="'btn btn-primary btn-block'"
          @click="cancelTrade()"
        >
          Cancel
        </button>
      </div>
      <div id="overlayin" class="tradeOptions">
        <p id="tradeMsg" class="big">Someone would like to trade with you</p>
        <button
          :class="'btn btn-primary btn-block'"
          @click="acceptTrade()"
        >
          Accept
        </button>
        <button
          :class="'btn btn-primary btn-block'"
          @click="declineTrade()"
        >
          Decline
        </button>
      </div>
    </div>
    <div id="overlay" class="alert">
      <div id="overlayin" class="mute">
        <p class="big">You have been muted. You can no longer send chat messages.</p>
        <p class="dark">Click anywhere to dismiss.</p>
      </div>
      <div id="overlayin" class="unmute">
        <p class="big">You have been unmuted. You can now send chat messages.</p>
        <p class="dark">Click anywhere to dismiss.</p>
      </div>
      <div id="overlayin" class="kicked">
        <p class="big">You have been kicked. You will be returned to the login menu.</p>
        <p class="dark">Click anywhere to dismiss.</p>
      </div>
      <div id="overlayin" class="player">
        <p class="big">Sorry, these options are for the host!</p>
        <p class="dark">Click anywhere to dismiss.</p>
      </div>
    </div>
  </div>
</template>

<script>
"use strict";
import GameBoard from "@/components/GameBoard";
import UserList from "@/components/chat/UserList";
import ChatWindow from "@/components/chat/ChatWindow";
import Resources from "@/components/Resources";



export default {

  name: "Game",
  components: {ChatWindow, UserList, GameBoard, Resources,
  },
  data() {
    return {
      users: this.$socket.users,
    }
  },
  mounted: function () {
    

    this.sockets.subscribe('trade_request', (userList) => {
      var dealer = userList[0];
      var customer = userList[1];
      console.log(customer);
      if (this.$socket.username == customer) {
        document.getElementById("tradeMsg").innerHTML = dealer + " would like to trade with you.";
        document.querySelector("#overlay.trade").classList.add("active");
        document.querySelector("#overlayin.tradeOptions").classList.add("active");
      }
    });

  },
  methods: {
    startBuild() {
      this.$refs.gameBoard.startBuild();
    },

    attemptTrade() {
      this.users = this.$socket.users;
      console.log(this.$socket.users);
      document.querySelector("#overlay.trade").classList.add("active");
      document.querySelector("#overlayin.trade").classList.add("active");
    },

    tradeRequest(username) {
      var dealer = this.$socket.username;
      var customer = username;
      var userList = [dealer, customer];
       
      this.$socket.emit('trade_offer', (userList));
    },

    cancelTrade() {
      document.querySelector("#overlay.trade").classList.remove("active");
      document.querySelector("#overlayin.trade").classList.remove("active");
    }
  }


}
</script>

<style scoped>
#game-container {
  display: flex;
  flex-direction: row;
}

#user-row {
  width: 100%;
  display: flex;
  /* height: 100%; */
  flex-direction: row;
  flex-wrap: nowrap;
  align-content: space-between;
  align-items: center;
  justify-content: space-between;
  padding: 1%;

  
}

#user-row div { 
  width: 30%;

}

/* #user-row button {
  width: 50%;

}  */

#overlayin button {
  width: 50%;
}

#board-container {
  background: #1b75bb;
  flex-grow: 5;
  flex-shrink: 1;
  height: 100vh;
  overflow: hidden;
}

#sidebar-container {
  display: flex;
  flex-direction: column;
  flex-grow: 2;
  flex-shrink: 0;
  height: 100vh;
  background: rgb(133, 133, 133);
  padding: 1rem;
  max-width: 40%;
}

#sidebar-players-container {
  background: rgb(44, 44, 44);
  /* height: 33%; */
  flex: 1 0;
  margin-bottom: 1rem;
}

#sidebar-chat-container {
  background: rgb(44, 44, 44);
  /* height: 33%; */
  flex: 1 0;
  margin-bottom: 1rem;
}

#sidebar-buttons-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 1rem;
}

#sidebar-buttons-container button {
  margin: 0;
  width: 30%;
  padding: 0.5rem 1rem;
}

#sidebar-resources-container {
  background: rgb(44, 44, 44);
  /* flex-grow: 1; */
}

#user-list, #chat {
  height: 100%;
  width: 100%;
}

#overlay.trade * {
  pointer-events: all;
}

#overlayin li {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-content: flex-start;
}

/* #overlayin.trade {
  width: 30%;
} */

/* #overlayin div {
  width: 50%;
} */


#overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  z-index: 999;
  opacity: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: 0s;
  transition: all 0s;

  visibility: hidden;
  animation: fadeOut 0.5s;
  animation-fill-mode: forwards;
}

#overlay * {
  pointer-events: none;
}

#overlay.active {
  visibility: visible;
  animation: fadeIn 0.5s;
  animation-fill-mode: forwards;
}

#overlayin {
  width: 30%;
  visibility: hidden;
  padding: 1em;
  padding-left: 4em;
  padding-right: 4em;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 5px;
  display: none;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: rgb(255, 255, 255);
  box-shadow: 0 0 20px black;
}

#overlayin.trade  {
  background-color:  #1b75bb;
}

#overlayin.tradeOptions {
  width: 30%;
  /* height: 10%; */
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-content: flex-start;
  padding: 1%;
  background-color:  #1b75bb;
}

.tradeOptions button{
  
  padding: 1%;
  width: 100%;
}

#overlayin * {
    margin: 0px;
  }

#overlayin.active {
  display: flex;
  visibility: visible;
}
  
#overlayin p {
  text-align: center;
  font-size: 1em;
}

p.big {
  font-size: 2em !important;
}

p.darker {
  color: #aaa;
}

</style>
