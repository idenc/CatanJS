<template>
  <div id="game-container">
    <div id="board-container">
      <DevCardModal v-if="devModal === true" show="devModal"/>
      <GameBoard />
    </div>
    <div id="sidebar-container">
      <div id="sidebar-players-container">
        <UserList
          id="user-list"
          :username="'test'"
        />
      </div>
      <div id="sidebar-chat-container">
        <ChatWindow id="chat" />
      </div>
      <div id="sidebar-buttons-container">
        <button class="btn btn-primary btn-block">
          Build
        </button>
        <button class="btn btn-primary btn-block">
          Trade
        </button>
        <button class="btn btn-primary btn-block" @click="devModal=!devModal">
          Dev Cards
        </button>
      </div>
      <div id="sidebar-resources-container" />
    </div>
  </div>
</template>

<script>
"use strict";
import GameBoard from "@/components/GameBoard";
import UserList from "@/components/chat/UserList";
import ChatWindow from "@/components/chat/ChatWindow";
import DevCardModal from '@/components/DevCardModal';

export default {

  name: "Game",
  components: {ChatWindow, UserList, GameBoard, DevCardModal},
  data(){
    return{
      devModal: false
    }
  },
  mounted: function () {
  }
}
</script>

<style scoped>
#game-container {
  display: flex;
  flex-direction: row;
}

#board-container {
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
}

#sidebar-players-container {
  background: rgb(44, 44, 44);
  height: 33%;
  margin-bottom: 1rem;
}

#sidebar-chat-container {
  background: rgb(44, 44, 44);
  height: 33%;
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
  flex-grow: 1;
}

#user-list, #chat {
  height: 100%;
  width: 100%;
}

</style>
