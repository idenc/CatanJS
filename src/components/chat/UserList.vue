<template>
  <div id="user-div">
    <ul id="user-list">
      <template v-for="user in users">
        <li
          v-if="user.username === username"
          :key="user.username"
          :style="{'color': user.color}"
        >
          <b>{{ user.username }} (you)</b>
        </li>
        <li
          v-else
          :key="user.username"
          :style="{'color': user.color}"
        >
          {{ user.username }}
        </li>
      </template>
    </ul>
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
      this.users.push(user);
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

</style>
