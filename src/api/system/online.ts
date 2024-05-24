import request from '@/utils/request'

// 在线用户列表
export function getOnlineList(data: { keyword: string }) {
  return request({
    url: '/sys/online-user/list',
    method: 'post',
    data
  })
}

// 强制退出
export function forceLogout(data: Array<string | number>) {
  return request({
    url: '/sys/online-user/force-logout',
    method: 'post',
    data
  })
}
