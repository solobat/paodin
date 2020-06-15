import Vue from 'vue'
import Antd, { FormModel } from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
import store, { initStore } from '../../store'
import App from './App.vue'
import i18n from 'vue-plugin-webextension-i18n'
import '@/services/base'

Vue.use(i18n)
Vue.use(Antd);
Vue.use(FormModel);
Vue.config.productionTip = false

let vm;

function initApp({ word, surroundings, source, host, engine, pos, from, to }) {
    initStore()

    vm = new Vue({
        el: '#app',
        data: {
            meta: {
                word, surroundings, source, host, engine, pos, from, to
            }
        },
        store,
        components: { App },
        template: '<App :meta="meta"/>'
    });
}

function render(data, parent) {
    window.parentWin = parent;
    if (!vm) {
        initApp(data);
    } else {
        vm.meta = data
    }
}

window.addEventListener('message', function(event) {
    if (event.data) {
        render(event.data, event.source);
    }
});

if (window.location.href.indexOf('tab') !== -1) {
    render({
        word: 'god',
        surroundings: 'god damn',
        source: '',
        host: '',
        engine: 'google',
        pos: '',
        from: 'en',
        to: 'zh-CN'
    }, window)
}