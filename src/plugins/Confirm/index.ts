import { createVNode, render } from 'vue'
import ConfirmComponent from './Confirm.vue'
import type { ModalConfig } from '@arco-design/web-vue'

/**
 * 组件使用
 * 参数与Modal参数一致
 * 增加type参数，可自定提示内容左侧icon的样式（success，info，warning，error），默认为warning
 *
 * 组件已注入全局
 *
 * 使用示例：
 * proxy.$confirm({
 *  title: '提示'
 *  content: '是否确认删除？'
 *  type: 'warning',
 *  onOk: () => {},
 *  onCancel: () => {}
 * })
 *
 * 或者在组件中单独引入($+大写开头 区分普通函数)
 * import $Confirm from '@/plugins/Confirm'
 * $Confirm({
 *  title: '提示'
 *  content: '是否确认删除？'
 *  type: 'warning',
 *  onOk: () => {},
 *  onCancel: () => {}
 * })
 */

interface DefaultOptions extends ModalConfig {
  type?: String
}

const defaultsOptions = {
  title: '提示',
  okText: '确定',
  cancelText: '取消',
  titleAlign: 'start',
  maskClosable: false,
  width: '400px'
}

export default function (options: DefaultOptions) {
  options = Object.assign({}, defaultsOptions, options)
  const container = document.createElement('div')
  document.body.appendChild(container)
  // 确认
  const onConfirm = () => {
    render(null, container)
    document.body.removeChild(container)
    options && options.onOk && options.onOk()
  }
  // 取消
  const onCancel = () => {
    render(null, container)
    document.body.removeChild(container)
    options && options.onCancel && options.onCancel()
  }

  const vNode = createVNode(ConfirmComponent, {
    ...options,
    visible: true,
    onCancel,
    onConfirm
  })

  render(vNode, container)
}
