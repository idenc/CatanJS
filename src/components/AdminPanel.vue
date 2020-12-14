<template>
  <div class="container">
    <div class="input-group mb-3">
      <input
        v-model="searchQuery"
        type="text"
        class="form-control"
        placeholder="Search by name..."
      >
    </div>

    <div class="container overflow-auto">
      <div
        v-for="player in players"
        :key="player.email"
      >
        <div 
          class="card bg-success text-white mb-3"
          :class="{ 'bg-danger' : player.isAdmin }"
        >
          <h6 class="card-header">
            {{ player.name }}
          </h6>
          <div class="card-body">
            <h6>{{ player.email }}</h6>            
            <button
              v-if="!player.isAdmin"
              class="btn btn-secondary rounded-pill mr-1"
              @click="makeAdmin(player.email);"
            >
              Adminify
            </button>
            <button
              v-if="player.isAdmin"
              class="btn btn-secondary rounded-pill mr-1"
              @click="demoteAdmin(player.email);"
            >
              Demote
            </button>
            <button
              class="btn btn-primary rounded-pill ml-1"
              @click="deleteUser(player.email);"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "AdminPanel",
  data() {
    return {
      masterPlayers : {
        
      },
      players : {
        
      },
      searchQuery : ""
    }
  },
  watch: {
    searchQuery: function() {
      this.players = [];
      for (let i = 0; i < this.masterPlayers.length; i++) {
        const key = this.searchQuery.toLowerCase();
        const name = this.masterPlayers[i].name.toLowerCase();
        if (name.startsWith(key)) {
          this.players.push(this.masterPlayers[i]);
        }
      }
    }
  },
  created() {
    this.refreshAdmin();
  },
  methods: {
    makeAdmin(post_email) {
      axios.post("/make_admin", 
        { email: post_email },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
      ).then(() => this.refreshAdmin());
    },
    demoteAdmin(post_email) {
      axios.post("/demote_admin", 
        { email: post_email },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
      ).then(() => this.refreshAdmin());
    },
    deleteUser(post_email) {
      axios.post("/delete_user", 
        { email: post_email },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
      ).then(() => this.refreshAdmin());
    },
    refreshAdmin() {
      const temp = this.searchQuery;
      this.searchQuery = "";

      axios.get("/user_list")
        .then((response) => {
          this.masterPlayers = response.data;
          this.players = response.data;
          this.searchQuery = temp;
          this.sortList();
        });
    },
    sortList() {
      this.players.sort((a, b) => {
        if (a.isAdmin)
          return -1;
        if (b.isAdmin)
          return 1;
        return 0;
      });
    }
  }
}

</script>