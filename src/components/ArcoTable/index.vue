<template>
  <div id="components-table-container" :class="['flex1', className]" :style="style">
    <a-table
      ref="tableRef"
      v-model:expandedKeys="allExpandedKeys"
      style="height: 100%"
      :columns="tableColumns"
      :data="data"
      :pagination="pagination"
      :row-selection="currentRowSelection"
      column-resizable
      :bordered="tableBordered"
      :stripe="tableStripe"
      :row-key="rowKey"
      :selected-keys="selectedKeys"
      :loading="loading"
      :hide-expand-button-on-empty="hideExpandButtonOnEmpty"
      :indent-size="30"
      :scroll="
        $attrs.scroll || {
          y: tableHeight > 0 ? tableHeight : 'auto',
          maxHeight: tableHeight > 0 ? tableHeight : '100%'
        }
      "
      v-bind="$attrs"
      @row-click="emits('row-click', $event)"
      @cell-click="(record, column) => emits('cell-click', record, column)"
      @header-click="emits('header-click', $event)"
      @selection-change="selectionChange"
      @select="select"
      @page-change="emits('page-change', $event)"
      @page-size-change="emits('page-size-change', $event)"
    >
      <template #th="{ column }">
        <ArcoTableTh
          :column="column"
          :query-params="queryParams"
          @filter="(filter: any) => toFilter(filter)"
        />
      </template>
      <template #td="{ column, record }">
        <ArcoTableTd :column="column" :record="record" />
      </template>
      <template #expand-icon="{ expanded }">
        <icon-caret-down v-if="expanded" />
        <icon-caret-right v-else />
      </template>
      <template #operation="{ record, column, rowIndex }">
        <a-space size="mini" class="operation-button">
          <template v-for="(button, index) in column.buttons">
            <a-button
              v-if="
                typeof button.isShow === 'function' ? button.isShow(record) : button.isShow ?? true
              "
              :key="index"
              v-permission="button.permission || ''"
              :type="button.type || 'text'"
              :size="button.size || 'mini'"
              :shape="button.shape || 'square'"
              :status="button.status || ''"
              :disabled="
                typeof button.disabled === 'function'
                  ? button.disabled(record, column, rowIndex)
                  : button.disabled
              "
              @click="button.callback({ record, column, rowIndex })"
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
      <template v-for="item in dynamicSlots" #[item.slotName]="{ record, column, rowIndex }">
        <slot :name="item.slotName" :data="{ record, column, rowIndex }"></slot>
      </template>

      <!-- 总结行 -->
      <template v-if="$slots['summary-cell']" #summary-cell="{ record, column, rowIndex }">
        <slot name="summary-cell" :data="{ record, column, rowIndex }"></slot>
      </template>
    </a-table>
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
    v-if="showFooter && !pagination"
    v-model:page="currentQueryParams.currentPage"
    v-model:page-size="currentQueryParams.pageSize"
    :total="total"
    :page-sizes="pageSizes"
    :jumper="jumper"
    :show-size-picker="showSizePicker"
    :show-refresh="showRefresh"
    :show-pagination="showPagination"
    @paginationChange="emits('paginationChange')"
  >
    <template v-if="showFooterButton" #footer-button>
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
      <!-- 自定义按钮区域 -->
      <slot name="footer-button"></slot>
    </template>
    <template #pagination-left>
      <!-- 分页左边自定义区域 -->
      <slot name="pagination-left"></slot>
    </template>
  </TableFooter>
</template>

<script setup name="ArcoTable" lang="ts">
  import { ref, computed, toRef, getCurrentInstance, PropType, watchEffect } from 'vue'
  import { useComponentInited } from '@/hooks'
  import type { StyleValue } from 'vue'
  import type { TableData } from '@arco-design/web-vue'
  import type { Condition, Sort } from '@/types/common'
  import type { HeaderSettingConfig } from '@/types/table'
  import { getExpandAndSelectKeysByTree, mapKeys, flatByChildren } from '@/utils/plainTree'

  const props = defineProps({
    // 表格的列描述信息
    columns: {
      type: Array<any>,
      default: () => []
    },
    // 表格的数据
    data: {
      type: Array<TableData>,
      default: () => []
    },
    // 是否显示多选按钮
    isSelection: {
      type: Boolean,
      default: false
    },
    // 多选按钮配置
    rowSelection: {
      type: Object,
      default: () => ({
        type: 'checkbox', // 行选择器的类型 'checkbox' | 'radio'
        showCheckedAll: false, // 是否显示全选选择器
        width: 50, // 列宽度
        checkStrictly: true, // 是否开启严格选择模式
        onlyCurrent: true // 是否仅展示当前页的 keys（切换分页时清空 keys）
      })
    },
    // 表格边框(包括外边框、表头边框和主体边框)
    bordered: {
      type: [Boolean, Object],
      default: false
    },
    // 是否展示表格外边框（更正：业务调整，此参数用于设置表格所有边框）
    wrapperBordered: {
      type: Boolean,
      default: true
    },
    // 是否展示主体单元格边框（更正：业务调整，此参数用于设置表格斑马纹）
    bodyBordered: {
      type: Boolean,
      default: true
    },
    // 是否显示底部页码等控制区域
    showFooter: {
      type: Boolean,
      default: true
    },
    // 是否显示底部按钮区域
    showFooterButton: {
      type: Boolean,
      default: true
    },
    // 是否显示底部删除按钮
    showFooterDeleteButton: {
      type: Boolean,
      default: true
    },
    // 是否显示底部全选按钮
    showSelectAllButton: {
      type: Boolean,
      default: true
    },
    // 是否显示底部反选按钮
    showInvertButton: {
      type: Boolean,
      default: true
    },
    // 批量删除按钮权限
    batchDeletePermission: {
      type: [String, Array],
      default: ''
    },
    // 是否显示底部分页
    showPagination: {
      type: Boolean,
      default: true
    },
    // 表头th自定义查询条件
    conditions: {
      type: Array,
      default: () => [] as Array<object>
    },
    queryParams: {
      type: Object,
      default: () => ({
        currentPage: 1,
        pageSize: 10,
        conditions: [] as Array<object>,
        sorts: [] as Array<object>
      })
    },
    // 表格行 key 的取值字段
    rowKey: {
      type: String,
      default: 'id'
    },
    /**
     * pagination 部分
     */
    // 分页数据总数
    total: {
      type: Number,
      default: 0
    },
    // 分页当前页码
    page: {
      type: Number,
      default: 1
    },
    // 分页当页条数
    pageSize: {
      type: Number,
      default: 20
    },
    // 分页页码切换选择器
    pageSizes: {
      type: Array,
      default: () => [20, 50, 100, 200]
    },
    // 页面跳转
    jumper: {
      type: Boolean,
      default: true
    },
    // 是否显示数据条数选择器
    showSizePicker: {
      type: Boolean,
      default: true
    },
    // 是否显示刷新按钮
    showRefresh: {
      type: Boolean,
      default: false
    },
    // 表格已选择的行
    selectedKeys: {
      type: Array as PropType<(string | number)[]> | null,
      default: null
    },
    // 表格加载状态
    loading: {
      type: Boolean,
      default: false
    },
    // 是否在子树为空时隐藏展开按钮
    hideExpandButtonOnEmpty: {
      type: Boolean,
      default: true
    },
    // 是否自定义批量删除提示
    isCustomBatchDelete: {
      type: Boolean,
      default: false
    },
    // 是否显示默认索引列(序号)
    showIndex: {
      type: Boolean,
      default: false
    },
    // 表格高度
    height: {
      type: [String, Number],
      default: 'auto'
    },
    expandedKeys: {
      type: Array as PropType<(string | number)[]>,
      default: () => []
    },
    // 是否展开
    defaultExpandAllRows: {
      type: Boolean,
      default: false
    },
    /**
     * 是否需要自定义展示表格列
     * true 表头左侧显示自定义按钮
     * false 不展示
     */
    customHeader: {
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
    // 表格自带的分页配置项
    pagination: {
      type: [Boolean, Object],
      default: false
    },
    /**
     * 动态表格序号
     * 同个页面中，若有多个动态表格
     * 索引即为动态表格在页面中展示的序号（序号只需要统计动态表格，非动态表格不列入计算）
     * 索引从 1 开始计算
     * 若同个页面中，有两个动态表格，则动态表格1的 tableIndex=1; 动态表格2的 tableIndex=2
     *
     * 注意：
     * 设置了tableIndex后，界面中相应用到的 useTHeader、useTableWrapperBorder、useTableBodyBorder 也要传对应的tableIndex
     */
    tableIndex: {
      type: Number,
      default: null
    }
  })

  const emits = defineEmits([
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
    'select',
    'page-change',
    'page-size-change'
  ])
  const { proxy } = getCurrentInstance() as any

  const className = toRef(props, 'class')

  const dynamicSlots = computed<Array<{ slotName: string }>>(() => {
    return props.columns.filter(item => item.slotName && item.slotName !== 'operation')
  })

  const currentRowSelection = computed(() => (props.isSelection ? props.rowSelection : undefined))

  const currentQueryParams = toRef(props, 'queryParams')

  // 当页之前数据总条数
  const beforeSizes = computed(() =>
    currentQueryParams.value.currentPage > 0 && currentQueryParams.value.pageSize > 0
      ? (currentQueryParams.value.currentPage - 1) * currentQueryParams.value.pageSize
      : 0
  )

  const currentColumns = ref<any[]>([])

  // 设置表格内容的对齐方式和添加首列索引
  const tableColumns = computed(() => {
    let _columns = currentColumns.value.length ? currentColumns.value : props.columns
    if (!_columns.length) {
      return _columns
    }

    _columns = _columns
      .filter(v => !v.hidden) // 过滤不需要显示的列
      .map(item => {
        // 设置表格内容的对齐方式默认为center
        item.align = item.align || 'center'
        // 设置表格内容的最小宽度为100
        item.width = item.width || 100

        if (item.slotName === 'operation') {
          item.fixed = 'right'
        } else {
          // 显示省略号
          item.ellipsis = true
          // 显示省略号时的文本提示
          item.tooltip = true
        }

        return item
      })

    // 未设置显示索引
    if (!props.showIndex) {
      return _columns
    }

    const firstColumn = _columns[0]
    // 是否已有索引列
    const hasIndexRow =
      Object.prototype.hasOwnProperty.call(firstColumn, 'index') ||
      !Object.prototype.hasOwnProperty.call(firstColumn, 'dataIndex')

    // 添加首列索引项
    if (!hasIndexRow) {
      _columns.unshift({
        title: '序号',
        align: 'center',
        width: 70,
        fixed: 'left',
        dataIndex: '_series',
        render(data: any) {
          return data.rowIndex + 1 + beforeSizes.value
        }
      })
    }
    return _columns
  })

  const buttonDisabled = computed(() => !props.data.length)
  const currentWrapperBorder = ref<Boolean | String>('')
  const currentBodyBorder = ref<Boolean | String>('')

  // 默认表格边框
  const currentTableBordered = computed(() => ({
    wrapper:
      currentWrapperBorder.value !== '' ? !!currentWrapperBorder.value : !!props.wrapperBordered, // 是否展示外边框
    cell: currentWrapperBorder.value !== '' ? !!currentWrapperBorder.value : !!props.wrapperBordered // 是否展示单元格边框（表头+主体）
    // headerCell: true, // 是否展示表头单元格边框
    // bodyCell: currentBodyBorder.value !== '' ? currentBodyBorder.value : props.bodyBordered // 是否展示主体单元格边框
  }))

  // 展示的表格边框
  const tableBordered = computed(() => props.bordered || currentTableBordered.value)
  // 展示的表格斑马纹
  const tableStripe = computed(() =>
    currentBodyBorder.value !== '' ? !!currentBodyBorder.value : !!props.bodyBordered
  )

  // 当前已展开的节点（通过页面"展开/折叠"按钮触发全展开的节点，暂存在这里）
  const currentExpandedKeys = ref<(string | number)[]>([])

  // 监听表格全部“展开/折叠”, 立即执行一次
  watchEffect(() => {
    // 业务组件中自定义传了expandedKeys，则无需计算
    if (props.expandedKeys.length) {
      return
    }

    if (props.defaultExpandAllRows) {
      // 获取表格的所有key值
      currentExpandedKeys.value = getExpandAndSelectKeysByTree(
        props.data as any,
        props.rowKey
      ).expandKeys
    } else {
      currentExpandedKeys.value = []
    }
  })
  // 所有能展开的节点
  const allExpandedKeys = computed({
    get() {
      return props.expandedKeys.length ? props.expandedKeys : currentExpandedKeys.value
    },
    set(keys) {
      currentExpandedKeys.value = keys
      emits('update:expandedKeys', keys)
    }
  })

  // 选中的行(rowKey[])
  const selectionKeys = ref<Array<string | number>>([])
  const selectionRows = ref<any[]>([])

  const currentMapKeys = computed(() => {
    return mapKeys(props.data, props.rowKey)
  })

  const currentFlatByChildren = computed(() => {
    return flatByChildren(props.data)
  })

  // 设置table的高度，让table高度超出显示滚动条
  const tableHeight = ref(0)
  // 表头设置按钮的左边位置
  const settingIconLeft = ref<String | Number>(0)

  // 表格过滤查询
  function toFilter({ consdition, sort }: { consdition: Condition; sort: Sort }) {
    // 字段值
    const index = currentQueryParams.value.conditions.findIndex(
      (v: any) => v.field === consdition.field
    )
    if (!consdition.params.length) {
      // 没有数据，删除行
      if (index > -1) {
        currentQueryParams.value.conditions.splice(index, 1)
      }
    } else if (index > -1) {
      currentQueryParams.value.conditions.splice(index, 1, consdition)
    } else {
      currentQueryParams.value.conditions.push(consdition)
    }

    // 排序
    const sortIndex = currentQueryParams.value.sorts.findIndex((v: any) => v.field === sort.field)
    if (!sort.order) {
      // 没有排序，删除行
      if (sortIndex > -1) {
        currentQueryParams.value.sorts.splice(index, 1)
      }
    } else if (sortIndex > -1) {
      currentQueryParams.value.sorts.splice(index, 1, sort)
    } else {
      currentQueryParams.value.sorts.push(sort)
    }

    emits('header-filter')
  }

  // 全选/取消全选
  function selectAll() {
    proxy.$refs.tableRef.selectAll(true)
    selectionRows.value = props.data
  }

  // 反选
  function revertSelection() {
    if (!selectionKeys.value.length) {
      // 未选中行，则全选
      selectAll()
    } else {
      // 已有选中，则反选
      // 未选中的key值
      const revertKeys = props.data
        .filter(item => !selectionKeys.value.includes(item[props.rowKey]))
        .map(item => item[props.rowKey])

      // 取消已选中的
      proxy.$refs.tableRef.select(selectionKeys.value, false)
      // 勾选未选中的
      proxy.$refs.tableRef.select(revertKeys, true)
      selectionRows.value = props.data.filter((item: any) =>
        revertKeys.includes(item[props.rowKey])
      )
    }
  }

  // 选中改变
  function selectionChange(keys: (string | number)[]) {
    // 树状表格且父子联动
    if (!props.rowSelection.checkStrictly) {
      const currentKeys = [...keys]
      const nodeKeys = Object.keys(currentMapKeys.value)
      for (let index = nodeKeys.length - 1; index >= 0; index--) {
        const nodeChildKeys = currentMapKeys.value[nodeKeys[index]]
        if (nodeChildKeys.length && nodeChildKeys.every((key: any) => currentKeys.includes(key))) {
          currentKeys.push(+nodeKeys[index].slice(1))
        }
      }
      selectionKeys.value = currentKeys
      selectionRows.value = currentFlatByChildren.value.filter((item: any) => {
        return currentKeys.includes(item[props.rowKey])
      })

      emits('selection-change', currentKeys)
    } else {
      selectionKeys.value = keys
      selectionRows.value = currentFlatByChildren.value.filter((item: any) => {
        return keys.includes(item[props.rowKey])
      })
      emits('selection-change', keys)
    }
  }

  // 点击行选择器时触发
  const select = (rowKeys: (string | number)[], rowKey: string | number, record: any) => {
    emits('select', { rowKeys, rowKey, record })
  }

  // 批量删除
  function deleteAll() {
    if (props.isCustomBatchDelete) {
      emits('delete-all', selectionKeys.value)
      selectionKeys.value = []
      selectionRows.value = []
      return
    }
    proxy.$confirm({
      title: '删除确认',
      content: '是否确认批量删除所选中的所有数据，该操作无法撤销，请谨慎操作！',
      onOk: () => {
        emits('delete-all', selectionKeys.value)
        selectionKeys.value = []
        selectionRows.value = []
      }
    })
  }

  // 更新表头
  function updateTableHeader(headerSetting: HeaderSettingConfig) {
    currentWrapperBorder.value = headerSetting.wrapperBordered ? true : false
    currentBodyBorder.value = headerSetting.bodyBordered ? true : false
    if (!headerSetting.tableColumns || !headerSetting.tableColumns.length) {
      return
    }
    const _currentColumns = JSON.parse(JSON.stringify(headerSetting.tableColumns))
    const operation = props.columns.find(v => v.slotName === 'operation')
    if (operation) {
      _currentColumns.push(operation)
    }
    currentColumns.value = _currentColumns
  }

  useComponentInited(() => {
    // 表头设置按钮的左边位置
    settingIconLeft.value = props.isSelection ? '15px' : 0

    /**
     * 设置表格的实际高度
     */
    // if (tableHeight.value > 0) {
    //   return
    // }

    // 设置表格的临时高度，避免表格高度太大，导致页面出现滚动条
    tableHeight.value = 300
    setTimeout(() => {
      // table中thead的高度
      const theadHeight = document.getElementsByTagName('thead')[0]?.offsetHeight
      // 若有指定table高度，则直接用指定值
      if (props.height && props.height !== 'auto') {
        try {
          if (typeof props.height === 'string' && props.height.endsWith('px')) {
            tableHeight.value = Number(props.height.slice(0, -2)) - theadHeight
          } else {
            tableHeight.value = Number(props.height) - theadHeight
          }
        } catch (error) {
          console.log('error')
        }
        return
      }

      // 同级中table的数量（竖向是否有多个表格；若同级中除横向布局的table外，没有其他元素，则必须在业务组件中指定table高度）
      let tableLength = 0

      /**
       * 以下这类布局必须在业务组件中指定table高度，否则table高度会偏小
       * <div父容器 子元素横向布局(flex-direction: row/row-reverse)>
       *   <Table 容器/>
       *   <Table 容器/>
       *   <Table 容器/>
       * </div>
       *
       *  以下这类布局可无需指定table高度
       * <div父容器 子元素竖向布局>
       *   <Table 容器/>
       *   <Table 容器/>
       *   <div 其他元素等/>
       * </div>
       */

      // table 容器
      const tableContainer = document.getElementById('components-table-container')
      // 当前table对应的父容器
      const tableParent = tableContainer?.parentElement
      // 当前table对应的父容器的高度
      const tableParentHeight = tableParent?.clientHeight
      // table 同级元素
      const children = tableParent?.children as any
      // table 同级元素的高度之和( 除table以外)
      let otherChildrenHeight = 0
      if (children && children.length) {
        for (let i = 0; i < children.length; i++) {
          if (children[i].getAttribute('id') !== 'components-table-container') {
            otherChildrenHeight += children[i].offsetHeight
          } else {
            tableLength++
          }
        }
      }

      /**
       * table 容器的高度
       * tips: 不直接通过 table 容器的clientHeight来获取高度，是因为树状图展开之后，
       *       table的clientHeight会随着表格数据量的增多而大于table容器实际高度
       * 减去 30 是为了减少界面高度偏差，避免出现外部滚动条
       */
      // const tableContainerHeight = document.getElementById('components-table-container')?.clientHeight
      let tableContainerHeight = (tableParentHeight as number) - otherChildrenHeight - 30
      if (tableLength > 1) {
        tableContainerHeight = tableContainerHeight / tableLength
      }
      if (tableContainerHeight) {
        // 设置表格的实际高度
        tableHeight.value = theadHeight ? tableContainerHeight - theadHeight : tableContainerHeight
      }
    }, 200)
  })

  function resetSelection() {
    proxy.$refs.tableRef.selectAll(false)
    selectionKeys.value = []
    selectionRows.value = []
  }

  defineExpose({
    selectionKeys,
    selectionRows,
    resetSelection
  })
</script>

<style lang="less">
  .arco-table-cell-inline-icon {
    & + .arco-table-td-content {
      text-align: left;
    }
  }

  .arco-table .arco-table-container {
    .arco-table-tr-checked .arco-table-expand-btn {
      color: rgb(var(--primary-6));
      background-color: transparent;
    }
    .arco-table-expand-btn {
      width: 18px;
      .arco-icon {
        font-size: 18px;
      }
      .arco-icon-caret-down {
        transform: scaleY(1.5);
      }
      .arco-icon-caret-right {
        transform: scaleX(1.5);
      }

      color: rgb(148, 191, 255);
      background-color: transparent;

      &:hover {
        color: rgb(var(--primary-6));
        background-color: transparent;
      }
    }
  }
</style>

<style lang="less" scoped>
  #components-table-container {
    position: relative;
  }
  .operation-button {
    :deep(.arco-btn-text) {
      padding: 0 1px;

      .arco-btn-icon {
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
</style>
