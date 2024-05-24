<template>
  <div class="operate-log">
    <a-row class="height100">
      <a-col :gutter="24" class="height100">
        <a-card class="arco-card-body100 arco-card-body-flex">
          <TableHeader
            v-model:queryParams="queryParams"
            :is-add-button="false"
            :style="{ padding: '0 0 16px 0' }"
            @search="handleSearch"
          />
          <Table
            :query-params="queryParams"
            :data="list"
            :total="total"
            :columns="tableHeader"
            :show-footer-button="false"
            @header-filter="getList"
            @paginationChange="getList"
          />
        </a-card>
      </a-col>
    </a-row>
    <LogDetailModal
      v-if="detailModalVisible"
      v-model:visible="detailModalVisible"
      width="800px"
      :detail="auditLogDetail!"
    />
  </div>
</template>

<script setup lang="ts" name="OperateLog">
  import { ref, onMounted } from 'vue'
  // import TableHeader from '@/components/TableHeader.vue'
  // import Table from '@/components/Table.vue'
  import LogDetailModal from './LogDetailModal.vue'
  import { useParams } from '@/hooks/list'
  import { LogManagementApi } from '@/api'
  import type { IAuditLogList, IAuditLogItem, IAuditLogDetail } from '@/types'

  const globalKeyword = ref('')
  const queryParams = useParams()

  // 日志详情
  const auditLogDetail = ref<IAuditLogDetail>()
  const detailModalVisible = ref(false)
  const list = ref<IAuditLogList>([])
  const total = ref<number>()
  const tableHeader = ref([
    { title: '日志ID', dataIndex: 'id', searchable: true },
    { title: '操作内容', dataIndex: 'operation', searchable: true },
    { title: '请求方式', dataIndex: 'method', searchable: true },
    { title: '操作人员', dataIndex: 'operator' },
    { title: '登录IP', dataIndex: 'clientIp', searchable: true },
    {
      title: '操作状态',
      dataIndex: 'operationStatus',
      dictionaryCode: 'SUCCESS_OR_FAIL',
      searchable: true
    },
    { title: '操作时间', dataIndex: 'operationTime', searchable: true, dataType: 'datetime' },
    {
      title: '操作',
      dataIndex: 'operation',
      slotName: 'operation',
      buttons: [
        {
          text: '查看',
          permission: 'AdminSysAuditLogFind',
          async callback({ record }: { record: IAuditLogItem }) {
            auditLogDetail.value = (await LogManagementApi.getAuditLogDetail({
              id: record.id
            })) as any

            detailModalVisible.value = true
          }
        }
      ]
    }
  ])

  // 操作日志列表
  function getList() {
    LogManagementApi.getAuditLogList({
      ...queryParams.value,
      keyword: globalKeyword.value
    }).then((res: any) => {
      list.value = res.list
      total.value = res.totalCount
    })
  }

  // 搜索
  function handleSearch(keyword: string) {
    globalKeyword.value = keyword
    getList()
  }

  onMounted(() => {
    getList()
  })
</script>

<style lang="less" scoped>
  .operate-log {
    width: 100%;
    height: 100%;
  }
</style>
