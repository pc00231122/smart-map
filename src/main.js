import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 全局样式
import './styles/main.scss'

// 创建应用实例
const app = createApp(App)

// 安装Pinia
const pinia = createPinia()
app.use(pinia)

// 安装路由
app.use(router)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 挂载应用
app.mount('#app')

// 注册Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker注册成功:', registration.scope)
      })
      .catch(error => {
        console.log('ServiceWorker注册失败:', error)
      })
  })
}