import { App } from 'vue'
import VueDOMPurifyHTML from 'vue-dompurify-html'
import VXETable from 'vxe-table'
import VXETablePluginExportXLSX from 'vxe-table-plugin-export-xlsx'

// 加载公用插件
export default function (app: App) {
  VXETable.use(VXETablePluginExportXLSX)
  app.use(VueDOMPurifyHTML)
  app.use(VXETable) // 保证 exportData 方法可用
}
