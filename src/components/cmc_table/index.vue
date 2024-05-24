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
      :max-height="height"
      :data="currentData"
      :columns="renderColumns"
      :expandConfig="{ reserve: true, ...expandConfig }"
      v-bind="tableAttrs"
    />
  </div>
</template>

<script setup lang="ts" name="index">
  import { ref, toRef, useAttrs, computed, PropType } from 'vue'
  import { VxeTableDefines, VxeTablePropTypes } from 'vxe-table'
  import _ from 'lodash'
  import {
    defaultCheckboxConfig,
    defaultSelectionColumnConfig,
    defaultSeqColumnConfig,
    ISelectionColumnConfig,
    ISeqColumnConfig
  } from './default'

  const props = defineProps({
    height: {
      type: String,
      default: '100%'
    },
    data: {
      type: Array as PropType<Array<Record<string, any>>>,
      default: () => []
    },
    columns: {
      type: Array as PropType<VxeTableDefines.ColumnInfo[]>,
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
    }
  })

  const emits = defineEmits([])

  const attrs = useAttrs()

  const names = ['class', 'style']

  // table-wrapper attrs
  const wrapperAttrs = _.pick(attrs, names)

  // table attrs
  const tableAttrs = _.omit(attrs, names)

  const currentData = toRef(props, 'data')
  const currentColumns = toRef(props, 'columns')

  //
  const renderColumns = computed(() => {
    return
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
