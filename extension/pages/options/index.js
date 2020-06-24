/**
 * @file options
 * @author solopea@gmail.com
 */

import Vue from 'vue'
import ElementUI from 'element-ui'
import _ from 'underscore'
import 'element-ui/lib/theme-chalk/index.css'
import { getSyncConfig, getUserInfo } from '@/js/common/config'
import SocialSharing  from 'vue-social-sharing'
import App from './App.vue'
import router from '@/pages/options/router'
import i18n from 'vue-plugin-webextension-i18n'
import '@/services/base'
import { getUser } from '@/services/user.service'
import { checkDB } from '@/server/db'

Vue.use(i18n)
Vue.use(SocialSharing);
Vue.use(ElementUI)

const chrome = window.chrome;

function init() {
    Promise.all([
        getSyncConfig(),
        getUserInfo(),
        checkDB()
    ]).then(([config, userInfo]) => {
        let i18nTexts = getI18nTexts();

        render(config, userInfo, i18nTexts);
    });
}

function getI18nTexts(obj) {
    let texts = {};

    try {
        for (let cate in obj) {
            let subobj = texts[cate] = {};

            for (var key in obj[cate]) {
                subobj[key] = chrome.i18n.getMessage(`${cate}_${key}`);
            }
        }
    } catch (e) {
        console.log(e);
    }

    return texts;
}

function render(config, userInfo, i18nTexts) {
    const user = getUser()
    const app = new Vue({
        el: '#app',
        data: {
          config,
          userInfo,
          i18nTexts,
          user: user ? user.toJSON() : null
        },
        router,
        components: { App },
        template: '<App :config="config" :userInfo="userInfo" :i18nTexts="i18nTexts" :user="user" />'
      });
}

init();