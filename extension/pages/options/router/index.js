import Vue from 'vue'
import VueRouter from 'vue-router'
import General from '@/pages/options/views/General.vue'
import Sentences from '@/pages/options/views/Sentences.vue'
import Words from '@/pages/options/views/Words.vue'
import WordsRecite from '@/pages/options/views/WordsRecite.vue'
import WordRoots from '@/pages/options/views/WordRoots.vue'
import Advanced from '@/pages/options/views/Advanced.vue'
import Help from '@/pages/options/views/Help.vue'
import Update from '@/pages/options/views/Update.vue'

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
    path: '/sentences',
    name: 'Sentences',
    component: Sentences,
    meta: {
    }
  },
  {
    path: '/words',
    name: 'Words',
    component: Words,
    meta: {
    }
  },
  {
    path: '/wordsrecite',
    name: 'WordsRecite',
    component: WordsRecite,
    meta: {
    }
  },
  {
    path: '/wordroots',
    name: 'WordRoots',
    component: WordRoots,
    meta: {
    }
  },
  {
    path: '/advanced',
    name: 'Advanced',
    component: Advanced,
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
    path: '/update',
    name: 'Update',
    component: Update,
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
