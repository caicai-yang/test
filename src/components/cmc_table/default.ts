import { VxeTableDefines, VxeTablePropTypes, VxeColumnPropTypes } from 'vxe-table'
import { ITableColumnInfo } from './type'

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
  checkStrictly: false, // 是否开启严格选择模式
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
