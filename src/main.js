import Vue from 'vue'
import iView from 'iview'
import 'iview/dist/styles/iview.css'
import VueRouter from 'vue-router'
import App from './js/view/app.vue'
import router from './js/service/router'
import './js/module'
import component from './js/component'
import mixin from '../src/js/service/mixin'

Vue.config.productionTip = false

Vue.use(iView)
Vue.use(VueRouter)
Vue.use(component)
Vue.mixin(mixin);

new Vue({
    router,
    render: (h) => h(App)
}).$mount('#app')
