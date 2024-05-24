import { IS_MAC } from '@/utils/userAgent'
import type { VxeTableDataRow, VxeColumnProps, VxeTablePropTypes } from 'vxe-table'
import $Confirm from '@/plugins/Confirm'

/**
 * 表格文本块粘贴
 * @param e ClipboardEvent
 * @param currentCell 点击的单元格数据
 * @param pasteFields 可编辑字段
 * @param tableData 表格数据
 * @param increaseRow  是否需要自动递增表格行
 * @returns
 */
export function pasteText(
  e: ClipboardEvent,
  currentCell: { rowIndex: number; column: VxeColumnProps },
  pasteFields: string[],
  tableData: VxeTableDataRow[],
  increaseRow: boolean,
  emits: any,
  callback?: Function
) {
  // 光标不在当前表格
  if (!currentCell) {
    return
  }

  // 编辑行
  let rowIndex = currentCell.rowIndex
  // 获取粘贴板内容
  const pasteData = (e.clipboardData || (window as any).clipboardData).getData('text')

  // 光标区域不是需要粘贴的字段，则直接把粘贴内容赋值给当前区域
  if (!pasteFields.includes(currentCell.column.field as string)) {
    return
  }

  // 光标位置相对于可编辑字段的索引
  const columnIndex = pasteFields.findIndex(field => field === currentCell.column.field)

  // 按换行符切割, 再按制表符切割 => [[field1, field2], [], []]
  let list = pasteData.split(IS_MAC ? '\r' : '\r\n').map((item: string) => item.split('\t'))
  const lastRow = list[list.length - 1]
  if (lastRow instanceof Array && lastRow.length === 1 && lastRow[0] === '') {
    list = list.slice(0, list.length - 1)
  }

  // 从光标位置到可编辑字段结尾处的所有可编辑字段
  const editFields = pasteFields.slice(columnIndex)
  // 最大可复制列数
  const pasteColumnLength = Math.min(list[0].length, editFields.length)
  // 最终需要粘贴字段
  const _pasteFields = editFields.slice(0, pasteColumnLength)

  // 所有编辑行索引
  const rowIndexList = []

  while (list.length) {
    // 不需要自增时，超出表格行数后跳出循环
    if (!increaseRow && rowIndex + 1 > tableData.length) {
      break
    }
    if (!tableData[rowIndex] && increaseRow) {
      tableData[rowIndex] = {}
    }
    _pasteFields.forEach((field, index) => {
      tableData[rowIndex] && (tableData[rowIndex][field] = list[0][index].trim())
    })
    rowIndexList.push(rowIndex)
    list.shift()
    rowIndex++
  }
  /**
   * paste-end
   * rowIndexList: 当前粘贴数据行号数组
   * _pasteFields: 当前粘贴的字段数组
   */
  emits('paste-end', rowIndexList, _pasteFields)
  callback && callback(rowIndexList, _pasteFields)
}

// 批量删除
export function handleDeleteAll(
  isCustomBatchDelete: boolean,
  selectionKeys: (string | number)[],
  emits: any
) {
  if (isCustomBatchDelete) {
    emits('delete-all', selectionKeys)
    selectionKeys = []
    return
  }
  $Confirm({
    title: '删除确认',
    content: '是否确认批量删除所选中的所有数据，该操作无法撤销，请谨慎操作！',
    onOk: () => {
      emits('delete-all', selectionKeys)
      selectionKeys = []
    }
  })
}

// vxe-table 单选按钮配置项
export const radioConfig: VxeTablePropTypes.RadioConfig = {
  strict: true,
  trigger: 'row'
}

// vxe-table tooltip配置项
export const tooltipConfig: VxeTablePropTypes.TooltipConfig = {
  enterDelay: 100
}

// vxe-table 表头自身排序配置
export const sortConfig: VxeTablePropTypes.SortConfig = {
  trigger: 'cell'
}
// vxe-table 序号重新计算拼接
export function calcSeq(seq: string, beforeSizes: number) {
  // 找到字符串小数点的索引
  const index = seq.indexOf('.')
  if (index < 0) {
    return Number(seq) + beforeSizes
  }
  // 截取小数点前面的整数
  const pointBefore = seq.slice(0, index)
  // 截图小数点及小数点后面的数(字符串)
  const pointAfter = seq.slice(index)
  // 整数先相加，再拼接小数点及小数点后面的数
  return Number(pointBefore) + beforeSizes + pointAfter
}
