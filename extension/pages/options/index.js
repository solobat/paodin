/**
 * @file options
 * @author solopea@gmail.com
 */

import Vue from 'vue'
import _ from 'underscore'
import Antd, { FormModel } from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
import store, { initStore } from '../../store'
import { getSyncConfig, getUserInfo } from '@/js/common/config'
import App from './App.vue'
import router from '@/pages/options/router'
import { getI18nTexts } from '@/js/helper/i18n.helper';
import '@/services/base'
import i18n from 'vue-plugin-webextension-i18n'

Vue.use(i18n)
Vue.use(Antd);
Vue.use(FormModel);
Vue.config.productionTip = false

function init() {
    initStore()

    Promise.all([
        getSyncConfig(),
        getUserInfo()
    ]).then(([config, userInfo]) => {
        render(config, userInfo);
    });
}

function render(config, userInfo) {
    const app = new Vue({
        el: '#app',
        store,
        data: {
          config,
          userInfo,
        },
        router,
        components: { App },
        template: '<App :config="config" :userInfo="userInfo" />'
      });
}

init();