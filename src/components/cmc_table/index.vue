<template>
  <div class="table-wrapper" v-bind="wrapperAttrs">
    <vxe-grid
      ref="tableRef"
      class="vxe-table-container"
      show-overflow="tooltip"
      show-header-overflow="tooltip"
      show-footer-overflow="tooltip"
      align="center"
      auto-resize
      border="full"
      :max-height="height"
      :data="currentData"
      :columns="renderColumns"
      :expandConfig="{ reserve: true, ...expandConfig }"
      :checkbox-config="{ ...defaultCheckboxConfig, ...checkboxConfig }"
      :tree-config="treeConfig"
      :seq-config="seqConfig"
      v-bind="tableAttrs"
    />
  </div>
</template>

<script setup lang="tsx" name="index">
  import { ref, toRef, useAttrs, useSlots, computed, PropType } from 'vue'
  import { VxeTableDefines, VxeTablePropTypes, VxeColumnPropTypes } from 'vxe-table'
  import { Button } from '@arco-design/web-vue'
  import _ from 'lodash'
  import {
    defaultCheckboxConfig,
    defaultSelectionColumnConfig,
    defaultSeqColumnConfig,
    ISelectionColumnConfig,
    ISeqColumnConfig
  } from './default'

  import { ITableColumnInfo, ISlotKey, IQueryParams } from './type'

  const props = defineProps({
    height: {
      type: String,
      default: '100%'
    },
    queryParams: {
      type: Object as PropType<IQueryParams>,
      default: () => ({
        currentPage: 1,
        pageSize: 20,
        keyword: '',
        conditions: [],
        sorts: []
      })
    },
    data: {
      type: Array as PropType<Array<Record<string, any>>>,
      default: () => []
    },
    columns: {
      type: Array as PropType<ITableColumnInfo[]>,
      default: () => []
    },
    expandConfig: {
      type: Object as PropType<VxeTablePropTypes.ExpandConfig>,
      default: () => ({})
    },
    selectionColumnConfig: {
      type: Object as PropType<ISelectionColumnConfig>,
      default: () => defaultSelectionColumnConfig
    },
    seqColumnConfig: {
      type: Object as PropType<ISeqColumnConfig>,
      default: () => defaultSeqColumnConfig
    },
    checkboxConfig: {
      type: Object as PropType<VxeTablePropTypes.CheckboxConfig>,
      default: () => defaultCheckboxConfig
    },
    treeConfig: {
      type: Object as PropType<VxeTablePropTypes.TreeConfig>,
      default: () => ({})
    }
  })

  const emits = defineEmits([])

  const attrs = useAttrs()

  const $slots = useSlots()

  const names = ['class', 'style']

  // table-wrapper attrs
  const wrapperAttrs = _.pick(attrs, names)

  // table attrs
  const tableAttrs = _.omit(attrs, names)

  const currentData = toRef(props, 'data')
  const currentColumns = toRef(props, 'columns')
  const currentQueryParams = toRef(props, 'queryParams')

  const dynamicHeader = ref([])

  // TODO: 渲染按钮
  function renderButton() {}

  const operationColumns = computed(() => {
    const operation = props.columns.find(item => item.field === 'operation')
    if (operation) {
      const { buttons } = operation
    }
    return operation
  })

  /**
   * 处理 columns 得到要渲染的 columns
   * {field, render, renderHeader, slotName, slots} => {field, slots: {default: slots.default ?? render ?? slotName, title: slots.title ?? renderHeader}}
   * @param columns
   * @param isFind 补上动态表头缺失字段
   */
  function handleParseColumns(columns: ITableColumnInfo[], isFind = false) {
    if (isFind) {
      columns.forEach(item => {
        const find = props.columns.find(column => column.field === item.field)
        find && Object.assign(item, find)
      })
    }

    const parseColumns = columns.map(item => {
      const { slots, slotName, render, renderHeader } = item
      const tempSlots: VxeColumnPropTypes.Slots = {}
      if (typeof render === 'function') {
        tempSlots.default = params => render(params)
      }

      if (typeof renderHeader === 'function') {
        tempSlots.header = params => renderHeader(params)
      }

      if (slotName && typeof slotName === 'string' && $slots[slotName]) {
        tempSlots.default = $slots[slotName]
      }

      if (slots && Object.keys(slots).length) {
        Object.keys(slots).forEach(slot => {
          if (typeof slots[slot as ISlotKey] === 'string') {
            slots[slot as ISlotKey] = $slots[slots[slot as ISlotKey] as string]
          }
        })
      }

      return {
        ...item,
        slots: {
          ...tempSlots,
          ...slots
        }
      }
    })

    if (props.seqColumnConfig.type) {
      parseColumns.unshift({
        ...defaultSeqColumnConfig,
        ...props.seqColumnConfig
      } as any)
    }

    if (props.selectionColumnConfig.type) {
      parseColumns.unshift({
        ...defaultSelectionColumnConfig,
        ...props.selectionColumnConfig
      } as any)
    }

    return parseColumns
  }

  const renderColumns = computed(() => {
    return dynamicHeader.value.length
      ? handleParseColumns(dynamicHeader.value, true)
      : handleParseColumns(currentColumns.value, false)
  })

  const seqConfig: VxeTablePropTypes.SeqConfig = {
    seqMethod({ seq }: any) {
      const { currentPage, pageSize } = currentQueryParams.value
      const index = seq.indexOf('.')
      const preSeq = (currentPage - 1) * pageSize
      if (index === -1) return preSeq + Number(seq)
      return preSeq + Number(seq.slice(0, index)) + seq.slice(index)
    }
  }
</script>

<style lang="less" scoped>
  .table-wrapper {
    position: relative;
    flex: 1;
    min-height: 0;
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
