import { VxeTableDefines, VxeTablePropTypes, VxeColumnPropTypes } from 'vxe-table'
import { ButtonProps, IconProps } from '@arco-design/web-vue'
import { IQueryParams, ITableColumnInfo, IPaginationConfig, ITableFooterButtonConfig } from './type'

export const defaultQueryParams: IQueryParams = {
  currentPage: 1,
  pageSize: 20,
  keyword: '',
  conditions: [],
  sorts: []
}

export type PartialColumnInfo = Omit<ITableColumnInfo, 'field' | 'type'>

export type ISelectionColumnConfig = PartialColumnInfo & {
  field?: '_selection'
  type: 'checkbox' | 'radio' | null
}

export type ISeqColumnConfig = PartialColumnInfo & {
  field?: '_series'
  type: 'seq' | null
}

export const defaultCheckboxConfig: VxeTablePropTypes.CheckboxConfig = {
  showHeader: false, // 是否展示全选按钮
  checkStrictly: false, // 是否开启严格选择模式(父子互不关联)
  checkRowKeys: undefined, // 默认指定勾选行, 需配置row-config.keyField
  reserve: false, // 是否保留勾选
  trigger: 'row' // 复选框勾选模式
}

export const defaultSelectionColumnConfig: ISelectionColumnConfig = {
  field: '_selection',
  type: null,
  width: 50,
  fixed: 'left',
  resizable: false
}

// 序号列计算规则: 1.10 + 前面页总数(比如20) => '20' + '1.10'= '21.10'
export const defaultSeqColumnConfig: ISeqColumnConfig = {
  field: '_series',
  title: '序号',
  type: null,
  width: 80,
  fixed: 'left',
  resizable: true,
  treeNode: true
}

export const defaultButtonProps: ButtonProps = {
  type: 'text',
  size: 'mini',
  shape: 'square',
  status: 'normal'
}

export const defaultIconProps: IconProps = {
  size: 18,
  style: 'color: rgb(var(--danger-6))'
}

export const defaultPaginationConfig: IPaginationConfig = {
  total: 0,
  baseSize: 3,
  size: 'small',
  showPageSize: true,
  pageSizeOptions: [20, 50, 100, 200],
  showJumper: true,
  showTotal: true
}

export const defaultTableFooterButtonConfig: ITableFooterButtonConfig = {
  selectAllButtonVisible: true,
  invertButtonVisible: true,
  deleteButtonVisible: true,
  deleteButtonPermission: ''
}
