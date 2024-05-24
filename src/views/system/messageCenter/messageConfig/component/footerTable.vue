<template>
  <a-card :bordered="false" :class="$attrs.class ?? ''">
    <ContentTitle title="推送用户" />
    <TableHeader
      :is-add-button="false"
      :style="{ padding: '0 0 16px 0' }"
      :reset-immedia-search="false"
      :default-search="false"
      @search="search"
      @reset="reset"
    >
      <template v-if="!isRead" #control-button>
        <a-button
          v-permission="'AdminSysMsgConfigUserSelectList'"
          type="primary"
          @click="selectPerson"
        >
          选择用户
        </a-button>
        <a-button
          v-permission="'AdminSysMsgConfigUserImportList'"
          type="primary"
          @click="importPerson"
        >
          导入用户
        </a-button>
      </template>
      <template #control-search>
        <a-form :model="formData" layout="inline" class="header-form">
          <a-form-item label="岗位:">
            <a-select v-model="formData.postList" placeholder="请选择岗位" size="large" multiple>
              <a-option
                v-for="item in userPost"
                :key="item.value"
                :value="item.value"
                :label="item.name"
              />
            </a-select>
          </a-form-item>
          <a-form-item label="用户名称:">
            <a-input
              v-model.trim="formData.nameList"
              placeholder="请输入用户名称"
              size="large"
              :max-length="500"
              @press-enter="search"
            />
          </a-form-item>
          <a-form-item label="用户账号:">
            <a-input
              v-model.trim="formData.usernameList"
              placeholder="请输入用户账号"
              size="large"
              :max-length="500"
              @press-enter="search"
            />
          </a-form-item>
        </a-form>
      </template>
    </TableHeader>
    <Table
      batch-delete-permission="AdminSysMsgConfigUserDelete"
      :columns="tableHeader"
      :data="tableList"
      :total="total"
      :query-params="queryParams"
      :is-selection="!isRead"
      :show-footer-button="!isRead"
      :page-sizes="[50, 100, 200, 500]"
      @paginationChange="getList"
      @header-filter="headerFilter"
      @delete-all="deleteAll"
    />

    <div v-if="isRead || !hasFrom" class="footer-btn">
      <a-button size="large" type="primary" @click="handleClose">关闭</a-button>
    </div>
    <div v-if="hasFrom" class="footer-btn">
      <a-button size="large" @click="handlePreviousStep">上一步</a-button>
      <a-button size="large" type="primary" @click="handleClose">确定</a-button>
    </div>
  </a-card>
  <selectPersonModel
    v-if="isSelectPersonModel"
    v-model:isSelectPersonModel="isSelectPersonModel"
    @againSearch="againSearch"
  />
  <importPersonModel
    v-model:isImportPersonModel="isImportPersonModel"
    @againImportSearch="againImportSearch"
  />
  <readList v-model:visible="readListVisible" :config-id="readConfigId" :user-id="readUserId" />
</template>

<script lang="ts" setup name="FooterTable">
  import { configPersonList, deletePersonList } from '@/api/system/messageConfig'
  import selectPersonModel from './selectPersonModel.vue'
  import importPersonModel from './importPersonModel.vue'
  import readList from './readList.vue'
  import { ref, reactive } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { Message } from '@arco-design/web-vue'
  import { useDictionary, useFindByDictionary } from '@/hooks/useDictionary'
  import { useCloseTab } from '@/hooks/useTabs'

  const route = useRoute()
  const router = useRouter()

  // 选择用户弹窗
  const isSelectPersonModel = ref(false)
  // 导入用户弹窗
  const isImportPersonModel = ref(false)

  const readListVisible = ref(false)
  const readConfigId = ref('')
  const readUserId = ref(0)

  const formData = ref({
    postList: [],
    usernameList: '',
    nameList: ''
  })

  // 用户岗位列表
  const userPost = useDictionary('SYS_USER_POST')

  const tableList = ref([])
  const tableHeader = ref([
    {
      title: '用户账号',
      dataIndex: 'username',
      width: '150'
    },
    {
      title: '用户名称',
      dataIndex: 'name'
    },
    {
      title: '所属单位',
      dataIndex: 'orgName'
    },
    {
      title: '联系号码',
      dataIndex: 'mobile'
    },
    {
      title: '岗位',
      dataIndex: 'post',
      render({ record }: { record: any }) {
        return useFindByDictionary('SYS_USER_POST', record.post)?.name
      }
    }
  ])

  const operation = reactive({
    title: '操作',
    dataIndex: 'operation',
    slotName: 'operation',
    width: '80',
    buttons: [
      {
        text: '查看已阅',
        type: 'text',
        size: 'mini',
        callback: ({ record }: any) => toRead(record),
        permission: 'AdminSysMsgConfigReadList'
      }
    ]
  })

  const total = ref(0)
  const queryParams = ref({
    currentPage: 1,
    pageSize: 50,
    configId: '',
    postList: [],
    usernameList: [] as Array<string>,
    nameList: [] as Array<string>
  })
  const isRead = ref(false)

  function getList() {
    if (!route.params.id) {
      return
    }
    queryParams.value.configId = route.params.id as string
    configPersonList(queryParams.value).then(({ list, totalCount }) => {
      tableList.value = list
      total.value = totalCount
    })
  }

  // 选择用户
  function selectPerson() {
    isSelectPersonModel.value = true
  }
  function importPerson() {
    isImportPersonModel.value = true
  }

  function againSearch() {
    getList()
  }
  function againImportSearch() {
    getList()
  }

  // 查询
  function search() {
    queryParams.value.postList = formData.value.postList
    queryParams.value.usernameList =
      formData.value.usernameList !== '' ? formData.value.usernameList.split(',') : []
    queryParams.value.nameList =
      formData.value.nameList !== '' ? formData.value.nameList.split(',') : []
    getList()
  }

  // 重置
  function reset() {
    formData.value.postList = []
    formData.value.usernameList = ''
    formData.value.nameList = ''

    queryParams.value.postList = []
    queryParams.value.usernameList = []
    queryParams.value.nameList = []
    getList()
  }

  // 表格标题过滤事件
  function headerFilter() {
    getList()
  }

  // 批量删除
  function deleteAll(vals: number[]) {
    deletePersonList(vals).then(() => {
      Message.success('删除成功')
      getList()
    })
  }

  // 查阅
  function toRead(record: { userId: number }) {
    readConfigId.value = queryParams.value.configId
    readUserId.value = record.userId
    readListVisible.value = true
  }

  function handleParams() {
    isRead.value = route.params.type ? route.params.type === 'isRead' : false
    if (isRead.value) {
      tableHeader.value.push(operation)
    }
    if (route.params.id) {
      queryParams.value.configId = route.params.id as string
      getList()
    }
  }

  const hasFrom = ref(false)
  if (route.params) {
    handleParams()
    hasFrom.value = route.query.from === 'configMessage'
  }

  // 上一步
  function handlePreviousStep() {
    router.push({
      path: `/system/messageCenter/messageConfig/detail/${route.params.id}/isEdit`,
      query: { from: 'configPerson' }
    })
  }

  // 关闭页面
  function handleClose() {
    useCloseTab('/system/messageCenter/messageConfig')
  }
</script>

<style lang="less" scoped>
  .header-form {
    :deep(.arco-form-item) {
      margin-bottom: 0;
    }
  }

  .footer-btn {
    display: flex;
    justify-content: center;
    align-items: center;

    button + button {
      margin-left: 30px;
    }
  }
</style>
