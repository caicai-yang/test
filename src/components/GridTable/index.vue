<template>
  <div id="components-table-container" :class="['flex1', className]" :style="style">
    <vxe-grid
      ref="tableRef"
      auto-resize
      border
      class="vxe-table-container"
      max-height="100%"
      show-overflow="tooltip"
      show-header-overflow="tooltip"
      show-footer-overflow="tooltip"
      align="center"
      :loading="loading"
      :data="data"
      :column-config="{ resizable: true }"
      :footer-method="footerMethod"
      v-bind="$attrs"
      @cell-click="handleCellClick"
      @cell-selected="handleCellSelected"
    >
      <template #loading> <a-spin tip="加载中" /> </template>
    </vxe-grid>
  </div>
  <div>
    <slot name="footer-button"></slot>
  </div>
</template>

<script setup name="GridTable" lang="ts">
  import { toRef, computed, ref, getCurrentInstance, onUnmounted } from 'vue'
  import XEUtils from 'xe-utils'
  import { computedTotal } from '@/utils'
  import type { PropType, StyleValue } from 'vue'
  import type {
    VxeTableConstructor,
    VxeTablePrivateMethods,
    VxeGridConstructor,
    VxeTableDefines
  } from 'vxe-table'
  import type { IColumns } from '@/types/common'
  import type { TableData } from '@arco-design/web-vue'
  import { pasteText } from '@/components/Table/utils/table'

  const props = defineProps({
    loading: {
      type: Boolean,
      default: false
    },
    style: {
      type: [String, Array, Object] as PropType<StyleValue>,
      default: ''
    },
    class: {
      type: [String, Array, Object] as PropType<any>,
      default: ''
    },
    footerMethod: {
      type: Function,
      default: null
    },
    // 表格的数据
    data: {
      type: Array as PropType<TableData[]>,
      default: () => []
    },
    // 表格的列描述信息
    columns: {
      type: Array as PropType<IColumns<any>>,
      default: () => []
    },
    // 块粘贴字段集合
    pasteFields: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    /**
     * 是否需要自动递增表格行
     * 主要用于块粘贴中，复制文本行数大于表格现有行数，且允许表格根据复制行数增加行的情况
     */
    increaseRow: {
      type: Boolean,
      default: false
    }
  })

  const emits = defineEmits(['cell-click', 'paste-end'])
  const { proxy } = getCurrentInstance() as any

  const className = toRef(props, 'class')

  const currentTableData = toRef(props, 'data')

  const currentColumns = ref<any[]>([])

  const tableColumns = computed(() => {
    const _columns = currentColumns.value.length ? currentColumns.value : props.columns
    return _columns.filter(v => !v.hidden) // 过滤不需要显示的列
  })

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
      .filter(field => {
        return _columns.filter(v => {
          if (v.children?.length) {
            return v.children.findIndex(v => v.field === field) > -1
          }
          return v.field === field
        })
      })
      .sort((a, b) => {
        return _columns.findIndex(v => v.field === a) - _columns.findIndex(v => v.field === b)
      })
  })

  const tableRef: any = ref()

  // 总结行内容, 要求返回一个二维数组的表尾合计
  function footerMethod(params: {
    $table: VxeTableConstructor & VxeTablePrivateMethods
    $grid: VxeGridConstructor | null | undefined
    columns: VxeTableDefines.ColumnInfo[]
    data: any[]
  }) {
    const defaultRecord: any = {}
    XEUtils.eachTree(params.columns, column => {
      if (!column.field) {
        return
      }
      const number = computedTotal(params.data, column.field)
      defaultRecord[column.field] = isNaN(number) ? '' : number
    })
    if (props.footerMethod) {
      return props.footerMethod(params, Object.values(defaultRecord))
    }
    return [Object.values(defaultRecord)]
  }

  const currentCell = ref()
  // 点击单元格
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

  onUnmounted(() => {
    hasPasteListener && proxy.$refs.tableRef?.$el.removeEventListener('paste', handlePaste)
  })

  defineExpose({
    tableRef
  })
</script>
<style lang="less" scoped>
  #components-table-container {
    position: relative;
  }

  :deep(.vxe-table--render-default .vxe-body--row.row--current) {
    background-color: #f7f8fa;
  }

  :deep(.vxe-table--render-default .vxe-body--column.col--selected) {
    box-shadow: none;
  }
</style>
