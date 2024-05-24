<template>
  <div class="main-container">
    <a-row :gutter="10" class="height100">
      <a-col :span="6" class="height100">
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
              @paginationChange="getList"
              @cell-click="handleCellClick"
            />
          </div>
        </a-card>
      </a-col>
      <a-col :span="8" class="height100">
        <a-card class="arco-card-body100 arco-card-body-flex padding16">
          <div class="flex1 flex flex-direction-column">
            <TableHeader
              :is-reset-button="false"
              :is-add-button="false"
              :style="{ padding: '0 0 16px 0' }"
              @search="detailSearch"
            />
            <Table
              :columns="detailHeader"
              :data="detailList"
              :total="detailTotal"
              :query-params="queryParams"
              :show-footer-button="false"
              :selected-keys="detailSelectedKeys"
              show-index
              @paginationChange="getDetailList"
              @cell-click="handleDetailClick"
            />
          </div>
        </a-card>
      </a-col>

      <a-col :span="10" class="height100">
        <a-card class="arco-card-body100 arco-card-body-flex padding16">
          <TableHeader
            :is-reset-button="false"
            is-add-button
            add-button-permission="AdminSysLanguageCreate"
            :style="{ padding: '0 0 16px 0' }"
            :disabled-add-button="disabledAddButton"
            @search="languageSearch"
            @add="languageAdd"
          />
          <Table
            :columns="languageHeader"
            :data="languageList"
            :total="languageTotal"
            :query-params="languageQueryParams"
            :show-footer-button="false"
            show-index
            @paginationChange="getLanguageDetail"
          />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>
<script setup name="FieldLanguage" lang="ts">
  import { ref, onMounted, computed } from 'vue'
  // import { Message } from '@arco-design/web-vue'
  import { getTableList, getFieldList } from '@/api/system/field'
  import { getLanguageList } from '@/api/system/language'
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
      title: '字段集合名称',
      dataIndex: 'name',
      cellStyle: { cursor: 'pointer' }
    },
    {
      title: '备注',
      dataIndex: 'comment'
    }
  ])

  // 详情表格头部
  const detailHeader = ref([
    {
      title: '字段名称',
      dataIndex: 'name',
      cellStyle: { cursor: 'pointer' }
    },
    {
      title: '字段标签',
      dataIndex: 'comment',
      cellStyle: { cursor: 'pointer' }
    }
  ])
  const languageHeader = ref([
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
  const languageList = ref([])
  const languageTotal = ref(0)
  const mainSelectedKeys = ref<number[]>([])
  const detailSelectedKeys = ref<number[]>([])

  // 主页表查询条件（左侧）
  const mainQueryParams = useParams()
  // 详情查询条件（中间）
  const useQueryParams = useParams()
  const queryParams = ref({ ...useQueryParams.value, tableName: '' })
  // 语言详情查询条件（右侧）
  const languageQueryParams = useParams()

  const disabledAddButton = computed(() => detailSearchId.value === '')
  const detailSearchId = ref<string | number>('') // 查询详情的id

  // 点击行
  function handleCellClick(record: { id: number; name: string }) {
    if (queryParams.value.tableName === record.name) {
      // tableName 等于 record.code，代表已经展示当前详情，无需重复调用详情接口
      return
    }
    queryParams.value.tableName = record.name
    mainSelectedKeys.value = [record.id]
    getDetailList()
  }

  // 点击中间模块详情行
  function handleDetailClick(record: { id: number }) {
    if (detailSearchId.value === record.id) {
      // detailSearchId 等于 record.id，代表已经展示当前详情，无需重复调用详情接口
      return
    }
    detailSearchId.value = record.id
    detailSelectedKeys.value = [record.id]
    getLanguageDetail()
  }

  function getList() {
    getTableList(mainQueryParams.value).then(res => {
      mainList.value = res.list
      mainTotal.value = res.totalCount
    })
  }

  function getDetailList() {
    if (!queryParams.value.tableName) {
      return
    }
    getFieldList(queryParams.value).then(res => {
      detailList.value = res.list
      detailTotal.value = res.totalCount
    })
  }

  function getLanguageDetail() {
    const requestParams = {
      ...languageQueryParams.value,
      foreignId: detailSearchId.value,
      type: props.type
    }
    getLanguageList(requestParams).then(res => {
      languageList.value = res.list
      languageTotal.value = res.totalCount
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
    queryParams.value.keyword = val
    resetLanguageList()
    getDetailList()
  }

  // 右侧语言区域
  function languageSearch(val: string) {
    if (!detailSearchId.value) {
      return
    }
    languageQueryParams.value.keyword = val
    getLanguageDetail()
  }

  function resetTableList() {
    detailList.value = []
    detailTotal.value = 0
    languageList.value = []
    languageTotal.value = 0
    queryParams.value.keyword = ''
    languageQueryParams.value.keyword = ''
  }

  function resetLanguageList() {
    languageList.value = []
    languageTotal.value = 0
    languageQueryParams.value.keyword = ''
  }

  function languageAdd() {
    const localList = languageList.value.map((i: { locale: string }) => i.locale)
    emits('add', detailSearchId.value, localList)
  }

  function toDetailEdit(record: UpdateRecord) {
    const localList = languageList.value.map((i: { locale: string }) => i.locale)
    emits('update', record, localList)
  }

  function toDelete(record: { id: number; locale: string }) {
    emits('delete', record.id, record.locale)
  }

  onMounted(() => {
    getList()
  })

  defineExpose({
    getLanguageDetail
  })
</script>
<style lang="less">
  .main-container {
    height: 100%;
  }
</style>
