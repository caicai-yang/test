import { VNode, Component } from 'vue'
import { ButtonProps, IconProps } from '@arco-design/web-vue'
import { IEnabled } from '@/types'
import {
  VxeTableDefines,
  VxeTablePropTypes,
  VxeTableDataRow,
  VxeColumnSlotTypes,
  SlotVNodeType,
  VxeColumnPropTypes
} from 'vxe-table'

const comparator = [
  'EQ',
  'NOT_EQ',
  'GT',
  'LT',
  'RIGHT_LIKE',
  'LIKE',
  'NOT_LIKE',
  'BETWEEN'
] as const

type IColumnDataType = 'BOOLEAN' | 'INTEGER' | 'DECIMAL' | 'STRING' | 'DATE' | 'DATETIME' | 'IMG' // 字典 SYS_FIELD_DATA_TYPE

export type IQueryParams = {
  currentPage: number
  pageSize: number
  keyword: string
  conditions: Array<{
    field: string
    comparator: (typeof comparator)[number]
    params: string[]
  }>
  sorts: Array<Record<string, 'ASC' | 'DESC'>>
  [key: string]: any
}

export type IOperationColumnButton<D = VxeTableDataRow> = Omit<ButtonProps, 'disabled'> & {
  visible?: boolean | ((params: VxeColumnSlotTypes.DefaultSlotParams<D>) => boolean)
  permission?: string
  disabled?: boolean | ((params: VxeColumnSlotTypes.DefaultSlotParams<D>) => boolean)
  icon?: string
  iconProps?: IconProps
  text?: string
  callback?: (params: VxeColumnSlotTypes.DefaultSlotParams<D>) => void
}

export type ITableColumnInfo<D = VxeTableDataRow> = {
  type?: VxeColumnPropTypes.Type
  field: keyof D | 'operation'
  title?: VxeColumnPropTypes.Title
  width?: VxeColumnPropTypes.Width
  minWidth?: VxeColumnPropTypes.MinWidth
  maxWidth?: VxeColumnPropTypes.MaxWidth
  resizable?: VxeColumnPropTypes.Resizable
  fixed?: VxeColumnPropTypes.Fixed
  align?: VxeColumnPropTypes.Align
  headerAlign?: VxeColumnPropTypes.HeaderAlign
  footerAlign?: VxeColumnPropTypes.FooterAlign
  showOverflow?: VxeColumnPropTypes.ShowOverflow
  showHeaderOverflow?: VxeColumnPropTypes.ShowHeaderOverflow
  showFooterOverflow?: VxeColumnPropTypes.ShowFooterOverflow
  className?: VxeColumnPropTypes.ClassName
  headerClassName?: VxeColumnPropTypes.HeaderClassName
  footerClassName?: VxeColumnPropTypes.FooterClassName
  formatter?: VxeColumnPropTypes.Formatter<D>
  sortable?: VxeColumnPropTypes.Sortable
  sortBy?: VxeColumnPropTypes.SortBy
  sortType?: VxeColumnPropTypes.SortType
  filters?: VxeColumnPropTypes.Filter[]
  filterMultiple?: VxeColumnPropTypes.FilterMultiple
  filterMethod?: VxeColumnPropTypes.FilterMethod<D>
  filterRender?: VxeColumnPropTypes.FilterRender
  treeNode?: VxeColumnPropTypes.TreeNode
  visible?: VxeColumnPropTypes.Visible
  exportMethod?: VxeColumnPropTypes.ExportMethod<D>
  footerExportMethod?: VxeColumnPropTypes.FooterExportMethod
  titlePrefix?: VxeColumnPropTypes.TitlePrefix
  titleSuffix?: VxeColumnPropTypes.TitleSuffix
  cellType?: VxeColumnPropTypes.CellType
  cellRender?: VxeColumnPropTypes.CellRender<D>
  editRender?: VxeColumnPropTypes.EditRender
  contentRender?: VxeColumnPropTypes.ContentRender
  params?: VxeColumnPropTypes.Params
  slots?: VxeColumnPropTypes.Slots<D>

  // 自定义属性
  slotName?: string
  render?:
    | ((params: VxeColumnSlotTypes.DefaultSlotParams<D>) => SlotVNodeType[] | SlotVNodeType)
    | null
  renderHeader?:
    | ((params: VxeColumnSlotTypes.HeaderSlotParams<D>) => SlotVNodeType[] | SlotVNodeType)
    | null
  dataType?: IColumnDataType
  comparators?: (typeof comparator)[number][]
  dictionaryCode?: string
  searchable?: IEnabled
  hasEditIcon?: IEnabled
  buttons?: IOperationColumnButton<D>[]
}

export type ISlotKey = keyof VxeColumnPropTypes.Slots

export type IDynamicHeaderItem = {
  title: string
  field: string
  dataType: IColumnDataType
  comparators: (typeof comparator)[number][]
  dictionaryCode: string
  searchable: IEnabled
  minWidth: number
  fixed: 'left' | 'right' | ''
  slotName: string
  hasEditIcon: IEnabled
  sortable: IEnabled
}
