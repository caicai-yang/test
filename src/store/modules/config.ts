import { defineStore } from 'pinia'
import { getPublicConfig } from '@/api/common'

type Config = {
  [key: string]: any
}

// 系统参数
const useConfigStore = defineStore('config-store', {
  state: () => {
    return {
      config: {} as Config
    }
  },
  getters: {
    getKey(state) {
      return (key: string) => state.config[key] || ''
    }
  },
  actions: {
    saveConfig(config: Config) {
      this.config = config
    },
    saveKey(key: string, value: any) {
      this.config[key] && (this.config[key] = value)
    },
    async initConfig() {
      if (!this.isEmpty()) {
        return
      }
      try {
        const config = await getPublicConfig()
        this.saveConfig(config)
      } catch (error) {
        console.log(error)
      }
    },
    isEmpty() {
      return !this.config || !Object.keys(this.config).length
    }
  }
})

export default useConfigStore
