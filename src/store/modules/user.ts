import { defineStore } from 'pinia'
import { UserState } from '../types'
import store from '../pinia'
import usePermissionStore from './permission'
import useVisitedRouteStore from './visited-routes'
import { removeToken } from '@/utils/auth'
import { UserSettingApi } from '@/api'
import { logout } from '@/api/common'
import socket from '@/utils/websocket'
import type { IDownloadEvent, IEvent } from '@/types/user'

import Avatar from '@/assets/profile.jpg'

const defaultAvatar = Avatar

const useUserStore = defineStore('user-info', {
  state: (): UserState => {
    return {
      id: '',
      username: '',
      name: '',
      mobile: '',
      orgId: '',
      avatar: '',
      sex: '',
      post: '',
      createTime: '',
      orgName: '',
      validDate: '',
      userPasswordExpired: 0, // 密码是否已过期，0：否，1：是
      unreadMessageNum: 0, // 未读消息数量,
      currentOrgId: '', // 全局选中组织id
      currentOrgCode: '', // 全局选中组织code
      downloadList: {} as IDownloadEvent // 正在下载的文件内容
    }
  },
  getters: {
    // 获取用户密码是否过期
    getPasswordExpired(state) {
      return state.userPasswordExpired
    },
    // 获取下载中文件内容
    getDownloadList(state): IEvent[] {
      return Object.values(state.downloadList)
    }
  },
  actions: {
    async getUser() {
      if (this.id) {
        return {
          ...this.$state
        }
      }
      const user = (await UserSettingApi.getPersonalInfo()) as any
      this.saveUser(user)
      return {
        ...this.$state
      }
    },
    saveUser(userInfo: UserState) {
      Object.keys(userInfo).forEach(key => {
        if (key === 'name') {
          this.name = userInfo.name || userInfo.username || '游客'
        } else if (key === 'avatar') {
          this.avatar = userInfo.avatar || defaultAvatar
        } else {
          this[key] = userInfo[key]
        }
      })
    },
    resetUserCache() {
      const permissionStore = usePermissionStore()
      const visitedRouteStore = useVisitedRouteStore()
      const localPrint = localStorage.getItem('printer')
      localStorage.clear()
      localPrint && localStorage.setItem('printer', localPrint)
      sessionStorage.clear()
      removeToken()
      permissionStore.reset()
      visitedRouteStore.restoreVisitedView()
      socket.close()
      this.$reset()
    },
    logout() {
      return new Promise<void>(resolve => {
        logout().then(() => {
          this.resetUserCache()
          resolve()
        })
      })
    },
    // 设置用户密码是否过期
    setPasswordExpired(value: 0 | 1) {
      this.userPasswordExpired = value
    },
    // 更新未读消息数量
    setUnreadMessageNum(value: number) {
      this.unreadMessageNum = value
    },

    setCurrentOrgId(orgId: number | string) {
      this.currentOrgId = orgId
    },

    setCurrentOrgCode(orgCode: string) {
      this.currentOrgCode = orgCode
    },

    /**
     * 更新下载进度
     * @param data IEvent
     */
    updateDownloadEvent(data: IEvent) {
      const { eventId, title, process, url } = data
      this.downloadList[eventId] = {
        eventId,
        title:
          !title && this.downloadList[eventId].title ? this.downloadList[eventId].title : title,
        process,
        url
      }
    },

    /**
     * 删除对应下载事件
     * @param eventId 事件id
     */
    removeDownloadByEventID(eventId: string) {
      delete this.downloadList[eventId]
    }
  },
  presist: {
    enable: true,
    resetToState: true,
    option: {
      exclude: ['username', 'id', 'orgId', 'orgName']
    }
  }
})

export default useUserStore

export function useUserStoreContext() {
  return useUserStore(store)
}
