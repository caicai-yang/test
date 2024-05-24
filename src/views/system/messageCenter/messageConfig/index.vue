<template>
  <div class="height100">
    <a-card class="arco-card-body100 arco-card-body-flex">
      <TableHeader
        v-model:queryParams="queryParams"
        is-add-button
        add-button-permission="AdminSysMsgConfigCreate"
        :style="{ padding: '0 0 16px 0' }"
        @search="search"
        @add="addTable"
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
        batch-delete-permission="AdminSysMsgConfigDelete"
        @paginationChange="getList"
        @header-filter="headerFilter"
        @delete-all="deleteAll"
      />
    </a-card>
  </div>
</template>

<script setup name="MessageConfig" lang="ts">
  import { ref, onMounted, getCurrentInstance } from 'vue'
  import { Message } from '@arco-design/web-vue'
  import { messageConfigList, deleteMessageConfig, updateStatus } from '@/api/system/messageConfig'

  import { useParams } from '@/hooks/list'
  import { useTHeader } from '@/hooks/useTHeader'
  import { useRouter } from 'vue-router'
  import { useTableWrapperBorder, useTableBodyBorder } from '@/hooks/useTHeader'
  import render, { renderTag } from '@/components/render/renderSwitch'

  const { proxy }: any = getCurrentInstance()
  const router = useRouter()

  const total = ref(0)
  // 查询条件
  const queryParams = useParams()
  const tableHeader = ref()
  const operationColumn = {
    title: '操作',
    dataIndex: 'operation',
    slotName: 'operation',
    width: 200,
    buttons: [
      {
        text: '查看',
        type: 'text',
        size: 'mini',
        callback: ({ record }: any) => toRead(record),
        permission: 'AdminSysMsgConfigFind'
      },
      {
        text: '编辑消息',
        type: 'text',
        size: 'mini',
        callback: ({ record }: any) => toEdit(record),
        permission: 'AdminSysMsgConfigUpdate',
        // 已完成的消息不允许编辑
        disabled: (record: any) => {
          return !!record.finished
        }
      },
      {
        text: '配置用户',
        type: 'text',
        size: 'mini',
        callback: ({ record }: any) => toConfig(record),
        permission: 'AdminSysMsgConfigUserList',
        // 已完成的消息不允许配置
        disabled: (record: any) => {
          return !!record.finished
        }
      },
      {
        text: '删除',
        type: 'text',
        size: 'mini',
        status: 'danger',
        callback: ({ record }: any) => toDelete(record),
        permission: 'AdminSysMsgConfigDelete'
      }
    ]
  }

  const tableList = ref([])
  const tableWrapperBorder = useTableWrapperBorder() // 表格外边框
  const tableBodyBorder = useTableBodyBorder() // 表格body边框

  // 获取表格自定义列
  async function getHeader() {
    const headers = await useTHeader()
    if (headers && headers.length) {
      const header = headers.map((header: any) => {
        // 启用状态自定义展示
        if (header.dataIndex === 'status') {
          header.render = ({ record }: { record: any }) => {
            if (record.finished) {
              return renderTag(record.status)
            }
            return render({
              permission: 'AdminSysMsgConfigUpdateStatus',
              record: record,
              field: 'status',
              callback: value => {
                const isEnabled = value === 'ENABLE'
                proxy.$confirm({
                  title: isEnabled ? '启用确认' : '禁用确认',
                  type: isEnabled ? 'success' : 'error',
                  content: `是否${isEnabled ? '启用' : '禁用'}消息编号为“${record.code}”的消息`,
                  onOk: () => {
                    updateStatus({ id: record.id, status: value as string }).then(() => {
                      // 更新列表
                      getList()
                      Message.success('切换成功')
                    })
                  }
                })
              }
            })
          }
        }
        return header
      })
      tableHeader.value = [...header, operationColumn]
    }
  }

  function getList() {
    messageConfigList(queryParams.value).then(({ list, totalCount }) => {
      total.value = totalCount
      tableList.value = list
    })
  }

  // 查看详情
  function toRead(record: { id: number }) {
    router.push({
      name: 'MessageConfigDetail',
      params: {
        id: record.id,
        type: 'isRead'
      }
    })
  }

  // 编辑消息
  function toEdit(record: { id: number }) {
    router.push({
      // path: '/system/messageCenter/messageConfig/messageDetailConfig',
      name: 'MessageConfigDetail',
      params: {
        id: record.id,
        type: 'isEdit'
      }
    })
  }

  // 配置用户
  function toConfig(record: { id: number }) {
    router.push(`/system/messageCenter/messageConfig/configPerson/${record.id}`)
  }

  // 删除
  function toDelete(record: any) {
    proxy.$confirm({
      title: '删除确认',
      content: `是否删除消息编号为“${record.code}”的数据项`,
      onOk: () => {
        deleteAll([record.id])
      }
    })
  }

  // 查询
  function search(val: string) {
    queryParams.value.keyword = val
    getList()
  }

  // 表格标题过滤事件
  function headerFilter() {
    getList()
  }

  // 批量删除
  function deleteAll(vals: number[]) {
    deleteMessageConfig(vals).then(() => {
      Message.success('删除成功')
      getList()
    })
  }

  const addTable = () => {
    router.push('/system/messageCenter/messageConfig/messageDetailConfig')
  }

  onMounted(() => {
    getHeader()
    getList()
  })
</script>

<style lang="less" scoped>
  .topMainBread {
    line-height: 40px;
    height: 40px;
  }
  .mainright {
    margin-top: 10px;
  }
  .mainWrapper {
    background: white;
  }
</style>
