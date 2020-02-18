import Vue from 'vue'
import 'normalize.css'
import ElementUI from 'element-ui'
import App from './App.vue'
import router from './routes'
import store from './store/index'
// import RongRTC from '@u/RongRTC-3.1.2.js'   //融云

import beforeCreate from './config/beforeCreate'
import created from './config/created'
import themeColors from './styles/global.scss'
import './styles/el-theme.scss'

Vue.config.productionTip = false

Vue.use(ElementUI)

// 全局变量
Vue.prototype.$bus = new Vue()    // 主要用于绑定自定义事件及触发相应事件
Vue.prototype.$colors = themeColors // 主题色，这是一个对象，包含了在styles/global.scss中导出的颜色值

require('./config/methods')
require('./config/directives')
require('./config/filters')
require('./config/api')
// require('./config/RongRTC-3.1.2')

new Vue({
    router,
    store,
    beforeCreate, created,
    render: h => h(App)
}).$mount('#app')
