import { createApp } from 'vue'
import App from './App.vue'
import { setupRouter } from './router'
import 'vxe-table/lib/style.css'
import './styles'
import { setupGlobalComponent } from '@/layouts'
import { setupPinia } from '@/store/pinia'
import setupRouterGuard from './router/guard'
import initPlugins from '@/utils/init/initPlugins'
import initGlobalProperties from '@/utils/init/initGlobalProperties'
import initI18n from '@/locale'
import directive from '@/directive'
// svg icon
import 'virtual:svg-icons-register'

function setup() {
  const app = createApp(App)
  setupPinia(app)
  setupRouter(app)
  setupRouterGuard()
  setupGlobalComponent(app)
  initI18n(app)
  initPlugins(app)
  initGlobalProperties(app)
  directive(app)
  app.mount('#app')
}

// 启动项目
setup()
