import Axios, { AxiosRequestConfig } from 'axios'
import { Message } from '@arco-design/web-vue'
import { tansParams } from '../index'
import errorCode from './errorCode'
import cache from '@/plugins/cache'
import qs from 'qs'
import { setToken, getToken } from '@/utils/auth'
import useUserStore from '@/store/modules/user'
import $Confirm from '@/plugins/Confirm'
import router from '@/router'
import { IAxiosInstance, IAxiosRequestConfig, IAxiosResponse } from '@/types'

const CancelToken = Axios.CancelToken
export const baseURL = import.meta.env.VITE_BASE_API

export const CONTENT_TYPE = 'Content-Type'

export const FORM_URLENCODED = 'application/x-www-form-urlencoded; charset=UTF-8'

export const APPLICATION_JSON = 'application/json; charset=UTF-8'

export const TEXT_PLAIN = 'text/plain; charset=UTF-8'

const AUTH_TOKEN = 'Authorization'

// 表格头部勾选key，与Table组件使用的保持一致。注：不要更改
const DISABLED_IMMEDIATE_QUERY = `${new Date().getFullYear()}-${
  new Date().getMonth() + 1
}-${new Date().getDate()}-disabledImmediateQuery###`

declare module 'axios' {
  interface AxiosInstance {
    (config: AxiosRequestConfig): Promise<any>
  }
}

export interface reLogin {
  show: boolean
}

// 响应数据选项
export interface Response<T = any> {
  data: T
}

// 是否显示重新登录
export const isRelogin: reLogin = { show: false }

const service: IAxiosInstance = Axios.create({
  baseURL,
  timeout: 10 * 60 * 1000
})

// 在正式发送请求之前进行拦截配置
service.interceptors.request.use(
  (config: IAxiosRequestConfig) => {
    // 为当前请求添加cancelToken字段，取消请求时需要用到
    const ServiceSource = CancelToken.source()
    config.cancelToken = ServiceSource.token

    // DISABLED_IMMEDIATE_QUERY 为表格头部勾选的自定义字段，无需传给接口
    config.data &&
      Object.prototype.hasOwnProperty.call(config.data, DISABLED_IMMEDIATE_QUERY) &&
      delete config.data[DISABLED_IMMEDIATE_QUERY]

    !config.headers && (config.headers = {})
    const methods = config.method?.toLowerCase()

    /**
     * 是否能重复提交，默认为否
     * 若需要重复提交，则在接口请求中加上参数 headers: { isRepeat: true }
     * get 请求不限制重复提交
     */
    const isRepeatSubmit = !!config.headers.isRepeat
    const sessionKey = config.url + (config.data ? JSON.stringify(config.data) : '')

    if (!config.headers[CONTENT_TYPE]) {
      config.headers[CONTENT_TYPE] = APPLICATION_JSON
    }
    if (config.headers[CONTENT_TYPE] === FORM_URLENCODED) {
      config.data = qs.stringify(config.data)
    }
    if (getToken()) {
      config.headers[AUTH_TOKEN] = getToken()
    }
    // 若标记了可重复提交，则接口请求中去除该参数
    if (isRepeatSubmit) {
      delete config.headers.isRepeat
    }

    // get请求映射params参数
    if (methods === 'get' && config.params && !config.preventTransParams) {
      let url = config.url + '?' + tansParams(config.params)
      url = url.slice(0, -1)
      config.params = {}
      config.url = url
    }

    // 限制重复提交
    if (!isRepeatSubmit && (methods === 'post' || methods === 'put')) {
      // 当前存在正在提交的相同请求路劲，则取消当前请求
      if (cache.session.get(sessionKey)) {
        ServiceSource.cancel('Duplicate request')
      }
      // 标记当前请求为正在请求中
      cache.session.set(sessionKey, 'true')

      // 为了防止未成功清除标记导致无法重新请求接口，接口请求5秒后若未清除限制，则自动清除
      setTimeout(() => {
        if (cache.session.get(sessionKey)) {
          cache.session.remove(sessionKey)
        }
      }, 5000)
    }
    return config
  },
  error => {
    return Promise.reject(error.response)
  }
)

// 拦截处理返回数据
service.interceptors.response.use(
  (res: IAxiosResponse) => {
    const dataType = Object.prototype.toString.call(res.config.data).slice(8, -1).toLowerCase()
    const isObject = !['blob', 'formdata'].includes(dataType)
    let _configData = ''
    if (res.config.data) {
      if (isObject) {
        _configData = JSON.stringify(JSON.parse(res.config.data))
      } else {
        _configData = JSON.stringify(res.config.data)
      }
    }
    const sessionKey = res.config.url + _configData

    // 当前请求路劲被标记是正在请求中，则删除标记
    if (cache.session.get(sessionKey)) {
      cache.session.remove(sessionKey)
    }
    // 未设置状态码则默认成功状态
    const code = res.data.code || 200
    // 获取错误信息
    const message = res.data.message || errorCode.default
    // 二进制数据则直接返回
    if (res.request.responseType === 'blob' || res.request.responseType === 'arraybuffer') {
      return res.data
    }
    // 登录过期 601
    if (code === 601) {
      if (!isRelogin.show) {
        isRelogin.show = true
        $Confirm({
          title: '提示',
          content: '登录状态已过期，请重新登录？',
          okText: '重新登录',
          cancelText: '取消',
          onOk: () => {
            isRelogin.show = false
            const userStore = useUserStore()
            userStore.logout().then(() => {
              location.href = '/index'
            })
          },
          onCancel: () => {
            isRelogin.show = false
          }
        })
      }
      return Promise.reject('无效的会话，或者会话已过期，请重新登录。')
    } else if (code === 602) {
      // 密码超过有效期，需要修改密码
      const userStore = useUserStore()
      userStore.setPasswordExpired(1)

      const _data = res.data.data || res.data
      if (_data && _data.authorization) {
        setToken(_data.authorization)
      }
      router.replace('/resetPassword')
      return Promise.reject('当前用户密码已过期，请修改密码')
    } else if (code === 500) {
      Message.error(message)
      return Promise.reject(new Error(message))
    } else if (code !== 200) {
      if (res.config.isCustomCatchError) {
        return Promise.reject(res.data)
      }
      Message.error(message)
      return Promise.reject(res.data.data || res.data)
    }
    return Promise.resolve(res.data.data || res.data)
  },
  error => {
    console.log('error:', error)
    let { message } = error
    if (message === 'Network Error') {
      message = '网络连接异常'
    } else if (message.includes('timeout')) {
      message = '系统接口请求超时'
    } else if (message.includes('Request failed with status code')) {
      message = '系统接口' + message.substr(message.length - 3) + '异常'
    }
    message !== 'Duplicate request' && Message.error(message)
    return Promise.reject(error)
  }
)

export function get<T = any>({
  url,
  config
}: {
  url: string
  config: IAxiosRequestConfig
}): Promise<IAxiosResponse<Response<T>>> {
  return service.get(url, config)
}

export default service
