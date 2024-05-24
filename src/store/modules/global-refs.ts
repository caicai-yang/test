import { defineStore } from 'pinia'

const useGlobalRefsStore = defineStore('global-refs', {
  state: () => {
    return {
      tabBarRef: null
    }
  },
  getters: {
    getTabBarRef(state) {
      return state.tabBarRef
    }
  },
  actions: {
    setTabBarRef(ref: any) {
      this.tabBarRef = ref
    }
  }
})

export default useGlobalRefsStore
