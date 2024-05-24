<template>
  <div class="main-container">
    <a-card class="arco-card-body100 arco-card-body-flex">
      <TableHeader :is-add-button="false" :style="{ padding: '0 0 16px 0' }" @search="search" />
      <a-table
        id="monitorTable"
        ref="monitorTableRef"
        style="height: 100%"
        :columns="tableHeader"
        :data="tableList"
        :pagination="pagination"
        :scroll="{
          y: tableHeight,
          maxHeight: tableHeight
        }"
        column-resizable
        :bordered="{ headerCell: true }"
        :row-selection="currentRowSelection"
        :row-key="rowKey"
        @page-change="pageChange"
        @page-size-change="pageSizeChange"
        @selection-change="selectionChange"
      >
        <template #pagination-left>
          <a-space class="pagination-control">
            <a-button type="primary" size="small" @click="selectAll"> 全选 </a-button>
            <a-button type="primary" size="small" @click="revertSelection"> 反选 </a-button>
            <a-button
              v-permission="'AdminSysOnlineForceLogout'"
              type="primary"
              size="small"
              status="danger"
              :disabled="!selectionKeys.length"
              @click="logoutAll"
            >
              批量强退
            </a-button>
          </a-space>
        </template>
        <template #pagination-right>
          <span style="margin-left: 5px">页</span>
        </template>
        <template #operation="{ record }">
          <a-space size="mini" class="operation-button">
            <a-button
              v-permission="'AdminSysOnlineForceLogout'"
              type="text"
              size="mini"
              @click="() => toLogout(record)"
              >强退</a-button
            >
          </a-space>
        </template>
      </a-table>
    </a-card>
  </div>
</template>
<script setup name="MessageList" lang="ts">
  import { ref, onMounted, getCurrentInstance, computed } from 'vue'
  import { Message } from '@arco-design/web-vue'
  import { getOnlineList, forceLogout } from '@/api/system/online'

  /**
   * 该模块的表格分页为前端分页
   * 因此该模块没有使用公用组件中的 Table
   * 同时该模块后端接口不支持头部筛选
   */

  const { proxy }: any = getCurrentInstance()

  // 详情表格头部
  const tableHeader: any = ref([
    {
      title: '序号',
      align: 'center',
      width: 70,
      ellipsis: true,
      tooltip: true,
      render(data: any) {
        return data.rowIndex + 1 + beforeSizes.value
      }
    },
    {
      title: '会话ID',
      dataIndex: 'token',
      align: 'center',
      ellipsis: true,
      tooltip: true,
      sortable: {
        sortDirections: ['ascend', 'descend']
      }
    },
    {
      title: '登录账号',
      dataIndex: 'username',
      align: 'center',
      ellipsis: true,
      tooltip: true,
      sortable: {
        sortDirections: ['ascend', 'descend']
      }
    },
    {
      title: '所属单位',
      dataIndex: 'orgName',
      align: 'center',
      ellipsis: true,
      tooltip: true,
      sortable: {
        sortDirections: ['ascend', 'descend']
      }
    },
    {
      title: 'IP地址',
      dataIndex: 'loginIp',
      align: 'center',
      ellipsis: true,
      tooltip: true,
      sortable: {
        sortDirections: ['ascend', 'descend']
      }
    },
    {
      title: '登录地点',
      dataIndex: 'loginLocation',
      align: 'center',
      ellipsis: true,
      tooltip: true,
      sortable: {
        sortDirections: ['ascend', 'descend']
      }
    },
    {
      title: '操作系统',
      dataIndex: 'os',
      align: 'center',
      ellipsis: true,
      tooltip: true,
      sortable: {
        sortDirections: ['ascend', 'descend']
      }
    },
    {
      title: '浏览器',
      dataIndex: 'browser',
      align: 'center',
      ellipsis: true,
      tooltip: true,
      sortable: {
        sortDirections: ['ascend', 'descend']
      }
    },
    {
      title: '登录时间',
      dataIndex: 'loginTime',
      align: 'center',
      ellipsis: true,
      tooltip: true,
      sortable: {
        sortDirections: ['ascend', 'descend']
      }
    },
    {
      title: '操作',
      slotName: 'operation',
      align: 'center',
      width: 80
    }
  ])
  const tableList = ref([])
  // 查询条件
  const queryParams = ref({
    keyword: ''
  })
  const total = ref(0)
  const currentPage = ref(1)
  const pagination = ref({
    showTotal: true,
    showJumper: true,
    total: 0,
    defaultCurrent: 1,
    pageSize: 20,
    baseSize: 3,
    showPageSize: true,
    pageSizeOptions: [20, 50, 100, 200]
  })
  const tableHeight = ref(500)
  const beforeSizes = computed(() => (currentPage.value - 1) * pagination.value.pageSize)
  const currentRowSelection: any = {
    type: 'checkbox', // 行选择器的类型 'checkbox' | 'radio'
    showCheckedAll: false, // 是否显示全选选择器
    width: 50, // 列宽度
    checkStrictly: true, // 是否开启严格选择模式
    onlyCurrent: true // 是否仅展示当前页的 keys（切换分页时清空 keys）
  }
  const selectionKeys = ref<(string | number)[]>([])
  const rowKey = 'token'

  function getList() {
    getOnlineList(queryParams.value).then(res => {
      tableList.value = res.list
      total.value = res.totalCount
      pagination.value.total = tableList.value.length
    })
  }

  // 查询
  function search(val: string) {
    queryParams.value.keyword = val
    getList()
  }

  function pageChange(page: number) {
    currentPage.value = page
  }

  function pageSizeChange(pageSize: number) {
    pagination.value.pageSize = pageSize
  }

  // 全选/取消全选
  function selectAll() {
    proxy.$refs.monitorTableRef.selectAll(true)
  }

  // 反选
  function revertSelection() {
    if (!selectionKeys.value.length) {
      // 未选中行，则全选
      selectAll()
    } else {
      // 已有选中，则反选
      // 未选中的key值
      const start = (currentPage.value - 1) * pagination.value.pageSize
      const end = start + pagination.value.pageSize
      const _data = tableList.value.slice(start, end)
      const revertKeys = _data
        .filter(item => !selectionKeys.value.includes(item[rowKey]))
        .map(item => item[rowKey])

      // 取消已选中的
      proxy.$refs.monitorTableRef.select(selectionKeys.value, false)
      // 勾选未选中的
      proxy.$refs.monitorTableRef.select(revertKeys, true)
    }
  }

  // 选中改变
  function selectionChange(keys: (string | number)[]) {
    selectionKeys.value = keys
  }

  // 强退
  function toLogout(record: { token: string; username: string }) {
    proxy.$confirm({
      title: '强退确认',
      content: `是否强退登录账号为 ${record.username} 的用户？`,
      onOk: () => {
        forceLogout([record.token]).then(() => {
          Message.success('强退成功')
          getList()
        })
      }
    })
  }

  // 批量强退
  function logoutAll() {
    proxy.$confirm({
      title: '强退确认',
      content: '请确认是否批量强退所选中的所有用户',
      onOk: () => {
        forceLogout(selectionKeys.value).then(() => {
          Message.success('强退成功')
          getList()
        })
      }
    })
  }

  onMounted(() => {
    getList()

    setTimeout(() => {
      const _monitorTable = document.getElementById('monitorTable')
      const _tableContainerHeight =
        _monitorTable?.getElementsByClassName('arco-table-container')[0]?.clientHeight
      const _tableHeaderHeight =
        _monitorTable?.getElementsByClassName('arco-table-header')[0]?.clientHeight
      tableHeight.value =
        _tableContainerHeight && _tableHeaderHeight
          ? _tableContainerHeight - _tableHeaderHeight
          : 500
    }, 200)
  })
</script>
<style lang="less" scoped>
  .main-container {
    height: 100%;
  }
  :deep(.arco-table-container) {
    flex: 1;
  }
  :deep(.arco-table-pagination) {
    position: relative;
    .pagination-control {
      position: absolute;
      left: 0;
    }
  }
</style>
