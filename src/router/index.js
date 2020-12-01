import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Register from "@/views/Register";
import Login from "@/views/Login";
import Dashboard from "@/views/Dashboard";
import Game from "@/views/Game";
import Lobby from "@/views/Lobby";

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/register',
        name: 'Register',
        component: Register
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
        props: true
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: Dashboard
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
