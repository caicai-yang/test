import { ref } from 'vue'
import useDictionaryStore from '@/store/modules/dictionary'
// import { DictionaryState } from '@/store/types'
import { Dictionary } from '@/types/common'

/**
 * 使用字典
 * @param args { 字典名 }
 * @returns [] Dictionary[]
 */
export function useDictionary(args: string) {
  const dictionaryStore = useDictionaryStore()
  // const res = ref<DictionaryState>({})
  // // 数组，遍历取值，返回 DictionaryState
  // if (args instanceof Array) {
  //   return (() => {
  //     args.forEach((d: string) => {
  //       res.value[d] = dictionaryStore.getKey(d)
  //     })
  //     return toRefs(res.value)
  //   })()
  // }
  // 非数组，返回args对应字典
  const currentDictionary = dictionaryStore.getKey(args) as Dictionary[]
  return ref(currentDictionary)
}

/**
 * 获取字典值指定value对应的项
 * @param dictionary
 * @param value
 * @returns
 */
export function useFindByDictionary(dictionary: string, value: string | undefined) {
  const list = useDictionary(dictionary)
  const find = list.value.find(item => item.value === value)
  return find
}
