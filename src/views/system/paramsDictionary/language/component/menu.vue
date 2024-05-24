<template>
  <div class="main-container">
    <a-row :gutter="10" class="height100 language-container">
      <a-col :span="6" class="height100">
        <a-card class="arco-card-body100 arco-card-body-flex padding16">
          <TableHeader
            :is-reset-button="false"
            :is-add-button="false"
            :style="{ padding: '0 0 16px 0' }"
            @search="mainSearch"
          >
            <template #control-button>
              <a-button type="primary" size="large" @click="expandTable"> 展开/折叠 </a-button>
            </template>
          </TableHeader>
          <Table
            :key="tableKey"
            :columns="mainHeader"
            :data="mainList"
            :total="mainTotal"
            :show-footer="false"
            :default-expand-all-rows="isExpandAll"
            :selected-keys="mainSelectedKeys"
            @cell-click="handleCellClick"
          />
        </a-card>
      </a-col>
      <a-col :span="18" class="height100">
        <a-card class="arco-card-body100 arco-card-body-flex padding16">
          <TableHeader
            :is-reset-button="false"
            is-add-button
            add-button-permission="AdminSysLanguageCreate"
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
            :show-footer-button="false"
            show-index
            @paginationChange="getDetailList"
          />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>
<script setup name="MenuLanguage" lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import { getMenuTree } from '@/api/system/menu'
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

  const tableKey = ref('')
  const isExpandAll = ref(false)
  // 主表格头部
  const mainHeader = ref([
    {
      title: '菜单列表',
      dataIndex: 'name',
      align: 'left',
      cellStyle: { cursor: 'pointer' }
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

  // 主页表查询条件（左侧）
  const mainKeyword = ref('')

  // 详情查询条件（右侧）
  const queryParams = useParams()

  const disabledAddButton = computed(() => searchId.value === '')

  const mainTotal = ref(0)
  const detailList = ref([])
  const detailTotal = ref(0)
  const mainSelectedKeys = ref<number[]>([])

  const searchId = ref<string | number>('') // 查询详情的id

  function expandTable() {
    isExpandAll.value = !isExpandAll.value
    // nextTick(() => {
    //   if (!isExpandAll.value) {
    //     // 重新渲染表格，解决表格收缩后滚动条未消失问题
    //     tableKey.value = new Date().getTime() + ''
    //   }
    // })
  }

  // 左侧主区域操作
  function mainSearch(val: string) {
    mainKeyword.value = val
    searchId.value = ''
    detailList.value = []
    detailTotal.value = 0
    getList()
  }

  // 点击行
  function handleCellClick(record: { id: number }) {
    searchId.value = record.id
    mainSelectedKeys.value = [record.id]
    getDetailList()
  }

  function getList() {
    getMenuTree({ keyword: mainKeyword.value }).then((res: any) => {
      mainList.value = res
    })
  }

  // 详情区域
  function detailSearch(val: string) {
    if (!searchId.value) {
      return
    }
    queryParams.value.keyword = val
    getDetailList()
  }

  function getDetailList() {
    const requestParams = {
      currentPage: queryParams.value.currentPage,
      pageSize: queryParams.value.pageSize,
      keyword: queryParams.value.keyword,
      type: props.type,
      foreignId: searchId.value
      // locale: props.lang
    }
    getLanguageList(requestParams).then(res => {
      detailList.value = res.list
      detailTotal.value = res.totalCount
    })
  }

  function detailAdd() {
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
    // getHeader()
    getList()
  })

  defineExpose({
    getDetailList
  })
</script>
<style lang="less" scoped>
  .main-container {
    height: 100%;
    .language-container {
      background: #f0f2f5;
    }
  }
</style>
