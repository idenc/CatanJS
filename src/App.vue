<template>
  <div id="app">
    <router-view />
    <div class="overlay"> Please Rotate Screen to Landscape</div>
  </div>
</template>

<style>
@import './assets/styles/bootstrap.min.css';
@import '../node_modules/bootstrap-vue/dist/bootstrap-vue.css';
@import '../node_modules/@fortawesome/fontawesome-free/css/all.css';

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

.overlay {
  z-index: 2;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background: #1b75bb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  opacity: 0;
  font-size: large;
  display: none;
}

@media (max-width: 576px) {
  .overlay {
    opacity: 1;
    display: flex;
  }
}
</style>
