import { createApp, Directive } from 'vue'
import Loading from './index.vue'

const loading: Directive = {
  mounted(el, binding) {
    const app = createApp(Loading)
    const instance = app.mount(document.createElement('div'))
    el.instance = instance
    el.style.position = 'relative'

    // loading提示语
    const loadingText = binding.arg
    if (typeof loadingText !== 'undefined') {
      ;(instance as any).setLoadingText(loadingText)
    }

    if (binding.value) {
      appendEl(el)
    }
  },
  updated(el, binding) {
    // loading提示语
    const loadingText = binding.arg
    if (typeof loadingText !== 'undefined') {
      el.instance.setLoadingText(loadingText)
    }

    if (binding.value !== binding.oldValue) {
      binding.value ? appendEl(el) : removeEl(el)
    }
  }
}

const appendEl = (el: { appendChild: (arg0: any) => void; instance: { $el: any } }) => {
  el.appendChild(el.instance.$el)
}

const removeEl = (el: { removeChild: (arg0: any) => void; instance: { $el: any } }) => {
  el.removeChild(el.instance.$el)
}

export default loading
