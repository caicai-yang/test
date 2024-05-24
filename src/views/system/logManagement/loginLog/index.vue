<template>
  <div class="login-log">
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
            show-index
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
  </div>
</template>

<script setup lang="ts" name="OperateLog">
  import { ref, onMounted } from 'vue'
  // import TableHeader from '@/components/TableHeader.vue'
  // import Table from '@/components/Table.vue'
  import { useParams } from '@/hooks/list'
  import { LogManagementApi } from '@/api'
  import type { ILoginLogList } from '@/types'

  const globalKeyword = ref('')
  const queryParams = useParams()

  const list = ref<ILoginLogList>([])
  const total = ref<number>()
  const tableHeader = ref([
    { title: '日志ID', dataIndex: 'id', searchable: true },
    { title: '登录账号', dataIndex: 'username', searchable: true },
    { title: 'IP地址', dataIndex: 'loginIp', searchable: true },
    { title: '登录地点', dataIndex: 'loginLocation' },
    { title: '操作系统', dataIndex: 'os', searchable: true },
    {
      title: '浏览器',
      dataIndex: 'browser',
      searchable: true
    },
    { title: '登录状态', dataIndex: 'status', searchable: true, dictionaryCode: 'SUCCESS_OR_FAIL' },
    // TODO: 多语言key转义
    { title: '描述', dataIndex: 'msg', searchable: true },
    { title: '操作时间', dataIndex: 'createTime', searchable: true, dataType: 'datetime' }
  ])

  // 操作日志列表
  function getList() {
    LogManagementApi.getLoginLogList({
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
  .login-log {
    width: 100%;
    height: 100%;
  }
</style>
