import { App } from 'vue'
import Confirm from '@/plugins/Confirm'

// 加载公用方法
export default function (app: App) {
  app.config.globalProperties.$confirm = Confirm
}
