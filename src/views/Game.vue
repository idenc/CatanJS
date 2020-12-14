<template>
  <div
    v-if="showPage"
    id="game-container"
  >
    <div id="board-container">
      <DevCardModal
        v-if="devModal === true"
        :player="player"
      />
      <div
        id="leave-button"
        ref="leaveButton"
        class="dice-button btn btn-primary btn-block"
        @click="handleLeaveGame()"
      >
        EXIT
      </div>
      <GameBoard
        ref="gameBoard"
        :turn-number="turnNumber"
        @updatePlayer="updatePlayer"
        @displayEndTurnBtn="displayEndTurnBtn"
        @updateTurnNumber="updateTurnNumber"
        @updateRobberEvent="updateRobberEvent"
        @updateRoadBuildingEvent="updateRoadBuildingEvent"
      />
      <b-toast
        id="game-toast"
        class="align-self-start"
        title="BootstrapVue"
        auto-hide-delay="5000"
        static
      >
        <template #toast-title>
          <strong class="mr-2"> {{ toastTitle }} </strong>
        </template>
        {{ toastMessage }}
      </b-toast>
      <DiceButton
        :has-rolled="player.hasRolled"
        :turn-number="turnNumber"
        :is-turn="player.isTurn"
        :robber-event="robberEvent"
        :road-event="roadEvent"
        @rollDice="rollDice"
        @endTurn="endTurn"
      />
      <div
        id="building-info"
        ref="buildingInfo"
        class="dice-button btn btn-primary btn-block disabled"
      >
        <div>
          Roads - {{ player.numRoads }}
        </div>
        <div>
          Settlements - {{ player.numSettlements }}
        </div>
        <div>
          Cities - {{ player.numCities }}
        </div>
      </div>
      <Overlay
        ref="overlay"
        :username="player.name"
        :users="users"
      />
    </div>
    <div id="sidebar-container">
      <div id="sidebar-players-container">
        <UserList
          id="user-list"
          :player="player"
          :users-prop="users"
          @updateUsers="updateUserList"
        />
      </div>
      <div id="sidebar-chat-container">
        <ChatWindow
          id="chat"
          :username="player.name"
        />
      </div>
      <div id="sidebar-buttons-container">
        <BuildButton
          id="build-button"
          ref="buildButton"
          class="button-component btn btn-primary btn-block sidebar-main-button"
          :is-turn="player.isTurn"
          @buildStarted="startBuild"
        />
        <button
          id="tradeButton"
          class="btn btn-primary btn-block sidebar-main-button"
          @click="attemptTrade"
        >
          Trade
        </button>
        <button
          class="btn btn-primary btn-block sidebar-main-button"
          @click="devModal=!devModal"
        >
          Dev Cards
        </button>
      </div>
      <div id="sidebar-resources-container">
        <Resources :player="player" />
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
import Overlay from "@/components/Overlay";


import BuildButton from "@/components/BuildButton";
import DiceButton from "@/components/DiceButton";
import ResizeText from 'vue-resize-text';
import {maxBuildings} from "@/assets/js/constants";
import axios from "axios";
import {BToast} from 'bootstrap-vue'

export default {

  name: "Game",
  components: {DiceButton, BuildButton, ChatWindow, UserList, GameBoard, Resources, DevCardModal, Overlay, BToast},
  directives: {
    ResizeText
  },
  data() {
    return {
      devModal: false,
      turnNumber: 0,
      player: {
        name: '',
        brick: 0,
        ore: 0,
        wool: 0,
        grain: 0,
        lumber: 0,
        numSettlements: maxBuildings.settlements,
        numRoads: maxBuildings.roads,
        numCities: maxBuildings.cities,
        colour: '',
        isTurn: false,
      },
      robberEvent: false,
      showPage: false,
      users: [],
      roadEvent: false,
      toastTitle: 'Put toast title here',
      toastMessage: 'Put toast message here',
    }
  },
  mounted: function () {
    axios.get("/user")
        .then((response) => {
          this.showPage = true;
          this.$nextTick(() => {
            this.passUsername(response.data.user.name);
          })
        })
        .catch((error) => {
          console.log(error)
          console.log(error.response);
          this.$router.push({
            name: 'Login',
            params: {statusMessage: error.response.data, alertType: 'alert-danger'}
          });
        });

  },
  sockets: {
    ready_to_leave: function () {
      this.$router.push({name: 'Lobby'});
    },
    dice_result: function (result) {
      if (result.diceRoll === 7 && this.player.isTurn) {
        this.toastTitle = "Rolled";
        this.toastMessage = `${result.diceRoll}: Click on a tile to move the robber`;
        this.$bvToast.show('game-toast');
      } else {
        this.toastTitle = "Rolled";
        this.toastMessage = result.diceRoll;
        this.$bvToast.show('game-toast');
      }
    }
  },
  methods: {
    startBuild(type) {
      this.$refs.gameBoard.startBuild(type);
    },
    rollDice() {
      this.$socket.emit('roll_dice');
    },
    passUsername(username) {
      this.$refs.gameBoard.setUsername(username);
    },
    updatePlayer(newPlayer) {
      this.player = newPlayer;
    },
    updateTurnNumber(newTurnNumber) {
      this.turnNumber = newTurnNumber;
    },
    displayEndTurnBtn() {
      console.log('displaying end turn');
      this.player.hasRolled = true;
    },
    endTurn() {
      this.turnNumber++;
      this.$refs.buildButton.closeBuildButton();
      console.log('emitting end turn');
      this.$socket.emit('end_turn');
    },
    updateRobberEvent(eventUpdate) {
      this.robberEvent = eventUpdate;
      console.log(`Updating Robber Event in Game.vue  ${this.robberEvent}`);
    },
    attemptTrade() {
      this.$refs.overlay.attemptTrade();
    },
    updateUserList(newUserList) {
      console.log('updating game user list');
      this.users = newUserList;
    },

    updateRoadBuildingEvent(eventUpdate) {
      this.roadEvent = eventUpdate;
    },

    handleLeaveGame() {
      this.$socket.emit('leave_game');
      this.$socket.emit('lobby_leave_game');
    }
  },


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
  flex-grow: 1;
  height: 100vh;
  overflow: hidden;
  background-color: #1b75bb;
  background-image: url("data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%237abbdf' fill-opacity='0.61'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  position: relative;
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

#sidebar-buttons-container button,
#sidebar-buttons-container .button-component {
  width: 30%
}

::v-deep .sidebar-main-button {
  margin: 0;
  padding: 0.5rem 1rem;
}

#build-button {
  padding: 0;
}

#sidebar-resources-container {
  background: rgb(44, 44, 44);
  /* flex-grow: 1; */
}

#user-list, #chat {
  height: 100%;
  width: 100%;
}

@media (max-height: 600px) {
  ::v-deep .sidebar-main-button {
    margin: 0;
    padding: 0.25rem 0.25rem;
    height: 2rem;
    font-size: 0.5rem;
  }

  #sidebar-container {
    padding: 0.5rem;
  }

  #sidebar-buttons-container {
    margin-bottom: 0.5rem;
  }

  #sidebar-chat-container {
    margin-bottom: 0.5rem;
  }

  #sidebar-players-container {
    margin-bottom: 0.5rem;
  }

  #building-info {
    padding: 2px;
    /* width: 15% !important; */
  }
}

#building-info {
  margin: auto;
  position: absolute;
  left: 0;
  bottom: 0;
  width: fit-content;
}

@media (max-width: 768px) {
  #building-info {
    font-size: 0.5rem;
    padding: 6px;
  }

  #leave-button {
    font-size: 0.5rem;
  }
}

#leave-button {
  margin: auto;
  position: absolute;
  left: 0;
  top: 0;
  width: fit-content;
}

.overlay {
  z-index: 2;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background: #394954;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  opacity: 0.9;
}

#game-toast__toast_outer {
  margin: auto;
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
}

</style>
