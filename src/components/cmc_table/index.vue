<script lang="tsx">
  import {
    defineComponent,
    ref,
    toRef,
    useAttrs,
    useSlots,
    computed,
    PropType,
    resolveComponent,
    h,
    getCurrentInstance
  } from 'vue'
  import {
    VxeGrid,
    VxeTableDefines,
    VxeTablePropTypes,
    VxeColumnPropTypes,
    VxeColumnSlotTypes
  } from 'vxe-table'
  import XEUtils from 'xe-utils'

  import { Button, ButtonProps, Space } from '@arco-design/web-vue'
  import _ from 'lodash'
  import TableFooter from './TableFooter.vue'
  import {
    defaultQueryParams,
    defaultCheckboxConfig,
    defaultSelectionColumnConfig,
    defaultSeqColumnConfig,
    ISelectionColumnConfig,
    ISeqColumnConfig,
    defaultButtonProps,
    defaultIconProps,
    defaultPaginationConfig,
    defaultTableFooterButtonConfig
  } from './default'

  import {
    ITableColumnInfo,
    ISlotKey,
    IQueryParams,
    IOperationColumnButton,
    IPaginationConfig,
    ITableFooterButtonConfig
  } from './type'

  export default defineComponent({
    name: 'Table',
    props: {
      height: {
        type: String,
        default: '100%'
      },
      queryParams: {
        type: Object as PropType<IQueryParams>,
        default: () => defaultQueryParams
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
      },
      showTableFooter: {
        type: Boolean,
        default: true
      },
      showPagination: {
        type: Boolean,
        default: true
      },
      tableFooterConfig: {
        type: Object as PropType<IPaginationConfig>,
        default: () => defaultPaginationConfig
      },
      tableFooterButtonConfig: {
        type: Object as PropType<ITableFooterButtonConfig>,
        default: () => defaultTableFooterButtonConfig
      }
    },
    emits: ['paginationChange'],
    setup(props, { emit, slots: $slots, attrs }) {
      const names = ['class', 'style']

      // table-wrapper attrs
      const wrapperAttrs = _.pick(attrs, names)

      // table attrs
      const tableAttrs = _.omit(attrs, names)

      const currentData = toRef(props, 'data')
      const currentColumns = toRef(props, 'columns')
      const currentQueryParams = toRef(props, 'queryParams')

      const { proxy } = getCurrentInstance()

      // 表格选中行
      const selectionRows = ref([])

      const dynamicHeader = ref([])

      const seqConfig: VxeTablePropTypes.SeqConfig = {
        seqMethod({ seq }: any) {
          const { currentPage, pageSize } = currentQueryParams.value
          const index = seq.indexOf('.')
          const preSeq = (currentPage - 1) * pageSize
          if (index === -1) return preSeq + Number(seq)
          return preSeq + Number(seq.slice(0, index)) + seq.slice(index)
        }
      }

      function renderButton(
        button: IOperationColumnButton,
        params: VxeColumnSlotTypes.DefaultSlotParams
      ) {
        const {
          visible,
          permission,
          disabled,
          icon,
          iconProps = defaultIconProps,
          text,
          callback,
          ...otherProps
        } = button
        const _visible = (typeof visible === 'function' ? visible(params) : visible) ?? true
        if (!_visible) return
        const _disabled = (typeof disabled === 'function' ? disabled(params) : disabled) ?? false

        const renderIcon = icon ? () => h(resolveComponent(icon), iconProps) : null
        const renderText = text ? () => text : null

        return (
          <Button
            v-permission={permission}
            disabled={_disabled}
            onClick={() => callback?.(params)}
            {...defaultButtonProps}
            {...otherProps}
            v-slots={{ icon: renderIcon, default: renderText }}
          ></Button>
        )
      }

      const operationColumns = computed(() => {
        const operation = props.columns.find(item => item.field === 'operation')
        if (operation) {
          const { buttons } = operation
          operation.slots = operation.slots || {}
          buttons?.length &&
            (operation.slots.default = params => (
              <div class='operation-buttons'>
                {buttons.map(button => renderButton(button, params))}
              </div>
            ))
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

        let hasOperationColumn = false
        const parseColumns = columns.map(item => {
          const { slots, slotName, render, renderHeader, field } = item
          const tempSlots: VxeColumnPropTypes.Slots = {}

          if (field === 'operation') {
            hasOperationColumn = true
            return Object.assign(item, operationColumns.value)
          }

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

        !hasOperationColumn && operationColumns.value && parseColumns.push(operationColumns.value)

        return parseColumns
      }

      const renderColumns = computed(() => {
        return dynamicHeader.value.length
          ? handleParseColumns(dynamicHeader.value, true)
          : handleParseColumns(currentColumns.value, false)
      })

      async function handleSelectAll() {
        await proxy.$refs.tableRef.setCheckboxRow(
          props.checkboxConfig.checkStrictly
            ? XEUtils.toTreeArray(currentData.value)
            : currentData.value,
          true
        )

        selectionRows.value = proxy.$refs.tableRef.getCheckboxRecords()
      }

      async function handleRevert() {
        await proxy.$refs.tableRef.toggleCheckboxRow(
          props.checkboxConfig.checkStrictly
            ? XEUtils.toTreeArray(currentData.value)
            : currentData.value
        )
        selectionRows.value = proxy.$refs.tableRef.getCheckboxRecords()
        console.log('selectionRows', selectionRows.value)
      }

      function handleBatchDelete() {
        console.log('点击了批量删除')
      }

      // 表格底部按钮
      function renderFooterButton() {
        const {
          selectAllButtonVisible = true,
          invertButtonVisible = true,
          deleteButtonVisible = true,
          deleteButtonPermission = ''
        } = props.tableFooterButtonConfig

        const hasFooterButton =
          selectAllButtonVisible ||
          invertButtonVisible ||
          deleteButtonVisible ||
          $slots['footer-button']

        const buttonProps: ButtonProps = { type: 'primary', size: 'small' }

        const disabled = !currentData.value.length

        if (!hasFooterButton) return null

        const defaultNode = (
          <>
            {selectAllButtonVisible && (
              <Button {...buttonProps} disabled={disabled} onClick={handleSelectAll}>
                全选
              </Button>
            )}
            {invertButtonVisible && (
              <Button {...buttonProps} disabled={disabled} onClick={handleRevert}>
                反选
              </Button>
            )}
            {deleteButtonVisible && (
              <Button
                v-permission={deleteButtonPermission}
                {...buttonProps}
                status='danger'
                disabled={disabled || !selectionRows.value.length}
                onClick={handleBatchDelete}
              >
                批量删除
              </Button>
            )}
          </>
        )

        const vnode = $slots['footer-button']?.()

        if (!vnode) {
          return defaultNode
        }

        return (
          <>
            {defaultNode}
            {vnode}
          </>
        )
      }

      return () => (
        <div class='table-wrapper' {...wrapperAttrs}>
          <VxeGrid
            ref='tableRef'
            class='vxe-table-container'
            show-overflow='tooltip'
            show-header-overflow='tooltip'
            show-footer-overflow='tooltip'
            align='center'
            auto-resize
            border='full'
            max-height={props.height}
            data={currentData.value}
            columns={renderColumns.value}
            expandConfig={{ reserve: true, ...props.expandConfig }}
            checkbox-config={{ ...defaultCheckboxConfig, ...props.checkboxConfig }}
            tree-config={props.treeConfig}
            seq-config={seqConfig}
            {...tableAttrs}
          />
          {props.showTableFooter && (
            <TableFooter
              paginationConfig={{ ...defaultPaginationConfig, ...props.tableFooterConfig }}
              queryParams={currentQueryParams.value}
              showPagination={props.showPagination}
              v-slots={{
                'footer-button': renderFooterButton,
                'pagination-left': $slots['pagination-left']
              }}
              onPaginationChange={() => emit('paginationChange')}
            />
          )}
        </div>
      )
    }
  })
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
