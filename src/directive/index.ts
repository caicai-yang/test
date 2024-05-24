import type { App } from 'vue'
import { enterDirective } from './enter'
import { permissionDirective } from './permission'
import loading from './loading'

export default function (app: App) {
  app.directive('enter', enterDirective)
  app.directive('permission', permissionDirective)
  app.directive('loading', loading)
}
