<template>
  <div class="main-container">
    <a-card class="arco-card-body100 arco-card-body-flex">
      <TableHeader
        v-model:queryParams="queryParams"
        is-add-button
        add-button-permission="AdminSysParamsCreate"
        :style="{ padding: '0 0 16px 0' }"
        :default-search-style="{ width: '250px' }"
        @search="toSearch"
        @add="toAdd"
      />
      <Table
        :columns="tableHeader"
        :data="tableList"
        :total="total"
        :query-params="queryParams"
        is-selection
        show-index
        batch-delete-permission="AdminSysParamsDelete"
        @paginationChange="getList"
        @header-filter="headerFilter"
        @delete-all="deleteAll"
      />
    </a-card>

    <EditForm
      v-model:visible="editVisible"
      :title="editTitle"
      :data="editData"
      @success="getList"
    />
  </div>
</template>
<script setup name="Params" lang="ts">
  import { ref, onMounted, getCurrentInstance } from 'vue'
  import { Message } from '@arco-design/web-vue'
  import { getConfigList, deleteConfig, getConfigDetail } from '@/api/system/params'
  import { useParams } from '@/hooks/list'
  import EditForm from './component/editForm.vue'

  const { proxy }: any = getCurrentInstance()

  const tableList = ref([])

  // 表格头部
  const tableHeader = ref([
    {
      title: '参数名称',
      dataIndex: 'name',
      searchable: true,
      width: 150
    },
    {
      title: '参数ID',
      dataIndex: 'id',
      searchable: true,
      width: 150
    },
    {
      title: '参数键名',
      dataIndex: 'code',
      searchable: true,
      width: 130
    },
    {
      title: '参数键值',
      dataIndex: 'value',
      searchable: true,
      width: 130
    },
    {
      title: '备注',
      dataIndex: 'comment',
      searchable: true,
      width: 150
    },
    {
      title: '状态',
      dataIndex: 'status',
      dictionaryCode: 'SYS_CONFIG_STATUS',
      searchable: true,
      width: 130
    },
    {
      title: '创建人',
      dataIndex: 'createByUser',
      searchable: true,
      width: 130
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      dataType: 'datetime',
      searchable: true,
      width: 150
    },
    {
      title: '操作',
      slotName: 'operation',
      width: 100,
      buttons: [
        {
          text: '编辑',
          type: 'text',
          size: 'mini',
          callback: ({ record }: any) => toDetailEdit(record),
          permission: 'AdminSysParamsUpdate'
        },
        {
          text: '删除',
          type: 'text',
          size: 'mini',
          status: 'danger',
          callback: ({ record }: any) => toDelete(record),
          permission: 'AdminSysParamsDelete'
        }
      ]
    }
  ])

  // 查询条件
  const queryParams = useParams()

  const total = ref(0)

  const editVisible = ref(false)
  const editData = ref({})
  const editTitle = ref('')

  function getList() {
    getConfigList(queryParams.value).then(res => {
      tableList.value = res.list
      total.value = res.totalCount
    })
  }

  function toDelete(record: { id: number; name: string }) {
    proxy.$confirm({
      title: '删除确认',
      content: `是否确认删除参数名称为“${record.name}”的数据项？`,
      onOk: () => {
        deleteConfig([record.id]).then(() => {
          tableList.value = []
          total.value = 0
          Message.success('删除成功')
          getList()
        })
      }
    })
  }

  // 详情区域
  function toSearch(val: string) {
    queryParams.value.keyword = val
    getList()
  }

  function toAdd() {
    editTitle.value = '新增参数'
    editData.value = {}
    editVisible.value = true
  }

  function toDetailEdit(record: { id: number }) {
    editTitle.value = '修改参数'
    getConfigDetail({ id: record.id }).then(res => {
      editData.value = res
      editVisible.value = true
    })
  }

  // 表格标题过滤事件
  function headerFilter() {
    getList()
  }

  // 批量删除
  function deleteAll(keys: number[]) {
    deleteConfig(keys).then(() => {
      Message.success('删除成功')
      getList()
    })
  }

  onMounted(() => {
    getList()
  })
</script>
<style lang="less">
  .main-container {
    height: 100%;
  }
</style>
