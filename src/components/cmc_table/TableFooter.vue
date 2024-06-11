<script lang="tsx">
  import { defineComponent, PropType } from 'vue'
  import { Pagination, Scrollbar, Space } from '@arco-design/web-vue'
  import { IPaginationConfig, IQueryParams } from './type'
  import { defaultPaginationConfig, defaultQueryParams } from './default'

  export default defineComponent({
    name: 'TableFooter',
    props: {
      paginationConfig: {
        type: Object as PropType<IPaginationConfig>,
        default: () => defaultPaginationConfig
      },
      queryParams: {
        type: Object as PropType<IQueryParams>,
        default: () => defaultQueryParams
      },
      showPagination: {
        type: Boolean,
        default: true
      }
    },
    emits: ['paginationChange'],
    setup(props, { attrs, emit, slots }) {
      const hasFooterButtonSlot = !!slots['footer-button']

      function renderPagination() {
        return (
          <Pagination
            v-model={[props.queryParams.currentPage, 'current']}
            v-model={[props.queryParams.pageSize, 'pageSize']}
            {...props.paginationConfig}
            {...attrs}
            onPageSizeChange={() => emit('paginationChange')}
            onChange={() => emit('paginationChange')}
          />
        )
      }

      return () => (
        <div class={`table-footer ${hasFooterButtonSlot && 'table-footer-width-button'}`}>
          {hasFooterButtonSlot && <Space style='flex: none'>{slots['footer-button']?.()}</Space>}
          {(props.showPagination || slots['pagination-left']) && (
            <div class='footer-pagination'>
              {slots['footer-button'] && (
                <div class='footer-pagination-left'>{slots['pagination-left']?.()}</div>
              )}

              {props.showPagination && (
                <Scrollbar
                  outer-style='max-width: 100%; overflow: hidden;'
                  class='footer-pagination-scrollbar'
                >
                  {renderPagination()}
                </Scrollbar>
              )}
            </div>
          )}
        </div>
      )
    }
  })
</script>

<style scoped>
  .table-footer {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .table-footer-width-button {
    justify-content: space-between;
  }

  .footer-pagination {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex: 1;
    overflow: hidden;

    .footer-pagination-left {
      margin: 0 12px;
      flex: none;
    }

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

    /* :deep(.arco-pagination-item-active) {
      color: var(--color-white);
    }
    :deep(.arco-pagination-item-active:hover) {
      color: var(--color-white);
    } */
  }
</style>
