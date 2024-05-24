import request from '@/utils/request'

interface List {
  currentPage?: number
  pageSize?: number
  keyword?: string
  type: string
  foreignId: number | string
  enabled?: number
  locale?: string
}

interface MessageList {
  currentPage: number
  pageSize: number
  keyword: string
}

interface Create {
  locale: string
  value: string
  type: string
  enabled: 0 | 1
  foreignId: string | number
}

interface Update {
  id: number | string
  locale: string
  value: string
  enabled: 0 | 1
}

// 查询语言分页列表
export function getLanguageList(data: List) {
  return request({
    url: '/sys/i18n/list',
    method: 'post',
    data
  })
}

// 创建语言
export function createLanguage(data: Create) {
  return request({
    url: '/sys/i18n/create',
    method: 'post',
    data
  })
}

// 更新语言
export function updateLanguage(data: Update) {
  return request({
    url: '/sys/i18n/update',
    method: 'post',
    data
  })
}

// 删除语言
export function deleteLanguage(id: number) {
  return request({
    url: `/sys/i18n/delete?id=${id}`,
    method: 'post'
  })
}

// 查询全局提醒分页列表
export function getMessageList(data: MessageList) {
  return request({
    url: '/sys/i18n/list/message',
    method: 'post',
    data
  })
}
