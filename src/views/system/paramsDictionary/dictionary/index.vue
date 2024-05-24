<template>
  <div class="main-container">
    <a-row :gutter="10" class="height100">
      <a-col :span="8" class="height100">
        <a-card class="arco-card-body100 arco-card-body-flex">
          <div class="flex1 flex flex-direction-column">
            <TableHeader
              :is-reset-button="false"
              is-add-button
              is-add-icon
              add-button-permission="AdminSysDictionaryCreate"
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
              :selected-keys="selectedKeys"
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
              v-model:queryParams="queryParams"
              is-add-button
              add-button-permission="AdminSysDictionaryLabelCreate"
              :style="{ padding: '0 0 16px 0' }"
              :default-search-style="{ width: '250px' }"
              :disabled-add-button="disabledAddButton"
              :conditions="queryParams.conditions"
              @search="detailSearch"
              @add="detailAdd"
            >
              <template #control-button>
                <a-button
                  v-permission="'AdminSysDictionaryLabelSort'"
                  type="primary"
                  size="large"
                  :disabled="disabledAddButton || !detailList.length"
                  @click="saveDetailSort"
                >
                  保存排序
                </a-button>
              </template>
            </TableHeader>
            <Table
              :key="tableKey"
              :columns="detailHeader"
              :data="detailList"
              :total="detailTotal"
              :query-params="queryParams"
              :show-pagination="false"
              is-selection
              show-index
              batch-delete-permission="AdminSysDictionaryLabelDelete"
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
      :dictionary-code="dictionaryCode"
      @success="getDetailList"
    />
  </div>
</template>
<script setup name="Dictionary" lang="ts">
  import { ref, onMounted, computed, getCurrentInstance } from 'vue'
  import { Message } from '@arco-design/web-vue'
  import {
    getTableList,
    getLabelList,
    getLabelDetail,
    deleteDictionary,
    deleteLabel,
    updateSort
  } from '@/api/system/dictionary'
  import { useParams } from '@/hooks/list'
  // import { useTHeader } from '@/hooks/useTHeader'
  import mainForm from './component/mainForm.vue'
  import detailForm from './component/detailForm.vue'
  import useDictionaryStore from '@/store/modules/dictionary'

  const { proxy }: any = getCurrentInstance()
  const dictionaryStore = useDictionaryStore()

  const mainList = ref([])

  const detailList = ref([])

  // 主表格头部
  const mainHeader = ref([
    {
      title: '字典名称',
      dataIndex: 'name',
      cellStyle: { cursor: 'pointer' }
    },
    {
      title: '字典标识',
      dataIndex: 'code'
    },
    {
      title: '备注',
      dataIndex: 'comment'
    },
    {
      title: '启用状态',
      dataIndex: 'enabled',
      dictionaryCode: 'ENABLED_OR_NOT',
      width: 90
    },
    {
      title: '操作',
      dataIndex: 'operation',
      slotName: 'operation',
      width: 100,
      buttons: [
        {
          text: '编辑',
          type: 'text',
          size: 'mini',
          callback: ({ record }: any) => toMainEdit(record),
          permission: 'AdminSysDictionaryUpdate'
        },
        {
          text: '删除',
          type: 'text',
          size: 'mini',
          status: 'danger',
          callback: ({ record }: any) => toDelete(record, 'main'),
          permission: 'AdminSysDictionaryDelete'
        }
      ]
    }
  ])

  // 详情表格头部
  const detailHeader = ref([
    {
      title: '字典标签ID',
      dataIndex: 'id',
      searchable: true,
      width: 110
    },
    {
      title: '字典标签',
      dataIndex: 'name',
      searchable: true,
      dataType: 'tag'
    },
    {
      title: '标签键值',
      dataIndex: 'value',
      searchable: true
    },
    {
      title: '显示排序',
      dataIndex: 'priority',
      searchable: true
    },
    {
      title: '备注',
      dataIndex: 'comment',
      filter: true
    },
    {
      title: '启用状态',
      dataIndex: 'enabled',
      dictionaryCode: 'ENABLED_OR_NOT',
      searchable: true
    },
    {
      title: '创建人',
      dataIndex: 'createByUser',
      searchable: true
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      dataType: 'datetime',
      searchable: true
    },
    {
      title: '操作',
      dataIndex: 'operation',
      slotName: 'operation',
      width: 160,
      buttons: [
        {
          text: '编辑',
          type: 'text',
          size: 'mini',
          disabled: () => disabledAddButton.value,
          callback: ({ record }: any) => toDetailEdit(record),
          permission: 'AdminSysDictionaryLabelUpdate'
        },
        {
          text: '删除',
          type: 'text',
          size: 'mini',
          status: 'danger',
          disabled: () => disabledAddButton.value,
          callback: ({ record }: any) => toDelete(record, 'detail'),
          permission: 'AdminSysDictionaryLabelDelete'
        },
        {
          text: '上移',
          type: 'text',
          size: 'mini',
          disabled: (_: any, __: any, rowIndex: number) =>
            detailList.value.length < 2 || rowIndex === 0 || disabledAddButton.value,
          callback: ({ rowIndex }: { rowIndex: number }) => moveUp(rowIndex)
        },
        {
          text: '下移',
          type: 'text',
          size: 'mini',
          disabled: (_: any, __: any, rowIndex: number) =>
            detailList.value.length < 2 ||
            rowIndex === detailList.value.length - 1 ||
            disabledAddButton.value,
          callback: ({ rowIndex }: { rowIndex: number }) => moveDown(rowIndex)
        }
      ]
    }
  ])

  // 主页表查询条件（左侧）
  const mainQueryParams = useParams()

  // 详情查询条件（右侧）
  const dictionaryCode = ref('')
  const queryParams = ref({
    keyword: '',
    conditions: [],
    sorts: []
  })

  // 按钮的禁用状态
  const disabledAddButton = computed(() => dictionaryCode.value === '' || parentEnabled.value === 0)

  const mainTotal = ref(0)
  const detailTotal = ref(0)
  const mainVisible = ref(false)
  const mainData = ref({})
  const mainTitle = ref('')

  const detailVisible = ref(false)
  const detailEditData = ref({})
  const detailTitle = ref('')
  const parentEnabled = ref(1) // 父节点的启用状态
  const selectedKeys = ref<number[]>([]) // 选中节点

  // 左侧主区域操作
  function mainSearch(val: string) {
    mainQueryParams.value.keyword = val
    getList()
  }

  // 获取表格自定义列
  // async function getHeader() {
  //   const headers = await useTHeader()
  //   if (headers && headers.length) {
  //     // const header = headers.map((header: any) => {
  //     //   header.filter = true // 加上 filter 字段的，表格头部显示过滤按钮
  //     //   return header
  //     // })
  //     detailHeader.value.unshift(...headers)
  //   }
  // }
  // 点击行
  function handleCellClick(record: { id: number; code: string; enabled: number }, column: any) {
    // 启用状态列、操作列，点击无需查看详情
    if (['enabled', 'operation'].includes(column.dataIndex)) {
      return
    } else if (dictionaryCode.value === record.code) {
      // dictionaryCode 等于 record.code，代表已经展示当前详情，无需重复调用详情接口
      return
    }
    dictionaryCode.value = record.code
    parentEnabled.value = record.enabled
    selectedKeys.value = [record.id]
    getDetailList()
  }

  function getList() {
    getTableList(mainQueryParams.value).then(res => {
      mainList.value = res.list
      mainTotal.value = res.totalCount
    })
  }

  function toMainEdit(record: object) {
    mainTitle.value = '修改字典'
    mainData.value = record
    mainVisible.value = true
  }

  function mainAdd() {
    mainTitle.value = '新增字典'
    mainData.value = {}
    mainVisible.value = true
  }

  function toDelete(record: { id: number; name: string; code: string }, type: string) {
    const content = type === 'main' ? '字典名称' : '字典标签'
    proxy.$confirm({
      title: '删除确认',
      content: `是否确认删除${content}为“${record.name}”的数据项？`,
      onOk: () => {
        if (type === 'main') {
          deleteDictionary([record.id]).then(() => {
            detailList.value = []
            detailTotal.value = 0
            Message.success('删除成功')
            getList()
            // 删除当前字典, 更新右侧列表数据
            if (record.code === dictionaryCode.value) {
              detailList.value = []
            }
          })
        } else {
          deleteLabel([record.id]).then(() => {
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
    if (!dictionaryCode.value) {
      return
    }
    getLabelList({ ...queryParams.value, dictionaryCode: dictionaryCode.value }).then(
      (res: any) => {
        detailList.value = res.list
        detailTotal.value = res.totalCount

        // 更新字典 store 中对应 key 的值
        dictionaryStore.saveKey(
          dictionaryCode.value,
          detailList.value.map((item: any) => ({
            name: item.name,
            value: item.value,
            color: item.color
          }))
        )
      }
    )
  }

  const tableKey = ref('')
  // 上移
  function moveUp(index: number) {
    const currentRow = detailList.value[index]
    const lastRow = detailList.value[index - 1]
    detailList.value.splice(index - 1, 2, currentRow, lastRow)
    tableKey.value = new Date().getTime().toString()
  }

  // 下移
  function moveDown(index: number) {
    const currentRow = detailList.value[index]
    const nextRow = detailList.value[index + 1]
    detailList.value.splice(index, 2, nextRow, currentRow)
    tableKey.value = new Date().getTime().toString()
  }

  function detailAdd() {
    detailTitle.value = '新增字典标签'
    detailEditData.value = {}
    detailVisible.value = true
  }

  function toDetailEdit(record: { id: number }) {
    detailTitle.value = '修改字典标签'
    getLabelDetail({ id: record.id }).then(res => {
      detailEditData.value = res
      detailVisible.value = true
    })
  }

  // 保存排序
  function saveDetailSort() {
    if (!detailList.value.length) {
      return
    }
    proxy.$confirm({
      title: '排序确认',
      content: '是否保存当前排序？',
      okText: '保存',
      cancelText: '取消',
      onOk: () => {
        const _length = detailList.value.length - 1
        const requestParams = detailList.value.map((item: { id: number }, index: number) => ({
          id: item.id,
          priority: _length - index
        }))
        updateSort(requestParams).then(() => {
          Message.success('保存成功')
          getDetailList()
        })
      }
    })
  }

  // 表格标题过滤事件
  function headerFilter() {
    getDetailList()
  }

  // 批量删除
  function deleteAll(keys: number[]) {
    deleteLabel(keys).then(() => {
      Message.success('删除成功')
      getDetailList()
    })
  }

  onMounted(() => {
    // getHeader()
    getList()
  })
</script>
<style lang="less">
  .main-container {
    height: 100%;
  }
</style>
