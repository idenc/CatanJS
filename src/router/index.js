import Vue from 'vue'
import VueRouter from 'vue-router'
import Register from "@/views/Register";
import Login from "@/views/Login";
import Game from "@/views/Game";
import Lobby from "@/views/Lobby";

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'Login',
        component: Login,
        props: true
    },
    {
        path: '/register',
        name: 'Register',
        component: Register
    },
    {
        path: '/game',
        name: 'Game',
        component: Game,
        props: true
    },
    {
        path: '/lobby',
        name: 'Lobby',
        component: Lobby,
    },
]

const router = new VueRouter({
    routes
})

export default router
