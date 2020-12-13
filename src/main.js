import Vue from 'vue'
import App from './App.vue'
import router from './router'
import VueSocketIO from "vue-socket.io";
import io from 'socket.io-client';
import { BootstrapVue } from 'bootstrap-vue'

Vue.use(new VueSocketIO({
    debug: true,
    connection: io('http://localhost:9999', {
        reconnectionDelay: 1000,
        reconnection: true,
        reconnectionAttemps: 10,
        transports: ['websocket'],
        agent: false,
        upgrade: false,
        rejectUnauthorized: false
    })
}));

Vue.use(BootstrapVue);

Vue.config.productionTip = false

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')
