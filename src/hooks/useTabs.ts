import router from '@/router'
import useVisitedRouteStore from '@/store/modules/visited-routes'
import useGlobalRefsStore from '@/store/modules/global-refs'
import type { RouteRecordRaw } from 'vue-router'

/**
 * 关闭标签页
 * @param goBackPath { 关闭标签后需要回到的新标签路劲，若未传，则关闭后回到已打开标签的最后一个 }
 */
export async function useCloseTab(goBackPath?: string) {
  try {
    const route = router.currentRoute.value
    const visitedRouteStore = useVisitedRouteStore()
    const globalRefsStore = useGlobalRefsStore()
    // tabbar组件实例
    const _tabBarRef = globalRefsStore.getTabBarRef as any
    // 已打开的标签页
    const _visitedRoutes = visitedRouteStore.getVisitedRoutes
    // 当前关闭标签
    const findItem = _visitedRoutes.find((it: { path: string }) => it.path === route.path)

    visitedRouteStore.removeVisitedRoute(findItem as RouteRecordRaw).then(lastPath => {
      const _path = goBackPath ?? lastPath
      if (_tabBarRef.currentTab === route.path) {
        _tabBarRef.currentTab = _path
      }
      router.push(_path)
    })
  } catch (error) {
    goBackPath && router.push(goBackPath)
  }
}
