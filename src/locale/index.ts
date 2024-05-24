import { App } from 'vue'
import useLanguageStore from '@/store/modules/language'
import { getLocaleLang } from '@/api/common'
import { createI18n } from 'vue-i18n'

let i18n: any = null

// 切换语言，重新设置语言
export function setLocaleLang() {
  const languageStore = useLanguageStore()
  if (languageStore.hasLoad) {
    return
  }

  getLocaleLang({
    locale: languageStore.localLang
  }).then(message => {
    i18n.global.setLocaleMessage(languageStore.localLang, message)
    // 标记为已加载
    languageStore.setLoad(true)
  })
}

// 初始化和挂载i18n
export default function (app: App) {
  const languageStore = useLanguageStore()
  i18n = createI18n({
    locale: languageStore.localLang,
    messages: {}
  })

  app.use(i18n)
}
