import useDictionaryStore from '@/store/modules/dictionary'

// 加载字典
export default function () {
  const dictionaryStore = useDictionaryStore()
  const isEmptyDictionary = dictionaryStore.isEmptyDictionary()
  if (isEmptyDictionary) {
    dictionaryStore.initDictionary()
  }
}
