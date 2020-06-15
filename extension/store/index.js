import Vue from 'vue'
import Vuex from 'vuex'
import { account, initAccount } from '@/store/account.module';

Vue.use(Vuex)

export function initStore() {
  initAccount()
}

export default new Vuex.Store({
  modules: {
    account
  }
})
