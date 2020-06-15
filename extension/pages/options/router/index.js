import Vue from 'vue'
import VueRouter from 'vue-router'
import General from '@/pages/options/views/General.vue'
import Login from '@/pages/options/views/Login.vue'
import Help from '@/pages/options/views/Help.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'General',
    component: General,
    meta: {
    }
  },
  {
    path: '/help',
    name: 'Help',
    component: Help,
    meta: {
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
    }
  },
  { path: '*', redirect: '/' }
]

const router = new VueRouter({
  mode: 'hash',
  routes
})

export default router
