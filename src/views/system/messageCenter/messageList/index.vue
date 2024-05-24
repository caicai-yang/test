<template>
  <div class="main-container">
    <a-card class="arco-card-body100 arco-card-body-flex">
      <div class="flex1 flex flex-direction-column">
        <TableHeader
          v-model:queryParams="queryParams"
          :is-add-button="false"
          :style="{ padding: '0 0 16px 0' }"
          @search="search"
        />
        <Table
          :columns="tableHeader"
          :data="tableList"
          :total="total"
          :query-params="queryParams"
          is-selection
          show-index
          custom-header
          :wrapper-bordered="tableWrapperBorder"
          :body-bordered="tableBodyBorder"
          @paginationChange="getList"
          @header-filter="headerFilter"
          @delete-all="deleteAll"
        />
      </div>
    </a-card>
  </div>
</template>
<script setup name="MessageList" lang="ts">
  import { ref, onMounted, getCurrentInstance } from 'vue'
  import { Message } from '@arco-design/web-vue'
  import { getTableList, deleteMessage } from '@/api/system/messageList'
  import { useParams } from '@/hooks/list'
  import { useTHeader } from '@/hooks/useTHeader'
  import { useRouter } from 'vue-router'
  import { useTableWrapperBorder, useTableBodyBorder } from '@/hooks/useTHeader'

  const { proxy }: any = getCurrentInstance()

  // 详情表格头部
  const tableHeader = ref()
  const operationColumn = {
    title: '操作',
    dataIndex: 'operation',
    slotName: 'operation',
    width: 100,
    buttons: [
      {
        text: '查看',
        type: 'text',
        size: 'mini',
        callback: ({ record }: any) => toRead(record),
        permission: 'AdminSysMsgFind'
      },
      {
        text: '删除',
        type: 'text',
        size: 'mini',
        status: 'danger',
        callback: ({ record }: any) => toDelete(record),
        permission: 'AdminSysMsgDelete'
      }
    ]
  }
  const tableList = ref([])
  // 查询条件
  const queryParams = useParams()
  const total = ref(0)
  const router = useRouter()
  const tableWrapperBorder = useTableWrapperBorder() // 表格外边框
  const tableBodyBorder = useTableBodyBorder() // 表格body边框

  // 获取表格自定义列
  async function getHeader() {
    const headers = await useTHeader()
    if (headers && headers.length) {
      tableHeader.value = [...headers, operationColumn]
    }
  }

  function getList() {
    getTableList(queryParams.value).then(res => {
      tableList.value = res.list
      total.value = res.totalCount
    })
  }

  function toDelete(record: any) {
    proxy.$confirm({
      title: '删除确认',
      content: `是否删除消息编号为“${record.code}”的数据项`,
      onOk: () => {
        deleteMessage([record.id]).then(() => {
          Message.success('删除成功')
          getList()
        })
      }
    })
  }

  // 查询
  function search(val: string) {
    queryParams.value.keyword = val
    getList()
  }

  // 查看详情
  function toRead(record: { id: number }) {
    router.push(`/messageList/detail/${record.id}`)
  }

  // 表格标题过滤事件
  function headerFilter() {
    getList()
  }

  // 批量删除
  function deleteAll(keys: number[]) {
    deleteMessage(keys).then(() => {
      Message.success('删除成功')
      getList()
    })
  }

  onMounted(() => {
    getHeader()
    getList()
  })
</script>
<style lang="less">
  .main-container {
    height: 100%;
  }
</style>
