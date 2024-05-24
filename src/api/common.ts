import request from '@/utils/request'

// 接口参数类型
interface Login {
  username: string
  password: string
  captcha: object
}

interface CaptchaImage {
  operationId: string
}

interface Menu {
  terminalMenuCode: string // 终端菜单标识，管理平台：Admin
  locale?: string // 地区码，例如zh_CN、en_US，如果没传则默认为zh_CN
}

// 登录
export function login(data: Login) {
  return request({
    url: '/sys/login',
    method: 'post',
    data
  })
}

// 登出
export function logout() {
  return request({
    url: '/sys/logout',
    method: 'post'
  })
}

// 获取验证码
export function getCaptchaImage(params: CaptchaImage) {
  return request({
    url: '/sys/public/captcha/image',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// 获取用户信息和菜单
export function getUserRoutes(params: Menu) {
  return request({
    url: '/sys/user/menu',
    method: 'get',
    params
  })
}

// 获取table表头
export function getPageHeader(params: { tableName: string; locale?: string }) {
  return request({
    url: '/sys/page-header',
    method: 'get',
    params
  })
}

// 获取字典
export function getDictionary(params: { lastSyncTimestamp?: string; locale?: string }) {
  return request({
    url: '/sys/public/dict',
    method: 'get',
    params
  })
}

// 修改密码
export function updatePassword(data: { oldPassword: string; password: string }) {
  return request({
    url: '/sys/user/password/update',
    method: 'post',
    data
  })
}

// 使用用户名修改密码
export function updatePasswordByUsername(data: {
  username: string
  oldPassword: string
  password: string
}) {
  return request({
    url: '/sys/public/user/password/update',
    method: 'post',
    data
  })
}

// 获取系统参数
export function getPublicConfig() {
  return request.get('/sys/public/config')
}

// 获取系统参数
export function getLocaleLang(params: { locale: string; lastSyncTime?: Date }) {
  return request({
    url: '/sys/public/i18n',
    method: 'get',
    params
  })
}
