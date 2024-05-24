<template>
  <a-card :body-style="bodyStyle" class="table-footer-container" :bordered="isBordered">
    <div class="flex justify-content-between" :class="{ 'justify-content-end': !showFooterButton }">
      <!-- 按钮区域 -->
      <a-space v-if="showFooterButton" class="footer-button">
        <slot name="footer-button"></slot>
      </a-space>

      <div v-if="showPagination" class="footer-pagination flex">
        <!-- 分页左边自定义区域 -->
        <slot v-if="showPaginationLeftArea" name="pagination-left"></slot>
        <a-scrollbar
          outer-style="width: 100%; overflow: hidden;"
          class="footer-pagination-scrollbar"
        >
          <a-pagination
            v-model:current="currentPage"
            v-model:pageSize="currentPageSize"
            :show-page-size="showSizePicker"
            :page-size-options="pageSizes"
            :show-jumper="jumper"
            :total="total"
            :base-size="3"
            show-total
            size="small"
            @page-size-change="onPageSizeChange"
            @change="onChange"
          >
            <template #jumper-append>页</template>
          </a-pagination>
        </a-scrollbar>
        <a-button
          v-if="showRefresh"
          style="margin-left: 10px"
          shape="circle"
          size="small"
          type="primary"
          @click="refresh"
        >
          <template #icon>
            <IconLoop style="font-size: 14px" />
          </template>
        </a-button>
      </div>
    </div>
  </a-card>
</template>

<script lang="ts" setup name="TableFooter">
  import { computed, useSlots } from 'vue'
  const props = defineProps({
    /**
     * pagination 部分
     */
    // 分页数据总数
    total: {
      type: Number,
      default: 0,
      required: true
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
      type: Array<number>,
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
    bordered: {
      type: Boolean,
      default: false
    },
    // 是否显示底部分页
    showPagination: {
      type: Boolean,
      default: true
    },
    // 是否显示底部按钮区域
    // showFooterButton: {
    //   type: Boolean,
    //   default: false
    // }
    // 分页样式
    bodyStyle: {
      type: Object,
      default: () => {
        return { padding: '15px 0 0 0', width: '100%' }
      }
    }
  })

  const emits = defineEmits(['update:page', 'update:pageSize', 'paginationChange', 'refresh'])
  const slots = useSlots()

  const currentPage = computed({
    get() {
      return props.page
    },
    set(val: number) {
      emits('update:page', val)
    }
  })

  const currentPageSize = computed({
    get() {
      return props.pageSize
    },
    set(val: number) {
      emits('update:pageSize', val)
    }
  })

  const isBordered = computed(() => props.bordered)
  const showFooterButton = !!slots['footer-button']
  const showPaginationLeftArea = !!slots['pagination-left']
  // const innerPosition = computed(() => {
  //   return 'justify-' + props.position
  // })

  // 数据条数改变
  function onPageSizeChange() {
    emits('paginationChange')
  }

  // 页码改变
  function onChange() {
    emits('paginationChange')
  }

  // 刷新
  function refresh() {
    emits('refresh')
  }
</script>
<style lang="less" scoped>
  :deep(.arco-pagination-item-active) {
    color: var(--color-white);
  }
  :deep(.arco-pagination-item-active:hover) {
    color: var(--color-white);
  }
  .table-footer-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

  .footer-pagination {
    overflow: hidden;

    :deep(.footer-pagination-scrollbar) {
      width: 100%;
      height: 35px;
      line-height: 35px;
      overflow-x: auto;
      overflow-y: hidden;

      .arco-pagination-total {
        margin-left: auto;
      }
    }
  }
</style>
