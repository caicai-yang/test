<template>
  <div class="main-container">
    <a-row :gutter="10" class="height100">
      <a-col :span="8" class="height100">
        <a-card class="arco-card-body100 arco-card-body-flex padding16">
          <div class="flex1 flex flex-direction-column">
            <TableHeader
              :is-reset-button="false"
              :is-add-button="false"
              :style="{ padding: '0 0 16px 0' }"
              @search="mainSearch"
            />
            <Table
              :columns="mainHeader"
              :data="mainList"
              :total="mainTotal"
              :query-params="mainQueryParams"
              :show-footer-button="false"
              :selected-keys="mainSelectedKeys"
              :jumper="false"
              show-index
              @paginationChange="getList"
              @cell-click="handleCellClick"
            />
          </div>
        </a-card>
      </a-col>
      <a-col :span="16" class="height100">
        <a-card class="arco-card-body100 arco-card-body-flex padding16">
          <TableHeader
            :is-reset-button="false"
            is-add-button
            add-button-permission="AdminSysLanguageCreate"
            :style="{ padding: '0 0 16px 0' }"
            :disabled-add-button="disabledAddButton"
            @search="detailSearch"
            @add="languageAdd"
          />
          <Table
            :columns="detailHeader"
            :data="detailList"
            :total="detailTotal"
            :query-params="queryParams"
            :show-footer-button="false"
            show-index
            @paginationChange="getDetailList"
          />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>
<script setup name="MessageLanguage" lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import { getLanguageList, getMessageList } from '@/api/system/language'
  import { useParams } from '@/hooks/list'
  import { UpdateRecord } from '@/types/language'

  const props = defineProps({
    lang: {
      type: String,
      default: 'zh_CN'
    },
    type: {
      type: String,
      default: ''
    }
  })

  const emits = defineEmits(['add', 'update', 'delete'])

  // 主表格头部
  const mainHeader = ref([
    {
      title: '提示内容',
      dataIndex: 'value',
      cellStyle: { cursor: 'pointer' }
    },
    {
      title: '键值',
      dataIndex: 'code'
    }
  ])

  // 详情表格头部
  const detailHeader = ref([
    {
      title: '语种名称',
      dataIndex: 'locale',
      dictionaryCode: 'SYS_LOCALE'
    },
    {
      title: '语种值',
      dataIndex: 'value'
    },
    {
      title: '启用状态',
      dataIndex: 'enabled',
      dictionaryCode: 'ENABLED_OR_NOT'
    },
    {
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
          permission: 'AdminSysLanguageUpdate'
        },
        {
          text: '删除',
          type: 'text',
          size: 'mini',
          status: 'danger',
          callback: ({ record }: any) => toDelete(record),
          permission: 'AdminSysLanguageDelete'
        }
      ]
    }
  ])
  const mainList = ref([])
  const mainTotal = ref(0)
  const detailList = ref([])
  const detailTotal = ref(0)
  const mainSelectedKeys = ref<number[]>([])

  // 主页表查询条件（左侧）
  const mainQueryParams = useParams()
  // 语言详情查询条件（右侧）
  const queryParams = useParams()

  const disabledAddButton = computed(() => searchId.value === '')
  const searchId = ref<string | number>('') // 查询详情的id

  // 点击行
  function handleCellClick(record: { id: number }) {
    if (searchId.value === record.id) {
      // searchId 等于 record.id，代表已经展示当前详情，无需重复调用详情接口
      return
    }
    searchId.value = record.id
    mainSelectedKeys.value = [record.id]
    getDetailList()
  }

  function getList() {
    const requestParams = {
      currentPage: mainQueryParams.value.currentPage,
      pageSize: mainQueryParams.value.pageSize,
      keyword: mainQueryParams.value.keyword
    }
    getMessageList(requestParams).then((res: any) => {
      mainList.value = res.list
      mainTotal.value = res.totalCount
    })
  }

  function getDetailList() {
    const requestParams = {
      ...queryParams.value,
      foreignId: searchId.value,
      type: props.type
    }
    getLanguageList(requestParams).then(res => {
      detailList.value = res.list
      detailTotal.value = res.totalCount
    })
  }

  // 左侧主区域操作
  function mainSearch(val: string) {
    mainQueryParams.value.keyword = val
    resetTableList()
    getList()
  }

  // 中间详情区域
  function detailSearch(val: string) {
    if (!searchId.value) {
      return
    }
    queryParams.value.keyword = val
    getDetailList()
  }

  // 重置字典详情和语言详情部分
  function resetTableList() {
    detailList.value = []
    detailTotal.value = 0
    queryParams.value.keyword = ''
  }

  function languageAdd() {
    const localList = detailList.value.map((i: { locale: string }) => i.locale)
    emits('add', searchId.value, localList)
  }

  function toDetailEdit(record: UpdateRecord) {
    const localList = detailList.value.map((i: { locale: string }) => i.locale)
    emits('update', record, localList)
  }

  function toDelete(record: { id: number; locale: string }) {
    emits('delete', record.id, record.locale)
  }

  onMounted(() => {
    getList()
  })

  defineExpose({
    getDetailList
  })
</script>
<style lang="less">
  .main-container {
    height: 100%;
  }
</style>
