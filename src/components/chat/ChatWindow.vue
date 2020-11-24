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
                :style="{'color': msg.color, 'font-weight': 'bold'}"
              >{{ msg.user }}:</span> {{
                msg.message
              }}
            </li>
            <li
              v-else
              :key="msg.id"
              :style="{'color': msg.color}"
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
  data() {
    return {
      message: '',
      username: '',
      users: [],
      color: '',
      chat_messages: [],
    }
  },
  mounted: function () {
    this.sockets.subscribe('connect', () => {
      if (localStorage.username && localStorage.color) {
        this.username = localStorage.username;
        this.color = localStorage.color;
        const user = {username: this.username, color: this.color}
        this.$socket.emit('user info', user);
      } else {
        console.log("emitting user")
        this.$socket.emit('user info', null);
      }
    });

    this.sockets.subscribe('chat message', (msg) => {
      const messageBox = this.$refs.message_box;
      this.chat_messages.push(msg);

      this.$nextTick(() => {
        messageBox.scrollTop = messageBox.scrollHeight;
      });
    });

    this.sockets.subscribe('user info', (user) => {
      localStorage.username = user.username;
      localStorage.color = user.color;
      this.username = user.username;
      this.color = user.color;
      this.chat_messages.push({message: `You are ${user.username}`, id: 'username message'})
    })

    // Server sends the chat history and user list
    this.sockets.subscribe('chat info', (info) => {
      console.log(`chat info: ${info}`)
      this.chat_messages.push(...info.messages);
    });

    this.sockets.subscribe('command error', (err) => {
      err.color = 'red';
      this.chat_messages.push(err);
    });

    this.sockets.subscribe('color change', (color_info) => {
      for (let i = 0; i < this.chat_messages.length; i++) {
        if (this.chat_messages[i].user === color_info.username) {
          this.chat_messages[i].color = color_info.new_color;
        }
      }
    });

    this.sockets.subscribe('user changed', (info) => {
      for (let i = 0; i < this.chat_messages.length; i++) {
        if (this.chat_messages[i].user === info.old_name) {
          this.chat_messages[i].user = info.new_name;
        }
      }
    });

  },
  methods: {
    sendMessage() {
      if (this.message === '') {
        return;
      }
      this.$socket.emit('chat message', this.message);
      this.message = '';
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
</style>
