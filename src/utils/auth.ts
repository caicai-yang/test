import { useCookies } from 'vue3-cookies'
const { cookies } = useCookies()

const TokenKey = 'Auth-Token'

export function getToken() {
  return cookies.get(TokenKey)
}

export function setToken(token: string) {
  /**
   * key
   * value
   * expireTimes 过期时间，单位: y-年 m-月 d-日 h-时 min-分 s-秒
   */
  return cookies.set(TokenKey, token, '2d')
}

export function removeToken() {
  return cookies.remove(TokenKey)
}
