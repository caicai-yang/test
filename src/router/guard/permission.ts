import usePermissionStore from '@/store/modules/permission'
import initDictionary from '@/utils/init/initDictionary'
import { setLocaleLang } from '@/locale'
import initWebsocket from '@/utils/init/initWebsocket'
import useConfigStore from '@/store/modules/config'
import useUserStore from '@/store/modules/user'
import router from '..'
import { getToken } from '@/utils/auth'

const whiteRoutes: string[] = ['/login', '/404', '/403', '/500']

function usePermissionGuard() {
  const configStore = useConfigStore()
  const userStore = useUserStore()
  router.beforeEach(async to => {
    // 初始化国际化
    setLocaleLang()
    // 加载参数
    configStore.initConfig()

    if (whiteRoutes.includes(to.path)) {
      if (to.fullPath === '/login' && getToken()) {
        return {
          path: '/'
        }
      }
      return true
    }
    if (!getToken()) {
      return {
        path: '/login',
        query: { redirect: to.fullPath !== '/resetPassword' ? to.fullPath : '/' }
      }
    }

    // 密码已过期，需要重置密码
    if (userStore.getPasswordExpired === 1 && to.path !== '/resetPassword') {
      return {
        path: '/resetPassword'
      }
    }

    if (to.path === '/resetPassword') {
      // token正常且密码有效期正常，跳回首页
      if (getToken() && userStore.getPasswordExpired === 0) {
        return {
          path: '/'
        }
      }
      return true
    }

    // 加载字典
    initDictionary()
    // 连接websocket
    initWebsocket()

    const permissionStore = usePermissionStore()
    const isEmptyRoute = permissionStore.isEmptyPermissionRoute()
    if (isEmptyRoute) {
      await permissionStore.initPermissionRoute()
      return { ...to, replace: true }
    }
    return true
  })
}

export default usePermissionGuard
