import request from '@/utils/request'
import { GlobalListInterface } from '@/types/common'

// 消息列表-查看当前用户的消息
export function getTableList(data: GlobalListInterface) {
  return request({
    url: '/sys/msg/list',
    method: 'post',
    data
  })
}

// 消息详情
export function findMessage(id: number) {
  return request({
    url: `/sys/msg/find?id=${id}`,
    method: 'get'
  })
}

// 删除消息
export function deleteMessage(data: Array<number>) {
  return request({
    url: '/sys/msg/delete',
    method: 'post',
    data
  })
}

// 确认已阅
export function readMessage(data: number) {
  return request({
    url: '/sys/msg/read',
    method: 'post',
    data
  })
}
