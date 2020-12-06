<template>
  <div id="game-container">
    <div id="board-container">
      <DevCardModal v-if="devModal === true" />
      <GameBoard ref="gameBoard" />
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
        <BuildButton
          id="build-button"
          style="width: 30%;"
          @buildStarted="startBuild"
        />
        <button class="btn btn-primary btn-block">
          Trade
        </button>
        <button
          class="btn btn-primary btn-block"
          @click="devModal=!devModal"
        >
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
import DevCardModal from '@/components/DevCardModal';
import Resources from "@/components/Resources";
import BuildButton from "@/components/BuildButton";

export default {

  name: "Game",
  components: {BuildButton, ChatWindow, UserList, GameBoard, Resources, DevCardModal},
  data(){
    return{
      devModal: false
    }
  },
  mounted: function () {
  },
  methods: {
    startBuild(type) {
      this.$refs.gameBoard.startBuild(type);
    }
  }
}
</script>

<style scoped>
#game-container {
  display: flex;
  flex-direction: row;
}

#board-container {
  flex-grow: 1;
  height: 100vh;
  overflow: hidden;
  background-color: #1b75bb;
  background-image: url("data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%237abbdf' fill-opacity='0.61'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

#sidebar-container {
  display: flex;
  flex-direction: column;
  flex: 0 0 340px;
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
