import { defineStore } from 'pinia'

import defaultSetting from '@/setting'
import { LayoutMode, PageAnim, SideTheme, ThemeMode, DeviceType } from '../types'

import { useChangeMenuWidth } from '@/hooks/useMenuWidth'
import usePrimaryColor from '@/hooks/usePrimaryColor'
import useTheme from '@/hooks/useTheme'

const useAppConfigStore = defineStore('app-config', {
  state: () => {
    return {
      ...defaultSetting,
      globalKey: 0 // 切换全局组织时, 更新当前组件
    }
  },
  getters: {
    getLayoutMode(state) {
      return state.layoutMode
    },
    isStandardTheme(state) {
      return state.theme === 'standardBlue'
    }
  },
  actions: {
    updateGlobalKey() {
      this.globalKey++
    },
    changeTheme(theme: ThemeMode) {
      this.theme = theme
      useTheme(theme)
    },
    changeLayoutMode(mode: LayoutMode) {
      this.layoutMode = mode
    },
    changeDevice(deviceType: DeviceType) {
      this.deviceType = deviceType
    },
    changeSideBarTheme(sideTheme: SideTheme) {
      this.sideTheme = sideTheme
    },
    changePageAnim(pageAnim: PageAnim) {
      this.pageAnim = pageAnim
    },
    changePrimaryColor(color: string) {
      this.themeColor = color
      usePrimaryColor(color)
    },
    changeSideWidth(sideWidth: number) {
      this.sideWidth = sideWidth
      useChangeMenuWidth(sideWidth)
    },
    toggleCollapse(isCollapse: boolean) {
      this.isCollapse = isCollapse
    }
  },
  presist: {
    enable: true,
    option: {
      exclude: ['globalKey']
    },
    resetToState: true
  }
})

export default useAppConfigStore
