import 'babel-polyfill'
import Vue from 'vue'
import App from './App.vue'

import audio from './modules/audio'

Vue.prototype.$audio = audio

Vue.config.productionTip = false

new Vue({
    render: h => h(App)
}).$mount('#app')
