import { defineStore } from 'pinia'

// 国际化
const useLanguageStore = defineStore('language-data', {
  state: () => {
    return {
      localLang: JSON.parse(localStorage.getItem('language-data') || '{}').localLang || 'zh_CN',
      hasLoad: false // 是否已经加载过
    }
  },
  actions: {
    saveLang(lang: string) {
      this.localLang = lang
    },
    setLoad(val: boolean) {
      this.hasLoad = val
    }
  },
  presist: {
    enable: true
  }
})

export default useLanguageStore
