import { defineStore } from 'pinia'
import { getDictionary } from '@/api/common'
import { DictionaryState } from '../types'
import { Dictionary } from '@/types/common'
import useLanguageStore from './language'

// 管理字典
const useDictionaryStore = defineStore('dictionary-data', {
  state: () => {
    return {
      dictionary: {} as DictionaryState
    }
  },
  getters: {
    getKey(state) {
      return (key: string) => state.dictionary[key] || []
    }
  },
  actions: {
    saveDictionary(dictionary: DictionaryState) {
      this.dictionary = dictionary
    },

    saveKey(key: string, value: Array<Dictionary>) {
      this.dictionary[key] && (this.dictionary[key] = value)
    },

    async initDictionary() {
      // 加载字典
      try {
        const languageStore = useLanguageStore()
        const dictionaryData = await getDictionary({ locale: languageStore.localLang })
        this.saveDictionary(dictionaryData)
      } catch (error) {
        console.log(error)
      }
    },

    isEmptyDictionary() {
      return !this.dictionary || JSON.stringify(this.dictionary) === '{}'
    }
  }
})

export default useDictionaryStore
