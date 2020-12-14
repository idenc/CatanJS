<template>
  <div>
    <div id="main-chat">
      <div
        id="chat-log"
        ref="message_box"
      >
        <ul id="message_box">
          <template v-for="msg in chat_messages">
            <li
              v-if="msg.user"
              :key="msg.id"
            >
              {{ new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) }} <span
                :style="{'color': msg.colour, 'font-weight': 'bold'}"
              >{{ msg.user }}:</span> {{
                msg.message
              }}
            </li>
            <li
              v-else
              :key="msg.id"
              :style="{'color': msg.colour}"
            >
              {{ msg.message }}
            </li>
          </template>
        </ul>
      </div>

      <form @submit.prevent="sendMessage">
        <InputBox
          id="input-box"
          v-model="message"
          :placeholder="'Message'"
        />
      </form>
    </div>
  </div>
</template>

<script>
"use strict";
import InputBox from "@/components/chat/InputBox";

export default {
  name: 'ChatWindow',
  components: {InputBox},
  props: {
    username: String('')
  },
  data() {
    return {
      message: '',
      users: [],
      colour: '',
      chat_messages: [],
      mute_list: [],
    }
  },
  mounted: function () {
    this.$socket.emit("get_chat_info");
    
    this.sockets.subscribe('mute player', (user) => {
      // console.log(user.username);
      // console.log(this.username);
      // console.log(this.username === user.username);
      if (this.mute_list.includes(user.username)) {
        if (this.username === user.username) {
          this.muteAlert(user, false);
        }
        this.mute_list = this.mute_list.filter(u => u !== user.username);
      } else {

        if (this.username === user.username) {
          this.muteAlert(user, true);
        }
        this.mute_list.push(user.username);
      }

    });
  },
  methods: {
    sendMessage() {
      if (this.message === '') {
        return;
      }
      this.$socket.emit('chat_message', this.message);
      this.message = '';
    },
    muteAlert(user, check) {
      let docStr = '';
      let msgStr = '';
      if (check) {
        msgStr = user.username + " has been muted!";

        docStr = "#overlayin.mute";
      } else {
        msgStr = user.username + " has been unmuted!";
        docStr = "#overlayin.unmute";
      }
      console.log(this.$socket);
      this.$socket.emit('alert_message', msgStr);

      document.querySelector("#overlay.main").classList.add("active");
      document.querySelector(docStr).classList.add("active");
      document.querySelector("#overlay.main").addEventListener("click", () => {
        document.querySelector("#overlay.main").classList.remove("active");
        document.querySelector(docStr).classList.remove("active");
      });

    }
  },
  sockets: {
    chat_message: function (msg) {
      // if (!this.mute_list.includes(this.username)) {
      //   this.$socket.emit('chat message', this.message);
      //   this.chat_messages.push(msg);
        
      // }
      // else {
      //   document.querySelector("#overlayin.mute").classList.add("active");
      //   document.querySelector("#overlay.main").addEventListener("click", () => {
      //     document.querySelector("#overlay.main").classList.remove("active");
      //     document.querySelector("#overlayin.mute").classList.remove("active");
      //   });
      // }

      this.$socket.emit('chat message', this.message);
      this.chat_messages.push(msg);
      const messageBox = this.$refs.message_box;
      

      this.$nextTick(() => {
        messageBox.scrollTop = messageBox.scrollHeight;
      });
    },
    user_info: function (user) {
      this.colour = user.colour;
      this.chat_messages.push({message: `You are ${user.username}`, id: 'username message'})
    },
    chat_info: function (info) {
      console.log(`chat info: ${info}`)
      this.chat_messages.push(...info.messages);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
ul {
  list-style-type: none;
  margin: 0;
  padding: 10px;
  text-align: left;
}

#chat-log ul {
  position: absolute;
  padding: 0 10px;
  bottom: 0;
  max-height: calc(100% - 20px);
  color: #d7d5d5;
}

#chat-log ul > :last-child {
  margin-bottom: 10px;
}

#main-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
}

#chat-log {
  background: #12223b;
  position: relative;
  flex: 1;
  overflow-y: auto;
}

form {
  grid-area: s;
  display: flex;
}

#input-box {
  overflow: hidden;
  display: flex;
  flex: 1;
}

@media (max-height: 768px) {
  #message_box {
    font-size: 0.75rem;
  }
}
</style>
