import Vue from 'vue'
import App from './App.vue'
import router from './router'
import VueSocketIO from "vue-socket.io";
import io from 'socket.io-client';
import GSignInButton from 'vue-google-signin-button';

Vue.use(new VueSocketIO({
    debug: true,
    connection: io(),
}));

Vue.use(GSignInButton);

Vue.config.productionTip = false

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')
