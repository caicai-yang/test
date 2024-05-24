import { defineStore } from 'pinia'
import { RouteRecordRaw } from 'vue-router'
import pinia from '../pinia'
import useCachedRouteStore from '@/store/modules/cached-routes'
import { findCachedRoutes } from '../help'

const useVisitedRouteStore = defineStore('visited-routes', {
  state: () => {
    return {
      visitedRoutes: JSON.parse(localStorage.getItem('visited-routes') || '[]') as RouteRecordRaw[],
      isLoadAffix: false,
      cachedPaths: {} as Map<string, Object> // 当前缓存页面path集合
    }
  },
  getters: {
    getVisitedRoutes(state) {
      return state.visitedRoutes
    }
  },
  actions: {
    initAffixRoutes(affixRoutes: RouteRecordRaw[]) {
      affixRoutes.reverse().forEach(affixRoute => {
        if (!this.visitedRoutes.find(it => it.path === affixRoute.path)) {
          this.visitedRoutes.unshift(affixRoute)
        }
      })
      this.isLoadAffix = true
    },
    addVisitedRoute(route: RouteRecordRaw) {
      return new Promise(resolve => {
        if (!this.visitedRoutes.find(it => it.path === route.path)) {
          if (route.name && route.meta?.cacheable) {
            const cachedRoutesStore = useCachedRouteStore()
            if (!cachedRoutesStore.cachedRoutes.includes(route.name as string)) {
              cachedRoutesStore.cachedRoutes.push(route.name as string)
            }
          }
          this.visitedRoutes.push(route)

          this.persistentVisitedView()
        }
        resolve(route)
      })
    },
    removeVisitedRoute(route: RouteRecordRaw) {
      return new Promise<string>(resolve => {
        // 删除访问路劲
        this.visitedRoutes.splice(this.visitedRoutes.indexOf(route), 1)
        // 删除当前路劲缓存
        this.deleteCachePath(route)
        // 还存在同一组件时，不清除component Name缓存
        if (route.name && !this.visitedRoutes.some(v => v.name === route.name)) {
          const cachedRoutesStore = useCachedRouteStore()
          if (cachedRoutesStore.cachedRoutes.includes(route.name as string)) {
            cachedRoutesStore.cachedRoutes.splice(
              cachedRoutesStore.cachedRoutes.indexOf(route.name as string),
              1
            )
          }
        }
        this.persistentVisitedView()
        resolve(this.findLastRoutePath())
      })
    },
    // 删除缓存
    deleteCachePath(route: RouteRecordRaw) {
      const cacheKeys = [...this.cachedPaths.keys()] // 获取cache中的key数组
      cacheKeys.forEach(key => {
        if (route.path === key) {
          this.cachedPaths.delete(key)
        }
      })
    },
    // 删除刷新缓存
    deleteRefreshCachePath(route: RouteRecordRaw) {
      return new Promise(resolve => {
        const cacheKeys = [...this.cachedPaths.keys()] // 获取cache中的key数组
        cacheKeys.forEach(key => {
          if (route.path === key) {
            this.cachedPaths.delete(key)
          }
        })
        resolve(cacheKeys)
      })
    },
    findLastRoutePath() {
      return this.visitedRoutes && this.visitedRoutes.length > 0
        ? this.visitedRoutes[this.visitedRoutes.length - 1].path
        : '/'
    },
    closeLeftVisitedView(selectRoute: RouteRecordRaw) {
      return new Promise(resolve => {
        const selectIndex = this.visitedRoutes.indexOf(selectRoute)
        if (selectIndex !== -1) {
          this.visitedRoutes = this.visitedRoutes.filter((it, index) => {
            return (it.meta && it.meta.affix) || index >= selectIndex
          })
          const cachedRoutesStore = useCachedRouteStore()
          cachedRoutesStore.setCachedRoutes(findCachedRoutes(this.visitedRoutes))
          this.persistentVisitedView()
        }
        resolve(selectRoute)
      })
    },
    closeRightVisitedView(selectRoute: RouteRecordRaw) {
      return new Promise(resolve => {
        const selectIndex = this.visitedRoutes.indexOf(selectRoute)
        if (selectIndex !== -1) {
          this.visitedRoutes = this.visitedRoutes.filter((it, index) => {
            return (it.meta && it.meta.affix) || index <= selectIndex
          })
          const cachedRoutesStore = useCachedRouteStore()
          cachedRoutesStore.setCachedRoutes(findCachedRoutes(this.visitedRoutes))
          this.persistentVisitedView()
        }
        resolve(selectRoute)
      })
    },
    closeOtherVisitedView(selectRoute: RouteRecordRaw) {
      return new Promise(resolve => {
        const selectIndex = this.visitedRoutes.indexOf(selectRoute)
        if (selectIndex !== -1) {
          this.visitedRoutes = this.visitedRoutes.filter((it, index) => {
            return (it.meta && it.meta.affix) || index === selectIndex
          })
          const cachedRoutesStore = useCachedRouteStore()
          cachedRoutesStore.setCachedRoutes(findCachedRoutes(this.visitedRoutes))
          this.persistentVisitedView()
        }
        resolve(selectRoute)
      })
    },
    closeAllVisitedView() {
      return new Promise<void>(resolve => {
        this.visitedRoutes = this.visitedRoutes.filter(it => {
          return it.meta && it.meta.affix
        })
        const cachedRoutesStore = useCachedRouteStore()
        cachedRoutesStore.setCachedRoutes(findCachedRoutes(this.visitedRoutes))
        this.persistentVisitedView()
        resolve()
      })
    },
    persistentVisitedView() {
      const tempPersistendRoutes = this.visitedRoutes.map(it => {
        return {
          fullPath: it.path,
          meta: it.meta,
          name: it.name,
          path: it.path
        }
      })
      localStorage.setItem(this.$id, JSON.stringify(tempPersistendRoutes))
    },
    // 同步缓存页面路径path
    setCachePaths(cachedPaths: Map<string, Object>) {
      this.cachedPaths = cachedPaths
    },
    restoreVisitedView() {
      this.$reset()
    }
  }
  // 由于需要自定义持久化过程，所以这里就不能用插件来实现
  // presist: {
  //   enable: true,
  // },
})

export function useVisitedRoutesContext() {
  return useVisitedRouteStore(pinia)
}

export default useVisitedRouteStore
