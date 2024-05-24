import { defineStore } from 'pinia'
import { THeaderKeysState, THeaderState } from '../types'

const useTHeaderKeysStore = defineStore('theader-keys', {
  state: () => {
    return {
      /**
       *  获取表格的tableName值，{ key: value }
       * @parasm { key: 路由全路劲，value: 请求header接口的tableName }
       */
      theaderKeys: {} as { [key: string]: string },
      /**
       * 组件对应的动态表头, { key: value }
       * @parasm { key: 路由全路劲，value: 已获取的header表头数组 }
       */
      theader: {} as { [key: string]: Array<any> },
      /**
       * 组件对应的表格是否展示外边框
       * @param { key: 路由全路劲. value: 已获取的表格是否展示外边框 }
       */
      tableWrapperBorder: {} as { [key: string]: 0 | 1 },
      /**
       * 组件对应的表格是否展示body边框
       * @param { key: 路由全路劲. value: 已获取的表格是否展示主体边框 }
       */
      tableBodyBorder: {} as { [key: string]: 0 | 1 }
    }
  },
  getters: {
    getKey(state) {
      return (key: string) => state.theaderKeys[key] || ''
    },
    getTHeader(state) {
      return (key: string) => state.theader[key] || null
    },
    getTableWrapperBorder(state) {
      return (key: string) => state.tableWrapperBorder[key] || 0
    },
    getTableBodyBorder(state) {
      return (key: string) => state.tableBodyBorder[key] || 0
    }
  },
  actions: {
    saveKey(theader: THeaderKeysState) {
      // 同个路由有多个动态table，则tableName为以逗号合并的多个tableName组合
      const _values = theader.value.split(',') || []
      // 若有多个tableName，则单独存储；在路由key中加上索引作为区分
      if (_values?.length > 1) {
        _values.forEach((val, index) => {
          const _key = theader.key + '' + (index + 1)
          this.theaderKeys[_key] = val
        })
      } else {
        // 单个tableName，则直接存储
        this.theaderKeys[theader.key] = theader.value
      }
    },
    saveTHeader(theader: THeaderState) {
      this.theader[theader.key] = theader.value
    },
    saveTableWrapperBorder(key: string, value: 0 | 1) {
      this.tableWrapperBorder[key] = value
    },
    saveTableBodyBorder(key: string, value: 0 | 1) {
      this.tableBodyBorder[key] = value
    }
  },
  presist: {
    enable: true
  }
})

export default useTHeaderKeysStore
