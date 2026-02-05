import { createApp } from 'vue'
import './style.css'
import 'highlight.js/styles/github.css' // 引入 highlight.js 样式
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')
