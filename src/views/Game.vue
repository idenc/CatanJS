<template>
  <div id="game-container">
    <div id="board-container">
      <GameBoard ref="gameBoard" />

      <Overlay ref="overlay" />
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
          id="buildButton"
          class="btn btn-primary btn-block"
          @click="startBuild"
        >
          Build
        </button>
        <button 
          id="tradeButton"
          class="btn btn-primary btn-block"
          @click="attemptTrade"
        >
          Trade
          
        </button>
        <button 
        id="dev_cardsButton"
        class="btn btn-primary btn-block">
          Dev Cards
        </button>
      </div>
      <div id="sidebar-resources-container">
        <Resources />
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
import Overlay from "@/components/Overlay";



export default {

  name: "Game",
  components: {ChatWindow, UserList, GameBoard, Resources, Overlay},

  // mounted: function () {
    

  //   // this.sockets.subscribe('trade_request', (userList) => {
  //   //   var dealer = userList[0];
  //   //   var customer = userList[1];
  //   //   console.log(customer);
  //   //   if (this.$socket.username == customer) {
  //   //     document.getElementById("tradeMsg").innerHTML = dealer + " would like to trade with you.";
  //   //     document.querySelector("#overlay.main").classList.add("active");
  //   //     document.querySelector("#overlayin.tradeOptions").classList.add("active");
  //   //   }
  //   // });

  // },
  methods: {
    startBuild() {
      this.$refs.gameBoard.startBuild();
    },

    attemptTrade() {
      this.$refs.overlay.attemptTrade();
      // this.users = this.$socket.users;
      // console.log(this.$socket.users);
      // document.querySelector("#overlay.main").classList.add("active");
      // document.querySelector("#overlayin.trade").classList.add("active");
    },
  }

  //   tradeRequest(username) {
  //     if (username === 'bank') {
  //       this.$socket.tradePlayer = 'bank';
  //       this.tradeMenu(this.$socket.username, 'bank');
  //     } else {
  //       // var dealer = this.$socket.username;
  //       // var customer = username;
  //       var userList = [this.$socket.username, username];
  //       this.$socket.emit('trade_offer', (userList));
  //     }
      
  //   },

  //   tradeMenu(dealer, customer) {
  //     document.querySelector("#overlayin.tradeMenu").classList.add("active");
  //   },

  //   cancelTrade() {
  //     document.querySelector("#overlay.trade").classList.remove("active");
  //     document.querySelector("#overlayin.trade").classList.remove("active");
  //     if (this.$socket.tradePlayer !== 'bank') {
  //       this.$socket.emit('cancel_trade', this.$socket.tradePlayer);
  //       this.$socket.tradePlayer = '';
  //     }
  //   }
  // }


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


</style>
