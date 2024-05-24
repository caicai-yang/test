<template>
  <div class="main-container">
    <a-row :gutter="10" class="height100">
      <a-col :span="8" class="height100">
        <a-card class="arco-card-body100 arco-card-body-flex">
          <div class="flex1 flex flex-direction-column">
            <TableHeader
              :is-reset-button="false"
              add-button-permission="AdminSysConfigTableCreate"
              is-add-button
              is-add-icon
              :style="{ padding: '0 0 16px 0' }"
              @search="mainSearch"
              @add="mainAdd"
            />
            <Table
              :columns="mainHeader"
              :data="mainList"
              :total="mainTotal"
              :query-params="mainQueryParams"
              :show-footer-button="false"
              @paginationChange="getList"
              @cell-click="handleCellClick"
            />
          </div>
        </a-card>
      </a-col>
      <a-col :span="16" class="height100">
        <a-card class="arco-card-body100 arco-card-body-flex">
          <div class="flex1 flex flex-direction-column">
            <TableHeader
              :is-reset-button="false"
              is-add-button
              is-add-icon
              add-button-permission="AdminSysConfigFieldCreate"
              :style="{ padding: '0 0 16px 0' }"
              :default-search-style="{ width: '300px' }"
              :disabled-add-button="disabledAddButton"
              @search="detailSearch"
              @add="detailAdd"
            />
            <Table
              :columns="detailHeader"
              :data="detailList"
              :total="detailTotal"
              :query-params="queryParams"
              is-selection
              show-index
              batch-delete-permission="AdminSysConfigFieldBatchDelete"
              @paginationChange="getDetailList"
              @header-filter="headerFilter"
              @delete-all="deleteAll"
            />
          </div>
        </a-card>
      </a-col>
    </a-row>

    <mainForm
      v-model:visible="mainVisible"
      :title="mainTitle"
      :data="mainData"
      @success="getList"
    />

    <detailForm
      v-model:visible="detailVisible"
      :title="detailTitle"
      :data="detailEditData"
      :table-name="queryParams.tableName"
      @success="getDetailList"
    />
  </div>
</template>
<script setup name="Field" lang="ts">
  import { ref, onMounted, computed, getCurrentInstance } from 'vue'
  import { Message } from '@arco-design/web-vue'
  import {
    getTableList,
    getFieldList,
    getFieldDetail,
    deleteTable,
    deleteField,
    batchDeleteField
  } from '@/api/system/field'
  import { useParams } from '@/hooks/list'
  import { useTHeader } from '@/hooks/useTHeader'
  import mainForm from './component/mainForm.vue'
  import detailForm from './component/detailForm.vue'

  const { proxy }: any = getCurrentInstance()

  // 主表格头部
  const mainHeader = ref([
    {
      title: '字段集合名称',
      dataIndex: 'name',
      cellStyle: { cursor: 'pointer' }
    },
    {
      title: '备注',
      dataIndex: 'comment'
    },
    {
      title: '操作',
      dataIndex: 'operation',
      slotName: 'operation',
      width: 110,
      buttons: [
        // {
        //   text: '查看',
        //   type: 'text',
        //   size: 'mini',
        //   callback: ({ record }: any) => toMainRead(record),
        //   permission: 'AdminSysConfigTableFind'
        // },
        {
          text: '编辑',
          type: 'text',
          size: 'mini',
          callback: ({ record }: any) => toMainEdit(record),
          permission: 'AdminSysConfigTableUpdate'
        },
        {
          text: '删除',
          type: 'text',
          size: 'mini',
          status: 'danger',
          callback: ({ record }: any) => toDelete(record, 'main'),
          permission: 'AdminSysConfigTableDelete'
        }
      ]
    }
  ])

  // 详情表格头部
  const detailHeader = ref()
  const operationColumn = {
    title: '操作',
    dataIndex: 'operation',
    slotName: 'operation',
    width: 120,
    buttons: [
      {
        text: '编辑',
        type: 'text',
        size: 'mini',
        callback: ({ record }: any) => toDetailEdit(record),
        permission: 'AdminSysConfigFieldUpdate'
      },
      {
        text: '删除',
        type: 'text',
        size: 'mini',
        status: 'danger',
        callback: ({ record }: any) => toDelete(record, 'detail'),
        permission: 'AdminSysConfigFieldDelete'
      }
    ]
  }
  const mainList = ref([])

  const detailList = ref([])

  // 主页表查询条件（左侧）
  const mainQueryParams = useParams()

  // 详情查询条件（右侧）
  const useQueryParams = useParams()
  const queryParams = ref({ ...useQueryParams.value, tableName: '' })

  const disabledAddButton = computed(() => queryParams.value.tableName === '')

  const mainTotal = ref(0)
  const detailTotal = ref(0)
  const mainVisible = ref(false)
  const mainData = ref({})
  const mainTitle = ref('')

  const detailVisible = ref(false)
  const detailEditData = ref({})
  const detailTitle = ref('')
  // const isFirstDetailLoad = ref(true) // 是否首次加载详情表头

  // 左侧主区域操作
  function mainSearch(val: string) {
    mainQueryParams.value.keyword = val
    getList()
  }

  // 点击行
  function handleCellClick(record: { name: string }, column: any) {
    // 操作列，点击无需查看详情
    if (column.dataIndex === 'operation') {
      return
    } else if (queryParams.value.tableName === record.name) {
      // tableName 等于 record.code，代表已经展示当前详情，无需重复调用详情接口
      return
    }
    queryParams.value.tableName = record.name
    getDetailList()
  }

  // 获取表格自定义列
  async function getHeader() {
    const headers = await useTHeader()
    if (headers && headers.length) {
      // const header = headers.map((header: any) => {
      //   header.filter = true // 加上 filter 字段的，表格头部显示过滤按钮
      //   return header
      // })
      detailHeader.value = [...headers, operationColumn]
    }
  }

  function getList() {
    getTableList(mainQueryParams.value).then((res: any) => {
      mainList.value = res.list
      mainTotal.value = res.totalCount
    })
  }

  function toMainEdit(record: object) {
    mainTitle.value = '修改字段集合'
    mainData.value = record
    mainVisible.value = true
  }

  function mainAdd() {
    mainTitle.value = '新增字段集合'
    mainData.value = {}
    mainVisible.value = true
  }

  function toDelete(record: { id: number; name: string }, type: string) {
    proxy.$confirm({
      title: '删除确认',
      content: '是否确认删除？',
      onOk: () => {
        if (type === 'main') {
          deleteTable(record.id).then(() => {
            // 删除当前激活行
            if (record.name === queryParams.value.tableName) {
              queryParams.value.tableName = ''
              detailList.value = []
            }
            Message.success('删除成功')
            getList()
          })
        } else {
          deleteField(record.id).then(() => {
            Message.success('删除成功')
            getDetailList()
          })
        }
      }
    })
  }

  // 详情区域
  function detailSearch(val: string) {
    queryParams.value.keyword = val
    getDetailList()
  }

  function getDetailList() {
    if (!queryParams.value.tableName) {
      return
    }
    getFieldList(queryParams.value).then((res: any) => {
      // 首次获取，加载动态表格头部
      // if (isFirstDetailLoad.value) {
      //   isFirstDetailLoad.value = false
      // }
      detailList.value = res.list
      detailTotal.value = res.totalCount
    })
  }

  function detailAdd() {
    detailTitle.value = '新增字段'
    detailEditData.value = {}
    detailVisible.value = true
  }

  function toDetailEdit(record: { id: number }) {
    detailTitle.value = '修改字段'
    getFieldDetail(record.id).then(res => {
      detailEditData.value = res
      detailVisible.value = true
    })
  }

  // 表格标题过滤事件
  function headerFilter() {
    getDetailList()
  }

  // 批量删除
  function deleteAll(keys: number[]) {
    batchDeleteField(keys).then(() => {
      Message.success('删除成功')
      getDetailList()
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
