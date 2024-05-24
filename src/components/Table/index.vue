<template>
  <div v-if="hasFilterColumn && !hideImmediateQueryCheck" class="table-search-tips">
    <a-checkbox v-model="currentQueryParams[disabledImmediateQuery]">停用表头立即查询</a-checkbox>
  </div>
  <div id="components-table-container" :class="['flex1', className]" :style="style">
    <vxe-table
      :key="tableKey"
      ref="tableRef"
      auto-resize
      class="vxe-table-container"
      :max-height="height || '100%'"
      :min-height="minHeight"
      show-overflow="tooltip"
      show-header-overflow="tooltip"
      show-footer-overflow="tooltip"
      align="center"
      :data="data"
      :row-config="currentRowConfig"
      :expand-config="currentExpandConfig"
      :span-method="spanMethod"
      :border="vxeBorder"
      :stripe="vxeStripe"
      :checkbox-config="checkboxConfig"
      :radio-config="radioConfig"
      :tooltip-config="tooltipConfig"
      :tree-config="currentTreeConfig"
      :sort-config="sortConfig"
      :show-footer="summary"
      :show-header="showHeader"
      :footer-method="footerMethod"
      :loading="loading"
      :cell-style="cellStyle"
      :cell-class-name="cellClassName"
      :header-cell-class-name="headerCellClassName"
      :mouse-config="currentMouseConfig"
      :column-config="{ resizable: true }"
      v-bind="$attrs"
      @sort-change="handleSortChange"
      @cell-click="handleCellClick"
      @cell-selected="handleCellSelected"
      @checkbox-change="selectionChange"
      @radio-change="radioChange"
    >
      <!-- 拖拽按钮 -->
      <vxe-column v-if="draggable" width="50" :fixed="draggableFixed">
        <template #default>
          <span class="drag-btn">
            <icon-drag-arrow :size="20" />
          </span>
        </template>
        <template #header>
          <a-tooltip content="鼠标左键按住每行可以上下拖动排序">
            <icon-question-circle-fill :size="18" />
          </a-tooltip>
        </template>
      </vxe-column>
      <template v-for="(field, index) in visibleColumns" :key="index">
        <!-- S 支持分组表头 LK -->
        <template v-if="field.isColGroup">
          <vxe-colgroup
            :title="field.slotName === 'operation' ? '' : field.title"
            :fixed="field.slotName === 'operation' ? 'right' : ''"
          >
            <template v-for="infield in field.children" :key="infield.dataIndex">
              <TableColumn
                :field="infield"
                :visible-columns="visibleColumns"
                :query-params="queryParams"
                :tag-size="tagSize"
                is-col-group
                @header-filter="handleHeaderFilter"
              >
                <template
                  v-for="slotField in hasSlotNameColumns"
                  :key="slotField.slotName"
                  #[slotField.slotName]="{ data }"
                >
                  <slot :name="slotField.slotName" :data="data"></slot>
                </template>
                <!-- 合计行插槽 -->
                <template #summary-cell="{ data }">
                  <slot name="summary-cell" :data="data"></slot>
                </template>
              </TableColumn>
            </template>
          </vxe-colgroup>
        </template>
        <!-- E 支持分组表头 LK -->

        <template v-else>
          <TableColumn
            :field="field"
            :visible-columns="visibleColumns"
            :query-params="queryParams"
            :tag-size="tagSize"
            @header-filter="handleHeaderFilter"
          >
            <template
              v-for="slotField in hasSlotNameColumns"
              :key="slotField.slotName"
              #[slotField.slotName]="{ data }"
            >
              <slot :name="slotField.slotName" :data="data"></slot>
            </template>
            <!-- 合计行插槽 -->
            <template #summary-cell="{ data }">
              <slot name="summary-cell" :data="data"></slot>
            </template>
          </TableColumn>
        </template>
      </template>
      <!-- 空数据提示 -->
      <template #empty>
        <a-empty />
      </template>
      <template #loading> <a-spin tip="加载中" /> </template>
    </vxe-table>
    <!-- 表头设置按钮 -->
    <HeaderSetting
      v-if="customHeader"
      :left="settingIconLeft"
      :table-index="tableIndex"
      @update="updateTableHeader"
    />
  </div>
  <!-- 表格底部按钮和分页控制 -->
  <TableFooter
    v-if="showFooter"
    v-model:page="currentQueryParams.currentPage"
    v-model:page-size="currentQueryParams.pageSize"
    :total="total"
    :page-sizes="pageSizes"
    :jumper="jumper"
    :show-size-picker="showSizePicker"
    :show-refresh="showRefresh"
    :show-pagination="showPagination"
    :body-style="footerBodyStyle"
    @paginationChange="emits('paginationChange')"
  >
    <template #footer-button>
      <template v-if="showFooterButton">
        <a-button
          v-if="showSelectAllButton"
          type="primary"
          size="small"
          :disabled="buttonDisabled"
          @click="selectAll"
        >
          全选
        </a-button>
        <a-button
          v-if="showInvertButton"
          type="primary"
          size="small"
          :disabled="buttonDisabled"
          @click="revertSelection"
        >
          反选
        </a-button>
        <a-button
          v-if="showFooterDeleteButton"
          v-permission="batchDeletePermission"
          type="primary"
          size="small"
          :disabled="buttonDisabled || !selectionKeys.length"
          status="danger"
          @click="deleteAll"
        >
          批量删除
        </a-button>
      </template>

      <!-- 自定义按钮区域 -->
      <slot name="footer-button"></slot>
    </template>
    <template #pagination-left>
      <!-- 分页左边自定义区域 -->
      <slot name="pagination-left"></slot>
    </template>
  </TableFooter>
</template>
<script setup name="Table" lang="ts">
  import { ref, computed, toRef, getCurrentInstance, nextTick, watch, onUnmounted } from 'vue'
  import { VxeTable } from 'vxe-table'
  import type {
    VxeTablePropTypes,
    VxeTableConstructor,
    VxeTablePrivateMethods,
    VxeGridConstructor,
    VxeTableDefines,
    VxeTableEvents,
    VxeTableDataRow
  } from 'vxe-table'
  import type { VNodeStyle } from 'vxe-table/types/component'
  import type { HeaderSettingConfig } from '@/types/table'
  import { computedTotal } from '@/utils'
  import { flatByChildren } from '@/utils/plainTree'
  import { Props } from './props'
  import type { IColumn } from '@/types/common'
  import _ from 'lodash'
  import { pasteText, handleDeleteAll, radioConfig, tooltipConfig, sortConfig } from './utils/table'
  import Sortable from 'sortablejs'

  const props = defineProps(Props)

  const emits = defineEmits([
    'update:columns',
    'update:page',
    'update:pageSize',
    'paginationChange',
    'row-click',
    'cell-click',
    'header-click',
    'header-filter',
    'selection-change',
    'delete-all',
    'update:expandedKeys',
    'paste-end',
    'update:data',
    'select-all',
    'changeHeader'
  ])

  const { proxy } = getCurrentInstance() as any
  const currentQueryParams = toRef(props, 'queryParams')
  const className = toRef(props, 'class')

  const currentColumns = ref<any[]>([])

  const tableColumns = computed(() => {
    const _columns = currentColumns.value.length ? currentColumns.value : props.columns
    return _columns.filter(v => !v.hidden) // 过滤不需要显示的列
  })

  const visibleColumns = computed(() => {
    const indexColumn = {
      dataIndex: '_series',
      type: 'seq',
      title: '序号',
      width: props.indexWidth,
      fixed: 'left',
      resizable: true
    }
    const selectionColumn = {
      dataIndex: '_selection',
      type: isCheckbox.value ? 'checkbox' : 'radio',
      width: 50,
      fixed: 'left',
      resizable: false
    }

    const columns = _.cloneDeep(tableColumns.value)
    // 编辑字段且需要展示编辑按钮
    if (props.showEditIcon && props.pasteFields.length) {
      columns.map(header => {
        if (props.pasteFields.includes(header.dataIndex)) {
          header.hasEditIcon = true
          header.slotName = header.dataIndex
        } else {
          header.hasEditIcon = false
          delete header.slotName
        }
        return header
      })
    }
    // 自身排序字段
    if (props.selfSortFields.length) {
      columns.map(header => {
        if (props.selfSortFields.includes(header.dataIndex)) {
          header.isSortable = true
        }
        return header
      })
    }
    if (props.showIndex) {
      columns.unshift(indexColumn)
    }
    if (props.isSelection) {
      columns.unshift(selectionColumn)
    }

    return columns
  })

  // 有插槽的字段
  const hasSlotNameColumns = computed(() => {
    const columns = _.cloneDeep(visibleColumns.value)
    const slotNameColumns: any[] = []

    function handleColumns(data: IColumn<any>[]) {
      data.forEach((field: IColumn<any> & { editInSlotName?: string; children?: Array<any> }) => {
        // 这里需要分三种情况，一种是#default默认插槽，一种是需要自定义编辑以及自定义回显插槽，一种是只有自定义编辑插槽
        if (field.slotName && field.editInSlotName) {
          // 自定义编辑以及自定义回显
          slotNameColumns.push(field)
          const otherField = _.cloneDeep(field)
          otherField.slotName = otherField.editInSlotName
          slotNameColumns.push(otherField)
        } else if (field.slotName) {
          // #default默认插槽
          slotNameColumns.push(field)
        } else if (field.editInSlotName) {
          // 只有自定义编辑
          field.slotName = field.editInSlotName
          slotNameColumns.push(field)
        }

        if (field.children && field.children.length) {
          handleColumns(field.children)
        }
      })
    }

    handleColumns(columns)
    return slotNameColumns
  })

  // 表头是否有过滤字段
  const hasFilterColumn = computed(() => visibleColumns.value.some(v => v.filter || v.searchable))

  /**
   * 唯一key，用于可在接口请求中清除。注：不要更改。若必须更改时，需同时更改 @/utils/request/index.ts中对应的值
   * 将该字段加入到currentQueryParams中，是为了在页面点击表格顶部‘重置’按钮时，可重置该字段
   */
  const disabledImmediateQuery = `${new Date().getFullYear()}-${
    new Date().getMonth() + 1
  }-${new Date().getDate()}-disabledImmediateQuery###`

  const buttonDisabled = computed(() => !props.data.length)
  const currentWrapperBorder = ref<Boolean | String>('')
  const currentBodyBorder = ref<Boolean | String>('')

  watch(
    () => props.data,
    () => {
      if (!props.summary) {
        return
      }
      proxy.$refs.tableRef.updateFooter()
    },
    { deep: true }
  )

  // 展开/折叠树形表格
  watch(
    () => props.defaultExpandAllTree,
    val => {
      if (val) {
        proxy.$refs.tableRef.setAllTreeExpand(true)
      } else {
        proxy.$refs.tableRef.clearTreeExpand()
      }
    }
  )

  // 为复选框
  const isCheckbox = computed(() => props.rowSelection.type === 'checkbox')
  // 表格最小高度
  const minHeight = computed(() => (props.data.length ? 85 : 143))

  // vxe-table 行配置信息
  const currentRowConfig = computed(() => {
    const config: VxeTablePropTypes.RowConfig = {
      keyField: props.rowKeyAsKeyField ? props.rowKey : '_X_ROW_KEY',
      isHover: true,
      ...props.rowConfig
    }
    const hasImage = props.columns.some(item => item.dataType === 'IMG')
    hasImage && (config.height = 100)
    return config
  })

  // vxe-table 展开行配置
  const currentExpandConfig = computed(() => ({
    expandAll: props.defaultExpandAllRows,
    expandRowKeys: props.expandedKeys as string[],
    reserve: true,
    ...props.expandConfig
  }))

  // vxe-table 展开树配置
  const currentTreeConfig = computed(() => ({
    rowField: 'code',
    parentField: 'parentCode',
    expandAll: props.defaultExpandAllTree, // 默认初始化展开一次
    reserve: true,
    ...props.treeConfig
  }))

  // 块粘贴时, 需要支持 输入框文本selection 也粘贴，此时cell-click没触发
  const currentMouseConfig = computed<VxeTablePropTypes.MouseConfig | undefined>(() => {
    if (props.pasteFields.length) {
      return { selected: true }
    }
    return undefined
  })

  // vxe-table 边框
  const vxeOuterBorder = computed(() => {
    if (currentWrapperBorder.value !== '') {
      return currentWrapperBorder.value
    }
    return props.wrapperBordered
  })

  // vxe-table 边框
  const vxeBorder = computed(() => {
    // 显示所有边框
    if (vxeOuterBorder.value) {
      return 'full'
    }
    // 无边框
    return 'none'
  })

  // vxe-table 斑马纹
  const vxeStripe = computed(() => {
    if (currentBodyBorder.value !== '') {
      return !!currentBodyBorder.value
    }
    return !!props.bodyBordered
  })

  // vxe-table 复选框配置项
  const checkboxConfig = computed(() => ({
    // 默认勾选指定行
    checkRowKeys: props.selectedKeys as string[],
    showHeader: props.rowSelection.showCheckedAll,
    checkStrictly: props.rowSelection.checkStrictly,
    trigger: props.rowSelection.trigger,
    reserve: props.rowSelection.reserve
  }))

  const flatData = computed(() => {
    return flatByChildren(props.data)
  })

  // 表头设置按钮的左边位置
  const settingIconLeft = computed(() => (props.isSelection ? '15px' : 0))

  const currentCell = ref()
  function handleCellClick(data: any) {
    currentCell.value = data
    emits(
      'cell-click',
      data.row,
      { ...data.column, dataIndex: data.column.field },
      { rowIndex: data.rowIndex, columnIndex: data.columnIndex }
    )
    checkListenPaste(data)
  }

  function handleCellSelected(data: any) {
    currentCell.value = data
    checkListenPaste(data)
  }

  let hasPasteListener = false // 是否已有粘贴监听事件
  function checkListenPaste(data: any) {
    // 没有需要块粘贴的字段
    if (!currentPasteFields.value || !currentPasteFields.value.length) {
      hasPasteListener && proxy.$refs.tableRef?.$el.removeEventListener('paste', handlePaste)
      return
    }

    // 需要块粘贴
    if (currentPasteFields.value.includes(data.column.field)) {
      // 还没有监听粘贴事件
      if (!hasPasteListener) {
        hasPasteListener = true
        proxy.$refs.tableRef?.$el.addEventListener('paste', handlePaste)
      }
    } else if (hasPasteListener) {
      hasPasteListener = false
      proxy.$refs.tableRef?.$el.removeEventListener('paste', handlePaste)
    }
  }

  // 选中的行的key值(rowKey[])
  const selectionKeys = ref<Array<string | number>>([])
  // 选中的行
  const selectionRows = ref<any[]>([])

  // 通过rowKey选中指定行
  function selectRow(rowKey: string | string[]) {
    let rows = []
    // 通过rowKey获取对应行
    if (rowKey instanceof Array) {
      rows = isCheckbox.value
        ? rowKey.map(key => proxy.$refs.tableRef.getRowById(key))
        : [proxy.$refs.tableRef.getRowById(rowKey[0])]
    } else {
      rows = [proxy.$refs.tableRef.getRowById(rowKey)]
    }

    // 将对应行设置为选中状态
    if (isCheckbox.value) {
      proxy.$refs.tableRef.setCheckboxRow(rows, true)
      handleSelection(rows)
    } else {
      proxy.$refs.tableRef.setRadioRow(rows[0])
      radioChange({ row: rows[0] })
    }
  }

  // 全选
  function selectAll() {
    checkboxConfig.value.checkStrictly
      ? proxy.$refs.tableRef.setCheckboxRow(flatData.value, true)
      : proxy.$refs.tableRef.setAllCheckboxRow(true)

    selectionChange()
    emits('select-all')
  }

  // 反选
  function revertSelection() {
    if (!selectionKeys.value.length) {
      // 未选中行，则全选
      selectAll()
    } else {
      // 已有选中，则反选
      // 未选中的行
      const revertRows = flatData.value.filter(
        item => !selectionKeys.value.includes(item[props.rowKey])
      )

      // 清除所有选中的行
      proxy.$refs.tableRef.clearCheckboxRow()
      nextTick(() => {
        // 勾选原未选中的
        proxy.$refs.tableRef.setCheckboxRow(revertRows, true)
        selectionChange()
      })
    }
  }

  // 取消全选
  function clearAllSelection() {
    // 清除所有选中的行
    proxy.$refs.tableRef.clearCheckboxRow()
    selectionRows.value = []
    selectionKeys.value = []
    emits('selection-change', selectionKeys.value)
  }

  // 取消单选状态
  function clearRadioSelection() {
    // 清除单选选中的行
    proxy.$refs.tableRef.clearRadioRow()
    selectionRows.value = []
    selectionKeys.value = []
    emits('selection-change', selectionKeys.value)
  }

  // checkbox改变
  function selectionChange() {
    // trigger为row时，点击行会触发checkbox和radio的change事件，需做限制
    if (!isCheckbox.value) {
      return
    }
    // 获取表格所有选中的行
    const selectedRows = proxy.$refs.tableRef.getCheckboxRecords(true)
    handleSelection(selectedRows)
  }

  function handleSelection(data: any[]) {
    selectionRows.value = data
    selectionKeys.value = data.map((item: any) => item[props.rowKey])
    emits('selection-change', selectionKeys.value)
  }

  // radio 单选改变
  function radioChange({ row }: { row: any }) {
    // trigger为row时，点击行会触发checkbox和radio的change事件，需做限制
    if (isCheckbox.value) {
      return
    }
    selectionRows.value = [row]
    selectionKeys.value = [row[props.rowKey]]
    emits('selection-change', selectionKeys.value)
  }

  // 批量删除
  function deleteAll() {
    handleDeleteAll(props.isCustomBatchDelete, selectionKeys.value, emits)
  }

  // 表头查询
  function handleHeaderFilter() {
    if (currentQueryParams.value[disabledImmediateQuery]) {
      return
    }
    emits('header-filter')
  }

  const tableKey = ref('')
  // 更新表头
  function updateTableHeader(headerSetting: HeaderSettingConfig) {
    currentWrapperBorder.value = headerSetting.wrapperBordered ? true : false
    currentBodyBorder.value = headerSetting.bodyBordered ? true : false
    if (!headerSetting.tableColumns || !headerSetting.tableColumns.length) {
      return
    }
    let _currentColumns = JSON.parse(JSON.stringify(headerSetting.tableColumns))

    // 使用原表格中的column，主要为了运用上自定义的render、slotName等
    _currentColumns = _currentColumns.map((item: any) => {
      const originColumn = props.columns.find(v => v.dataIndex === item.dataIndex)
      if (!originColumn) {
        return item
      }

      originColumn.width = item.width
      originColumn.fixed = item.freeze
      return originColumn
    })

    const operation = props.columns.find(v => v.slotName === 'operation')
    if (operation) {
      _currentColumns.push(operation)
    }
    currentColumns.value = _currentColumns
    props.showEditIcon && emits('update:columns', currentColumns.value)
    emits('changeHeader')
    tableKey.value = new Date().getTime() + ''
  }

  // 单元格样式
  const cellStyle: VxeTablePropTypes.CellStyle = ({ column }) => {
    return props.columns.find(col => col.dataIndex === column.field)?.cellStyle as VNodeStyle
  }

  // 单元格类
  const cellClassName: VxeTablePropTypes.CellClassName = ({ column }) => {
    return props.columns.find(col => col.dataIndex === column.field)?.cellClass as any
  }

  // 表头单元格类
  const headerCellClassName: VxeTablePropTypes.HeaderCellClassName = ({ column }) => {
    return props.columns.find(col => col.dataIndex === column.field)?.headerCellClass as any
  }

  const summaryRecord = computed(() => {
    const record: any = {}
    if (props.isSelection) {
      record._selection = ''
    }
    if (props.showIndex) {
      record._series = props.summaryText
    }

    props.columns.forEach((column: any) => {
      const number = computedTotal(props.data, column.dataIndex)
      if (props.summaryData && props.summaryData.length) {
        record[column.dataIndex] =
          isNaN(number) || !props.summaryData.includes(column.dataIndex) ? '' : number
      } else {
        record[column.dataIndex] = isNaN(number) ? '' : number
      }
    })

    return record
  })

  // 总结行内容, 要求返回一个二维数组的表尾合计
  function footerMethod(params: {
    $table: VxeTableConstructor & VxeTablePrivateMethods
    $grid: VxeGridConstructor | null | undefined
    columns: VxeTableDefines.ColumnInfo[]
    data: any[]
  }) {
    if (props.footerMethod) {
      return props.footerMethod(params, Object.values(summaryRecord.value))
    }
    return [Object.values(summaryRecord.value)]
  }

  // 合并单元格
  const spanMethod: VxeTablePropTypes.SpanMethod<VxeTableDataRow> = params => {
    if (props.spanMethod) {
      return props.spanMethod(params)
    }
  }

  function resetSelection() {
    proxy.$refs.tableRef.clearCheckboxRow()
    selectionKeys.value = []
    selectionRows.value = []
    emits('selection-change', selectionKeys.value)
  }

  const handleSortChange: VxeTableEvents.SortChange = ({ $table }) => {
    const { fullData } = $table.getTableData()
    emits('update:data', fullData)
  }

  const currentTableData = toRef(props, 'data')

  // 表头可编辑字段（过滤与排序之后）
  const currentPasteFields = computed(() => {
    if (!props.pasteFields.length) {
      return []
    }
    const _columns = tableColumns.value
    /**
     * 过滤掉表头没有的字段，同时进行排序
     * 兼容自定义表头中减少显示字段或更改显示排序后的编辑字段数组
     */
    return props.pasteFields
      .filter(field => _columns.findIndex(v => v.dataIndex === field) > -1)
      .sort((a, b) => {
        return (
          _columns.findIndex(v => v.dataIndex === a) - _columns.findIndex(v => v.dataIndex === b)
        )
      })
  })

  function handlePaste(e: ClipboardEvent) {
    e.preventDefault()
    pasteText(
      e,
      currentCell.value,
      currentPasteFields.value,
      currentTableData.value,
      props.increaseRow,
      emits
    )
  }

  // 重新加载表格数据
  function reloadData() {
    proxy.$refs.tableRef.reloadData(props.data)
  }

  // 设置某行高亮
  function setCurrentRow(row: any) {
    proxy.$refs.tableRef.setCurrentRow(row)
  }

  // 跳转到对应行
  function scrollToRow(row: any) {
    proxy.$refs.tableRef.scrollToRow(row)
  }

  // 表格行拖拽事件
  const draggable = ref()
  function rowDrop() {
    const $table = proxy.$refs.tableRef
    draggable.value = Sortable.create(
      $table.$el.querySelector('.body--wrapper>.vxe-table--body tbody'),
      {
        handle: '.vxe-body--row',
        onEnd: (sortableEvent: any) => {
          const currentData = toRef(props, 'data')
          const newIndex = sortableEvent.newIndex as number
          const oldIndex = sortableEvent.oldIndex as number
          const currentRow = currentData.value.splice(oldIndex, 1)[0]
          currentData.value.splice(newIndex, 0, currentRow)

          // 重新加载表格数据，避免表格固定列位置错乱
          nextTick(() => {
            reloadData()
          })
        }
      }
    )
  }

  nextTick(() => {
    if (props.draggable) {
      rowDrop()
    }
  })

  onUnmounted(() => {
    hasPasteListener && proxy.$refs.tableRef?.$el.removeEventListener('paste', handlePaste)

    if (draggable.value) {
      draggable.value.destroy()
    }
  })

  defineExpose({
    selectionKeys,
    selectionRows,
    resetSelection,
    selectRow,
    selectAll,
    clearAllSelection,
    clearRadioSelection,
    reloadData,
    setCurrentRow,
    scrollToRow
  })
</script>
<style lang="less" scoped>
  #components-table-container {
    position: relative;
  }

  .table-search-tips {
    margin-top: -5px;
    text-align: right;
    :deep(.arco-checkbox) {
      font-size: 12px;
      .arco-checkbox-label {
        color: #9f9f9f;
        user-select: none;
      }
    }
  }

  :deep(.vxe-table--render-default .vxe-body--row.row--current) {
    background-color: #f7f8fa;
  }

  :deep(.vxe-table--render-default .vxe-body--column.col--selected) {
    box-shadow: none;
  }

  .vxe-table-container {
    .drag-btn {
      cursor: move;
    }
    .vxe-body--row.sortable-ghost,
    .vxe-body--row.sortable-chosen {
      background-color: #dfecfb;
    }
  }
</style>
