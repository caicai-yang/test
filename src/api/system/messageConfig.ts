import request from '@/utils/request'
import { GlobalListInterface } from '@/types/common'

// 接口参数类型
interface List {
  currentPage: number
  pageSize: number
  configId: number | string
  postList: Array<string | number>
  usernameList: Array<string>
  nameList: Array<string>
}

interface SelectList {
  currentPage: number
  pageSize: number
  username: string
  name: string
  postList: Array<string>
  roleIdList: Array<number>
}

// 消息配置列表
export function messageConfigList(data: GlobalListInterface) {
  return request({
    url: '/sys/msg-config/list',
    method: 'post',
    data
  })
}
// 更新消息状态
export function updateStatus(data: { id: number; status: string }) {
  return request({
    url: '/sys/msg-config/update-status',
    method: 'post',
    data
  })
}
// 新增消息配置
export function addMessageConfig(data: object) {
  return request({
    url: '/sys/msg-config/create',
    method: 'post',
    data
  })
}
// 更新消息配置
export function updateMessageConfig(data: object) {
  return request({
    url: '/sys/msg-config/update',
    method: 'post',
    data
  })
}
// 消息配置详情
export function messageConfigDetail(params: { id: number | string }) {
  return request({
    url: '/sys/msg-config/find',
    method: 'get',
    params
  })
}
// 配置用户列表
export function configPersonList(data: List) {
  return request({
    url: '/sys/msg-config/user/list',
    method: 'post',
    data
  })
}
// 删除配置用户
export function deletePersonList(data: Array<number>) {
  return request({
    url: '/sys/msg-config/user/delete',
    method: 'post',
    data
  })
}
// 删除消息配置
export function deleteMessageConfig(data: Array<number>) {
  return request({
    url: '/sys/msg-config/delete',
    method: 'post',
    data
  })
}

// 导入用户列表
export function importPersonList(data: Array<string>) {
  return request({
    url: '/sys/user/import-list',
    method: 'post',
    data
  })
}
// 选择用户列表
export function selectPersonList(data: SelectList) {
  return request({
    url: '/sys/user/select-list',
    method: 'post',
    data
  })
}
// 更新配置用户
export function updatetPersonConfig(data: {
  configId: number | string
  userIdList: Array<number>
}) {
  return request({
    url: '/sys/msg-config/user/update',
    method: 'post',
    data
  })
}

// 阅读记录列表
export function getReadList(params: { configId: string | number; userId: number }) {
  return request({
    url: '/sys/msg/read-list',
    method: 'get',
    params
  })
}
