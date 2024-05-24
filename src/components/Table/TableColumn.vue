<template>
  <vxe-column
    :field="field.dataIndex"
    :title="field.title"
    :min-width="field.minWidth || field.width || '100'"
    :width="['_selection', '_series'].includes(field.dataIndex) ? field.width : ''"
    :formatter="field.formatter"
    :tree-node="field.dataIndex === treeNodeIndex"
    :fixed="isColGroup ? '' : field.fixed || (field.slotName === 'operation' ? 'right' : '')"
    :align="field.align || 'center'"
    :header-align="field.align || 'center'"
    :type="field.type"
    :resizable="field.resizable ?? true"
    :sortable="field.isSortable"
    :edit-render="field.editRender"
  >
    <!-- 新增:edit-render="field.editRender" by LK -->
    <template #header>
      <TableTh
        :column="field"
        :query-params="queryParams"
        @filter="(filter: any) => toFilter(filter)"
      />
    </template>

    <!-- S 单元格点击编辑列 by LK -->
    <template
      v-if="field.editSlotName === 'cell_click_edit_column'"
      #edit="{ row, rowIndex, columnIndex }"
    >
      <slot
        :name="field.editInSlotName"
        :data="{ record: row, column: field, rowIndex, columnIndex }"
      ></slot>
    </template>
    <!-- E 单元格点击编辑列 by LK -->

    <!-- 操作列 -->
    <template v-if="field.slotName === 'operation'" #default="{ row, rowIndex }">
      <a-space size="mini" class="operation-button">
        <template v-for="(button, idx) in field.buttons">
          <a-button
            v-if="typeof button.isShow === 'function' ? button.isShow(row) : button.isShow ?? true"
            :key="idx"
            v-permission="button.permission || ''"
            :type="button.type || 'text'"
            :size="button.size || 'mini'"
            :shape="button.shape || 'square'"
            :status="button.status || ''"
            :disabled="
              typeof button.disabled === 'function'
                ? button.disabled(row, field, rowIndex)
                : button.disabled
            "
            @click.stop="button.callback({ record: row, column: field, rowIndex })"
          >
            <template v-if="button.icon" #icon>
              <component
                :is="button.icon"
                v-bind="
                  button.iconProps ?? {
                    size: 18,
                    style: { color: 'rgb(var(--danger-6))' }
                  }
                "
              />
            </template>
            {{ button.text }}
          </a-button>
        </template>
      </a-space>
    </template>
    <!-- 序号列 -->
    <template v-else-if="field.dataIndex === '_series'" #default="{ seq }">
      {{ calcSeq(seq, beforeSizes) }}
    </template>
    <!-- 显示内容 -->
    <template v-else #default="{ row, rowIndex, columnIndex }">
      <!-- 自定义插槽内容 -->
      <slot
        v-if="field.slotName"
        :name="field.slotName"
        :data="{ record: row, column: field, rowIndex, columnIndex }"
      ></slot>
      <!-- 其他显示 -->
      <TableTd v-else :column="field" :record="row" :row-index="rowIndex" :tag-size="tagSize" />
    </template>

    <template v-if="$slots['summary-cell']" #footer="{ column, items, $rowIndex }">
      <slot
        name="summary-cell"
        :data="{
          column: { ...column, dataIndex: column.field },
          record: items[$rowIndex],
          recordIndex: $rowIndex
        }"
      ></slot>
    </template>
  </vxe-column>
</template>

<script setup name="TableColumn" lang="ts">
  import { toRef, computed, PropType } from 'vue'
  import { calcSeq } from './utils/table'
  import type { Condition, Sort, IColumns } from '@/types/common'
  import { VxeColumn } from 'vxe-table'

  const props = defineProps({
    // 行数据
    field: {
      type: Object as PropType<any>,
      default: () => {}
    },
    // 显示的列字段
    visibleColumns: {
      type: Array as PropType<IColumns<any>>,
      default: () => []
    },
    // 表格的查询条件
    queryParams: {
      type: Object,
      default: () => ({
        currentPage: 1,
        pageSize: 10,
        conditions: [] as Array<object>,
        sorts: [] as Array<object>
      })
    },
    // 标签大小
    tagSize: {
      type: String as PropType<'medium' | 'small' | 'large' | undefined>,
      default: 'medium'
    },
    // 是否为分组表格
    isColGroup: {
      type: Boolean,
      default: false
    }
  })

  const emits = defineEmits(['header-filter'])
  const currentQueryParams = toRef(props, 'queryParams')

  // 当页之前数据总条数
  const beforeSizes = computed(() =>
    currentQueryParams.value.currentPage > 0 && currentQueryParams.value.pageSize > 0
      ? (currentQueryParams.value.currentPage - 1) * currentQueryParams.value.pageSize
      : 0
  )

  // vxe-table 指定的树节点
  const treeNodeIndex = computed(() => {
    const _columns = props.visibleColumns.filter(v => v.dataIndex !== '_selection')
    if (!_columns.length) {
      return ''
    }

    let _data = [] as { dataIndex: string; isTreeNode: Boolean }[]
    _columns.some(v => {
      if (v.isTreeNode) {
        _data = [v] as any[]
        return true
      }
    })
    return _data.length ? _data[0].dataIndex : _columns[0].dataIndex
  })

  // 表格过滤查询
  function toFilter({ conditions, sort }: { conditions: Condition[]; sort: Sort }) {
    // 过滤掉包含当前字段的查询条件
    const currentConditions = currentQueryParams.value.conditions.filter(
      (v: Condition) => v.field !== sort.field
    )

    // 没有查询条件，直接赋值过滤后的数据
    if (!conditions.length) {
      currentQueryParams.value.conditions = currentConditions
    } else {
      currentQueryParams.value.conditions = [...currentConditions, ...conditions]
    }

    // 过滤掉包含当前字段的排序条件
    const currentSort = currentQueryParams.value.sorts.filter((v: Sort) => v.field !== sort.field)

    // 没有排序条件，直接赋值过滤后的数据
    if (!sort.order) {
      currentQueryParams.value.sorts = currentSort
    } else {
      currentQueryParams.value.sorts = [...currentSort, sort]
    }
    emits('header-filter')
  }
</script>

<style lang="less" scoped>
  .operation-button {
    :deep(.arco-btn-text) {
      padding: 0 1px;
    }
  }
</style>
