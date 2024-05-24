import { computed } from 'vue'
import router from '@/router'
import { getPageHeader } from '@/api/common'
import useTHeaderKeysStore from '@/store/modules/theader-keys'
import useLanguageStore from '@/store/modules/language'
const theaderKeysStore = useTHeaderKeysStore()

export async function useTHeader(tableIndex?: number) {
  // 在 hooks 中使用 useRoute 可能返回 undefined, 使用 currentRoute 替代
  const route = router.currentRoute.value
  // 使用 matched 匹配动态路径这类情况
  const path = route.matched[route.matched.length - 1].path
  const _pathKey = typeof tableIndex === 'number' ? path + '' + tableIndex : path
  const currentTHeader = theaderKeysStore.getTHeader(_pathKey)
  // 如果已经存在对应THeader数据，直接返回
  if (currentTHeader) {
    return currentTHeader.filter((header: any) => header.dataIndex !== 'id')
  }
  // 不存在则调取接口获取
  const tableName =
    theaderKeysStore.getKey(_pathKey) || theaderKeysStore.getKey(route.name as string)
  const languageStore = useLanguageStore()
  const headerData = (await getPageHeader({
    tableName: tableName,
    locale: languageStore.localLang
  })) as any
  const { headers, showTableBorder, showZebraStripe } = headerData
  // 存储当前THeader
  theaderKeysStore.saveTHeader({
    key: _pathKey,
    value: headers
  })
  // 存储 showTableBorder，表格外边框
  theaderKeysStore.saveTableWrapperBorder(_pathKey, showTableBorder)
  // 存储 showZebraStripe，表格body边框
  theaderKeysStore.saveTableBodyBorder(_pathKey, showZebraStripe)

  return headers.filter((header: any) => header.dataIndex !== 'id')
}

// 获取表格外边框（更正：业务调整，此处是获取表格所有边框）
export function useTableWrapperBorder(tableIndex?: number) {
  const route = router.currentRoute.value
  const path = route.matched[route.matched.length - 1].path
  const _pathKey = typeof tableIndex === 'number' ? path + '' + tableIndex : path
  return computed(() => (theaderKeysStore.getTableWrapperBorder(_pathKey) ? true : false))
}

// 获取表格body边框（更正：业务调整，此处是获取表格斑马纹）
export function useTableBodyBorder(tableIndex?: number) {
  const route = router.currentRoute.value
  const path = route.matched[route.matched.length - 1].path
  const _pathKey = typeof tableIndex === 'number' ? path + '' + tableIndex : path
  return computed(() => (theaderKeysStore.getTableBodyBorder(_pathKey) ? true : false))
}
