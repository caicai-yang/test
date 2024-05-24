<template>
  <div class="login-record">
    <Table
      :query-params="queryParams"
      :columns="tableHeader"
      :data="loginLogList"
      :total="total"
      :show-footer-button="false"
      @header-filter="getLoginLogList"
      @paginationChange="getLoginLogList"
    />
  </div>
</template>

<script setup lang="ts" name="LoginRecord">
  import { ref, onMounted } from 'vue'
  import { UserSettingApi } from '@/api'
  // import Table from '@/components/Table.vue'
  import { useParams } from '@/hooks/list'
  import { ILoginLogList } from '@/types'

  const loginLogList = ref<ILoginLogList>()
  const queryParams = useParams()
  const total = ref()
  const tableHeader = ref([
    { title: '日志ID', dataIndex: 'id', searchable: true },
    // { title: '登录账号', dataIndex: 'username', searchable: true },
    { title: 'IP地址', dataIndex: 'loginIp', searchable: true },
    { title: '登录地点', dataIndex: 'loginLocation' },
    { title: '操作系统', dataIndex: 'os', searchable: true },
    { title: '浏览器', dataIndex: 'browser', searchable: true },
    { title: '登录状态', dataIndex: 'status', searchable: true, dictionaryCode: 'SUCCESS_OR_FAIL' },
    // TODO: 多语言key转义
    { title: '描述', dataIndex: 'msg', searchable: true },
    { title: '操作时间', dataIndex: 'createTime', searchable: true, dataType: 'datetime' }
  ])

  function getLoginLogList() {
    UserSettingApi.getUserLoginLog(queryParams.value).then((res: any) => {
      loginLogList.value = res.list
      total.value = res.totalCount
    })
  }

  onMounted(() => {
    getLoginLogList()
  })
</script>

<style lang="less" scoped>
  .login-record {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
</style>
