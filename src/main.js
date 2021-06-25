import { createApp } from 'vue'
import App from './App.vue'
import store from './store'

//Vue.use(store) 插件用法，默认调用store中的install方法
createApp(App).use(store).mount('#app')
