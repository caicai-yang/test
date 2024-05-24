// 组件完成初始化后, 根据是否缓存对应执行 onMounted 或 onActivated
import { onMounted, onActivated } from 'vue'
import { useRoute } from 'vue-router'

export function useComponentInited(callback: () => void) {
  const route = useRoute()
  const cache = route.meta?.cacheable
  cache ? onActivated(callback) : onMounted(callback)
}
