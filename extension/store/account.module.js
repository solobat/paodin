import { userService } from '../services/user.service';
import AV from 'leancloud-storage';

let state = {
  status: {},
  uid: 0,
  user: null,
}

export function initAccount() {
  const user = AV.User.current()

  if (user) {
    Object.assign(state, { status: { loggedIn: true }, user: user.attributes, uid: user.id })
  } else {
    Object.assign(state, { status: {}, user: null, })
  }
}

const actions = {
  login({ commit }, { username, password }) {
    return userService.login(username, password)
      .then(() => {
          commit('loginSuccess', AV.User.current());
        },
        error => {
          commit('loginFailure', error);
          return Promise.reject(error);
        }
      );
  },
  logout({ commit }) {
    return userService.logout().then(() => {
      commit('logout');
    })
  },
  doWithLogin({ state }, callback) {
    if (state.status.loggedIn) {
      callback()
    } else {
      console.log('go login');
    }
  },
  updateUser({ commit }, user) {
    commit('loginSuccess', user);
  }
};

const mutations = {
  loginRequest(state, user) {
    state.status = { loggingIn: true };
    state.user = user;
  },
  loginSuccess(state, user) {
    state.status = { loggedIn: true };
    state.uid = user.id;
    state.user = user.attributes;
  },
  loginFailure(state) {
    state.status = {};
    state.user = null;
    state.uid = 0;
  },
  logout(state) {
    state.status = {};
    state.user = null;
    state.uid = 0;
  },
};
const getters = {
  uid(state) {
    if (state.status.loggedIn) {
      return state.uid
    } else {
      return;
    }
  },
  loggedIn(state) {
    return state.status.loggedIn
  },
  user(state) {
    return state.user
  }
}

export const account = {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
};