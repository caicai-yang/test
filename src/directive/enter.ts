import { Directive, DirectiveBinding, VNode } from 'vue'

// 仅数字
const numberReg = /\d+/g
// 中英文
const wordReg = /[\u4e00-\u9fa5a-zA-Z]+/g

type ElType = HTMLElement & {
  _input?: any
  _compositionstart?: any
  _compositionend?: any
  [key: string]: any
}

type IVNode = VNode & { ctx?: any }

export const enterDirective: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding, vnode: IVNode) {
    const inputDom: ElType = el.tagName === 'INPUT' ? el : el.querySelector('input')!
    // arg 限制输入长度, modifier: number | word 限制输入格式, value: 自定义正则
    const { arg, modifiers, value } = binding
    const maxLength = vnode?.ctx?.props?.maxLength || +(arg ?? 0)

    if (!inputDom) {
      return
    }

    let reg: RegExp
    let flag = true

    if (value) {
      reg = new RegExp(value, 'g')
    } else if (modifiers.number) {
      reg = numberReg
    } else if (modifiers.word) {
      reg = wordReg
    }

    const inputEvent = document.createEvent('Event')
    inputEvent.initEvent('input', false, false)

    // 开始输入中文事件
    inputDom._compositionstart = function () {
      flag = false
    }
    // 结束输入中文: compositionend 事件会比 input 时间晚一步触发, 结束时需手动触发一次 input 事件
    inputDom._compositionend = function () {
      flag = true
      inputDom.dispatchEvent(inputEvent)
    }

    inputDom.addEventListener('compositionstart', inputDom._compositionstart)
    inputDom.addEventListener('compositionend', inputDom._compositionend)

    inputDom._input = function () {
      if (!flag) {
        return
      }

      this.value = this.value.match(reg) ? this.value.match(reg)[0] : ''

      if (maxLength) {
        this.value = this.value.slice(0, maxLength)
      }

      if (modifiers.upper) {
        this.value = this.value.toUpperCase()
      }

      // 手动触发双向绑定解决元素失焦后数据变动问题
      vnode?.ctx?.emit('update:modelValue', this.value)
      vnode?.ctx?.emit('input', this.value)
    }

    inputDom.addEventListener('input', inputDom._input)
  },

  // 卸载
  unmounted(el: HTMLElement) {
    const inputDom: ElType = el.tagName === 'INPUT' ? el : el.querySelector('input')!
    if (!inputDom) {
      return
    }
    inputDom.removeEventListener('input', inputDom._input)
    delete inputDom._input
    if (inputDom._compositionstart) {
      inputDom.removeEventListener('compositionstart', inputDom._compositionstart)
      delete inputDom.compositionstart
    }
    if (inputDom._compositionend) {
      inputDom.removeEventListener('compositionend', inputDom._compositionend)
      delete inputDom._compositionend
    }
  }
}
