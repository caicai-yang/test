import { Directive, DirectiveBinding } from 'vue'
import { hasPermission } from '@/utils'

/**
 * v-permission = "AdminSysOrgCreate"
 * v-permission = ['AdminSysOrgCreate', 'AdminSysOrgFind']
 */
export const permissionDirective: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
    const { value } = binding
    const result = hasPermission(value)
    if (result === false) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  }
}
