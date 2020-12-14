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
    }
  },
  mounted: function () {
    this.$socket.emit("get_chat_info");
  },
  methods: {
    sendMessage() {
      if (this.message === '') {
        return;
      }
      this.$socket.emit('chat_message', this.message);
      this.message = '';
      console.log("ChatWindow.vue : sendMessage()")
    }
  },
  sockets: {
    chat_message: function (msg) {
      const messageBox = this.$refs.message_box;
      this.chat_messages.push(msg);

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
