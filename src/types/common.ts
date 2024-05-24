import { Component, VNodeChild } from 'vue'
import { ButtonProps, IconProps, TableColumnData } from '@arco-design/web-vue'

export interface Conditions {
  field: String
  comparator: String
  params: Array<String | Number>
}

export interface Sorts {
  field: String
  order: 'DESC' | 'ASC'
}

// 0: 禁用, 1: 启用
export type IEnabled = 0 | 1
export type EditType = 'isAdd' | 'isEdit' | 'isRead'

export type IParams = {
  currentPage: number
  pageSize: number
  keyword: string
  conditions: any[]
  sorts: any[]
}

// list接口全局类型
export interface GlobalListInterface {
  currentPage: Number
  pageSize: Number
  keyword?: String
  conditions?: Array<Conditions>
  sorts?: Array<Sorts>
}

// 字段搜索条件
export interface Condition {
  field: String
  comparator: String
  params: Array<String>
}

export interface Sort {
  field: String
  order: String
}

export interface Dictionary {
  name: string
  value: string | number
  color?: string
  bordered?: boolean
}

export interface TableButton<T> extends Omit<ButtonProps, 'disabled'> {
  icon?: Component | string
  iconProps?: IconProps & { style: any }
  text?: string
  permission?: string
  isShow?: ((record: T) => boolean) | boolean
  disabled?: ((record: T, column: TableColumnData, rowIndex: number) => boolean) | boolean
  callback: (data: { record: T; column: TableColumnData; rowIndex: number }) => void
}

export type IProgressStatus = 'primary' | 'warning' | 'success' | 'info' | 'danger'

export type IGroupList = Array<{ id: number; groupName: string }>

const comparator = ['EQ', 'NOT_EQ', 'GT', 'LT', 'LIKE', 'NOT_LIKE'] as const

export interface IColumn<T extends object> extends Omit<TableColumnData, 'dataIndex' | 'render'> {
  title: string // 标题
  dataIndex: keyof T | 'operation' // column 的唯一标识
  searchable?: boolean // 是否过滤
  filter?: boolean // 是否过滤
  tip?: string // 提示内容
  required?: boolean // 是否必填
  dictionaryCode?: string // 字典
  comparators?: (typeof comparator)[number][] // 筛选项
  dataType?: 'BOOLEAN' | 'INTEGER' | 'DECIMAL' | 'STRING' | 'DATE' | 'DATETIME' | 'IMG' // 字典 SYS_FIELD_DATA_TYPE
  buttons?: Array<TableButton<T>>
  hidden?: boolean // 是否隐藏
  isTreeNode?: boolean // 是否树节点
  render?: (data: { record: T; column: TableColumnData; rowIndex: number }) => VNodeChild
}

export type IColumns<T extends object> = IColumn<T>[]
