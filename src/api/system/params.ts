import request from '@/utils/request'
import { GlobalListInterface } from '@/types/common'

interface Create {
  name: string
  code: string
  value: string
  comment: string
  status: number
}

interface Update extends Create {
  id?: number
}

// 参数列表
export function getConfigList(data: GlobalListInterface) {
  return request({
    url: '/sys/config/list',
    method: 'post',
    data
  })
}

// 创建参数
export function createConfig(data: Create) {
  return request({
    url: '/sys/config/create',
    method: 'post',
    data
  })
}

// 更新参数
export function updateConfig(data: Update) {
  return request({
    url: '/sys/config/update',
    method: 'post',
    data
  })
}

// 删除参数
export function deleteConfig(ids: number[]) {
  return request({
    url: '/sys/config/delete',
    method: 'post',
    data: ids
  })
}

// 参数详情
export function getConfigDetail(params: { id: number }) {
  return request({
    url: '/sys/config/find',
    method: 'get',
    params
  })
}
