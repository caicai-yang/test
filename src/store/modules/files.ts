import { defineStore } from 'pinia'

const useFilesStore = defineStore('file-url', {
  state: () => {
    return {
      /**
       * fileId对应的url, { key: value }
       * @params { key: 文件id，value: 文件id对应的完整url }
       */
      files: {} as { [key: string]: string }
    }
  },
  getters: {
    getKey(state) {
      return (key: string) => state.files[key] || ''
    }
  },
  actions: {
    saveFileUrl(fileId: string, url: string) {
      this.files[fileId] = url
    }
  },
  presist: {
    enable: true
  }
})

export default useFilesStore
