import Vue from 'vue'
import VueSlideoutPanel from 'vue2-slideout-panel';

import App from './App.vue'

Vue.use(VueSlideoutPanel)
window.vue2PanelDebug = true

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')