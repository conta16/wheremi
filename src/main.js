import Vue from 'vue'
//import VueSlideoutPanel from 'vue2-slideout-panel';

import App from './App.vue'

import Vuesax from 'vuesax'

import 'vuesax/dist/vuesax.css'
import 'material-icons/iconfont/material-icons.css'

//Vue.use(VueSlideoutPanel)
Vue.use(Vuesax, {
  // options here
})
//window.vue2PanelDebug = true

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')