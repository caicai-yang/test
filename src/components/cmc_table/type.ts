import { VNode, Component } from 'vue'
import { ButtonProps, IconProps, PaginationProps } from '@arco-design/web-vue'
import { IEnabled } from '@/types'
import {
  VxeTableDefines,
  VxeTablePropTypes,
  VxeTableDataRow,
  VxeColumnSlotTypes,
  SlotVNodeType,
  VxeColumnPropTypes,
  VxeTableProDefines,
  VxeTableConstructor,
  VxeTablePrivateMethods,
  VxeGridConstructor
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
  keyword?: string
  conditions?: Array<{
    field: string
    comparator: (typeof comparator)[number]
    params: string[]
  }>
  sorts?: Array<Record<string, 'ASC' | 'DESC'>>
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

export interface ClipConfig<DT = VxeTableDataRow> {
  /**
   * 是否启用粘贴功能
   */
  isPaste?: boolean
  /**
   * 是否填充粘贴，如果启用了，当被选取的粘贴单元格与粘贴单元格的行与列数量不匹配时，会将内容强制粘贴所选的单元格
   */
  isFillPaste?: boolean
  /**
   * 是否启用行自增，当粘贴的行数超出表格时自动插入新行
   */
  isRowIncrement?: boolean
  /**
   * 是否启用列自增，当粘贴的列数超出表格时自动插入新列（需要注意自增的列自字段是否定义，否则将无法响应）
   */
  isColumnIncrement?: boolean
  /**
   * 用于指定哪些列允许被复制粘贴
   */
  includeFields?: string[]
  /**
   * 用于排除指定列允许不允许被复制粘贴
   */
  excludeFields?: string[]
  /**
   * 重写单元格粘贴赋值的方法，从剪贴板赋值到单元格
   */
  pasteMethod?(params: {
    isCut: boolean
    row: DT
    column: VxeTableDefines.ColumnInfo<DT>
    cellValue: any
    $table: VxeTableConstructor<DT> & VxeTablePrivateMethods<DT>
    $grid: VxeGridConstructor<DT> | null | undefined
  }): void
  /**
   * 自定义单元格粘贴赋值之前的方法，可以通过返回 false 阻止复制行为
   */
  beforePasteMethod?(params: {
    isCut: boolean
    activeArea: VxeTableProDefines.MouseActiveCellArea
    cutAreas: VxeTableProDefines.CellAreaParams<DT>[]
    currentAreas: VxeTableProDefines.CellAreaParams<DT>[]
    targetAreas: VxeTableProDefines.CellAreaParams<DT>[]
    cellValues: string[][]
    pasteCells: string[][]
    $table: VxeTableConstructor<DT> & VxeTablePrivateMethods<DT>
    $grid: VxeGridConstructor<DT> | null | undefined
  }): boolean
  /**
   * 自定义单元格粘贴赋值之后的方法
   */
  afterPasteMethod?(params: {
    isCut: boolean
    currentAreas: VxeTableProDefines.CellAreaParams<DT>[]
    cutAreas: VxeTableProDefines.CellAreaParams<DT>[]
    targetAreas: VxeTableProDefines.CellAreaParams<DT>[]
    cellValues: any[][]
    pasteCells: string[][]
    insertRows: DT[]
    insertColumns: VxeTableDefines.ColumnInfo<DT>[]
    $table: VxeTableConstructor<DT> & VxeTablePrivateMethods<DT>
    $grid: VxeGridConstructor<DT> | null | undefined
  }): boolean
  /**
   * 只对 isRowIncrement 有效，自定义创建自增行数据的方法
   */
  createRowsMethod?(params: {
    currentAreas: VxeTableProDefines.CellAreaParams<DT>[]
    targetAreas: VxeTableProDefines.CellAreaParams<DT>[]
    cellValues: any[][]
    pasteCells: string[][]
    insertRows: DT[]
    $table: VxeTableConstructor<DT> & VxeTablePrivateMethods<DT>
    $grid: VxeGridConstructor<DT> | null | undefined
  }): DT[]
  /**
   * 只对 isColumnIncrement 有效，自定义创建自增列配置的方法
   */
  createColumnsMethod?(params: {
    currentAreas: VxeTableProDefines.CellAreaParams<DT>[]
    targetAreas: VxeTableProDefines.CellAreaParams<DT>[]
    cellValues: any[][]
    pasteCells: string[][]
    insertColumns: VxeTableDefines.ColumnOptions[]
    $table: VxeTableConstructor<DT> & VxeTablePrivateMethods<DT>
    $grid: VxeGridConstructor<DT> | null | undefined
  }): VxeTableDefines.ColumnOptions<DT>[]
}

export type IPaginationConfig = Omit<PaginationProps, 'total'> & { total: number }

export type ITableFooterButtonConfig = {
  selectAllButtonVisible?: boolean
  invertButtonVisible?: boolean
  deleteButtonVisible?: boolean
  deleteButtonPermission?: string
}
