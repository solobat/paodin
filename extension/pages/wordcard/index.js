import Vue from 'vue'
import App from './App.vue';
import '../../css/base.css'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import { checkDB } from '@/server/db'

Vue.use(ElementUI)

function render() {
    const app = new Vue({
        el: '#app',
        data: {
        },
        components: { App },
        template: '<App />'
    });
}

checkDB();
render();