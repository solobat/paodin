/**
 * @file popup.js
 * @author solopea@gmail.com
 */

import Vue from 'vue'
import App from './App.vue'
import i18n from 'vue-plugin-webextension-i18n'

Vue.use(i18n)

new Vue({
    el: '#app',
    components: { App },
    template: '<App />'
});