import request from '@/utils/request'
/**
 * 自定义列
 */

interface GetList {
  id?: number | string
  tableName?: string
}

interface IField {
  name: string // 字段名称
  width?: string | number // 列宽
  freeze?: 'left' | 'right' | '' // 列的冻结状态，left：冻结在最左侧，right：冻结在最右侧，空字符串：不冻结
}

interface IConfig {
  showTableBorder: boolean | 0 | 1 // 是否显示表格边框
  showZebraStripe: boolean | 0 | 1 // 是否显示斑马纹
  candidateFields: IField[] // 可用字段
  displayFields: IField[] // 显示字段
}

interface Create {
  tableName: string // 字段集合名称
  name: string // 配置名称
  config: IConfig // 配置详情
  defaultConfig: number // 是否为默认配置
}

export interface Update {
  id: number | string
  name: string // 配置名称
  config: IConfig // 配置详情
  defaultConfig: number // 是否为默认配置
}

interface GetPageHeaderByNames {
  tableSchemeId: number | string
  displayFields: { name: string }[]
  locale?: string
}

// 查询配置
export function getSchemeList(params: GetList) {
  return request({
    url: '/sys/table-scheme/find',
    method: 'get',
    params
  })
}

// 创建配置
export function createScheme(data: Create) {
  return request({
    url: '/sys/table-scheme/create',
    method: 'post',
    data
  })
}

// 更新配置
export function updateScheme(data: Update) {
  return request({
    url: '/sys/table-scheme/update',
    method: 'post',
    data
  })
}

// 删除配置
export function deleteScheme(id: number | string) {
  return request({
    url: `/sys/table-scheme/delete?id=${id}`,
    method: 'post'
  })
}

// 获取指定字段列表的表头
export function getPageHeaderByNames(data: GetPageHeaderByNames) {
  return request({
    url: '/sys/page-header',
    method: 'post',
    data
  })
}
