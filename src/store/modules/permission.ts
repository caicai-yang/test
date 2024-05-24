import { RouteRecordRaw } from 'vue-router'
import { defineStore } from 'pinia'
import useUserStore from './user'
import router from '@/router'
import useLanguageStore from './language'
// import { defaultRoutes } from '@/router/routes/default-routes'
// import { asyncRoutes } from '@/router/routes/async'
import {
  findRootPathRoute,
  handleRouteStartsWith,
  generatorRoutes,
  mapTwoLevelRouter,
  handleTHeaderKeysByRemoteRoutes,
  handleTHeaderKeysByLocalRoutes
} from '../help'
import { constantRoutes } from '@/router/routes/constants'
import { getUserRoutes } from '@/api/common'

const usePermissionStore = defineStore('permission-route', {
  state: () => {
    return {
      permissionRoutes: [] as RouteRecordRaw[],
      permissionButtons: [] as string[]
    }
  },
  getters: {
    getPermissionSideBar(state) {
      return state.permissionRoutes.filter(it => {
        return it.meta && !it.meta.hidden
      })
    },
    getPermissionSplitTabs(state) {
      return state.permissionRoutes.filter(it => {
        return it.meta && !it.meta.hidden && it.children && it.children.length > 0
      })
    },
    getTopLevelTabs(state) {
      return state.permissionRoutes
        .filter(it => {
          return it.meta && !it.meta.hidden && it.children && it.children.length > 0
        })
        .map(it => {
          const obj = { ...it, items: it.children }
          delete obj.children
          return obj
        })
    }
  },
  actions: {
    async getRoutes() {
      try {
        const languageStore = useLanguageStore()
        const res = await getUserRoutes({
          terminalMenuCode: 'Admin',
          locale: languageStore.localLang
        })
        this.permissionButtons = res.buttons.map((i: { code: string; name: string }) => i.code)
        const userStore = useUserStore()
        userStore.saveUser({
          name: res.name,
          avatar: res.avatar
        })
        // TODO 接口菜单返回数据格式正常后，放开这个
        const tempRoute = handleRouteStartsWith(res.menus)
        // TODO 接口菜单返回数据格式正常后，去除这个
        // const tempRoute = handleRouteStartsWith(asyncRoutes)
        handleTHeaderKeysByRemoteRoutes(tempRoute)
        handleTHeaderKeysByLocalRoutes()
        return generatorRoutes(tempRoute)
      } catch (error) {
        console.log('路由加载失败了，请清空一下Cookie和localStorage，重新登录')
        return []
      }
    },
    async initPermissionRoute() {
      // 加载路由
      const accessRoutes = await this.getRoutes()
      const mapRoutes = mapTwoLevelRouter(accessRoutes)
      mapRoutes.forEach((it: any) => {
        router.addRoute(it)
      })
      // 配置 `/` 路由的默认跳转地址
      router.addRoute({
        path: '/',
        redirect: findRootPathRoute(accessRoutes),
        meta: {
          hidden: true
        }
      })
      // 这个路由一定要放在最后
      router.addRoute({
        path: '/:pathMatch(.*)*',
        redirect: '/404',
        meta: {
          hidden: true
        }
      })
      // const _defaultRoutes = mapTwoLevelRouter(defaultRoutes)
      this.permissionRoutes = [...constantRoutes, ...accessRoutes]
    },
    isEmptyPermissionRoute() {
      return !this.permissionRoutes || this.permissionRoutes.length === 0
    },
    reset() {
      this.$reset()
    }
  }
})

export default usePermissionStore
