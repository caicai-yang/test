export interface TableFiled {
  name: string
  title: string
  dataIndex: string
  width?: string // 字段宽度
  freeze?: 'left' | 'right' | '' // 是否冻结
}

export interface TableItem {
  sortKey: number
  id: string
  dataIndex: string
  label: string // 字典名称
  width?: string // 字段宽度
  freeze?: 'left' | 'right' | '' // 是否冻结
}

export interface Config {
  checked?: 0 | 1
  id: number
  name: string
}

export interface HeaderSettingConfig {
  tableColumns?: Array<any>
  wrapperBordered: 0 | 1
  bodyBordered: 0 | 1
}
