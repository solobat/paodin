import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App.vue'
import { checkDB } from '@/server/db'

Vue.use(ElementUI)

let vm;

function initApp({ word, surroundings, source, host, engine, pos, from, to }) {
    checkDB()
    vm = new Vue({
        el: '#app',
        data: {
            meta: {
                word, surroundings, source, host, engine, pos, from, to
            }
        },
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