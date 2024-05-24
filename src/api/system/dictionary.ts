import request from '@/utils/request'
import { GlobalListInterface, Conditions, Sorts } from '@/types/common'

interface GetLabelList {
  keyword?: String
  conditions?: Array<Conditions>
  sorts?: Array<Sorts>
  dictionaryCode: String
}

interface Create {
  name: String
  code: String
  comment: String
  enabled: Number | Boolean
}

interface Update extends Create {
  id?: Number
}

interface CreateDetail {
  dictionaryCode: String
  name: String
  value: String
  comment: String
  enabled: Number | Boolean
  color: String
}

interface UpdateDetail extends CreateDetail {
  id?: Number
}

interface UpdateSort {
  id: number
  priority: number
}

// 字典列表
export function getTableList(data: GlobalListInterface) {
  return request({
    url: '/sys/dictionary/list',
    method: 'post',
    data
  })
}

// 创建字典
export function createDictionary(data: Create) {
  return request({
    url: '/sys/dictionary/create',
    method: 'post',
    data
  })
}

// 更新字典
export function updateDictionary(data: Update) {
  return request({
    url: '/sys/dictionary/update',
    method: 'post',
    data
  })
}

// 删除字典
export function deleteDictionary(ids: number[]) {
  return request({
    url: '/sys/dictionary/delete',
    method: 'post',
    data: ids
  })
}

// 字典标签列表
export function getLabelList(data: GetLabelList) {
  return request({
    url: '/sys/dictionary-label/list',
    method: 'post',
    data
  })
}

// 字典标签详情
export function getLabelDetail(params: { id: number }) {
  return request({
    url: '/sys/dictionary-label/find',
    method: 'get',
    params
  })
}

// 创建字典标签
export function createLabel(data: CreateDetail) {
  return request({
    url: '/sys/dictionary-label/create',
    method: 'post',
    data
  })
}

// 更新字典标签
export function updateLabel(data: UpdateDetail) {
  return request({
    url: '/sys/dictionary-label/update',
    method: 'post',
    data
  })
}

// 删除字典标签
export function deleteLabel(ids: number[]) {
  return request({
    url: '/sys/dictionary-label/delete',
    method: 'post',
    data: ids
  })
}

// 保存排序
export function updateSort(data: Array<UpdateSort>) {
  return request({
    url: '/sys/dictionary-label/update-sort',
    method: 'post',
    data
  })
}
