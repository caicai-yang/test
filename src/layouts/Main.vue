<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="appStore.pageAnim ? appStore.pageAnim + '-transform' : ''" appear>
      <keep-alive ref="keepAliveRef" :include="cachedRoutes">
        <component :is="Component" :key="route.fullPath" />
      </keep-alive>
    </transition>
  </router-view>
</template>

<script lang="ts">
  import useAppConfigStore from '@/store/modules/app-config'
  import useCachedRouteStore from '@/store/modules/cached-routes'
  import { defineComponent, computed, ref, nextTick } from 'vue'
  import useVisitedRouteStore from '@/store/modules/visited-routes'

  export default defineComponent({
    name: 'Main',
    setup() {
      const appStore = useAppConfigStore()
      const cachedRouteStore = useCachedRouteStore()
      const visitedRouteStore = useVisitedRouteStore()

      const cachedRoutes = computed(() => cachedRouteStore.getCachedRouteName)
      const keepAliveRef = ref()

      nextTick(() => {
        visitedRouteStore.setCachePaths(keepAliveRef.value._.__v_cache)
      })
      return {
        appStore,
        cachedRoutes,
        keepAliveRef
      }
    }
  })
</script>
