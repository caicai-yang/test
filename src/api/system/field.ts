import request from '@/utils/request'
import { GlobalListInterface } from '@/types/common'

interface GetFieldList extends GlobalListInterface {
  tableName: String
}

interface CreateTable {
  name: String
  comment: String
}

interface UpdateTable extends CreateTable {
  id?: Number
}

interface CreateField {
  tableName?: String
  name: String
  dataType: String
  comment: String
  type: String
  dictionaryCode: String
  foreignTableName: String
  foreignFieldName: String
  label: String
  enabled: Number | Boolean
  searchable: Number | Boolean
  width?: Number // 字段显示宽度
  freeze?: 'left' | 'right' | '' // 字段显示位置（是否左右冻结）
}

interface UpdateField extends CreateField {
  id?: Number
}

// 查询字段集合分页列表
export function getTableList(data: GlobalListInterface) {
  return request({
    url: '/sys/table/list',
    method: 'post',
    data
  })
}

// 创建字段集合
export function createTable(data: CreateTable) {
  return request({
    url: '/sys/table/create',
    method: 'post',
    data
  })
}

// 更新字段集合
export function updateTable(data: UpdateTable) {
  return request({
    url: '/sys/table/update',
    method: 'post',
    data
  })
}

// 删除字段集合
export function deleteTable(id: number) {
  return request({
    url: `/sys/table/delete?id=${id}`,
    method: 'post'
  })
}

// 查询字段分页列表
export function getFieldList(data: GetFieldList) {
  return request({
    url: '/sys/field/list',
    method: 'post',
    data
  })
}

// 查询字段详情
export function getFieldDetail(id: number) {
  return request({
    url: `/sys/field/find?id=${id}`,
    method: 'get'
  })
}

// 创建字段
export function createField(data: CreateField) {
  return request({
    url: '/sys/field/create',
    method: 'post',
    data
  })
}

// 更新字段
export function updateField(data: UpdateField) {
  return request({
    url: '/sys/field/update',
    method: 'post',
    data
  })
}

// 删除字段集合
export function deleteField(id: number) {
  return request({
    url: `/sys/field/delete?id=${id}`,
    method: 'post'
  })
}

// 批量删除字段集合
export function batchDeleteField(data: Array<number>) {
  return request({
    url: '/sys/field/batch-delete',
    method: 'post',
    data
  })
}
