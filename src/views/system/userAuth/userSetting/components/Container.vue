<template>
  <a-row :gutter="10" class="height100">
    <a-col :span="6" class="height100">
      <!-- 左侧树 -->
      <a-card class="arco-card-body100 arco-card-body-flex card">
        <div class="flex1 flex flex-direction-column">
          <TableHeader
            :is-add-button="false"
            :is-reset-button="false"
            :button-list="headerButtonList"
            :style="{ padding: '0 0 16px 0' }"
            @search="handleSearch"
          />
          <Tree
            v-model:expandedKeys="expandedKeys"
            :selected-keys="selectedKeys"
            height="calc(100% - 56px)"
            :data="treeData"
            :is-expand-all="isExpandAll"
            @update:selectedKeys="handleUpdateSelectedKeys"
          />
        </div>
      </a-card>
    </a-col>
    <!-- 右侧组织列表 -->
    <a-col :span="18" class="height100">
      <a-card class="arco-card-body100 arco-card-body-flex card">
        <div class="flex1 flex flex-direction-column">
          <TableHeader
            v-model:queryParams="queryParams"
            v-model:enabled="globalEnabled"
            has-enabled-select
            add-button-permission="AdminSysUserCreate"
            :reset-immedia-search="false"
            :style="{ padding: '0 0 16px 0' }"
            :button-list="rightButtonList"
            @changeEnabled="handleChangeEnabled"
            @add="handleOpenCreateModal"
            @search="handleRightSearch"
            @reset="handleReset"
          />
          <Table
            is-selection
            is-custom-batch-delete
            show-index
            custom-header
            :loading="loading"
            :columns="userTableHeader"
            :data="listData"
            :total="totalUser"
            :wrapper-bordered="tableWrapperBorder"
            :body-bordered="tableBodyBorder"
            :query-params="queryParams"
            batch-delete-permission="AdminSysUserBatchDelete"
            @paginationChange="getListData"
            @header-filter="getListData"
            @delete-all="handleOpenBatchDeleteModal"
          />
        </div>
      </a-card>
    </a-col>
  </a-row>

  <!-- 新增/编辑用户 -->
  <AddOrEditUserModal
    v-if="addOrEditUserModalVisible"
    :id="currentUser?.id"
    v-model:visible="addOrEditUserModalVisible"
    :type="isCreateUser ? 'create' : 'edit'"
    :transfer-role-ids="type === 'org' ? null : selectedKeys"
    @confirm="handleConfirm"
  />

  <!-- 批量导入 -->
  <ImportFileModal
    v-model:visible="batchImportModalVisible"
    v-model:message="warnMessage"
    title="批量导入"
    :limit="1"
    file-type=".xls, .xlsx"
    :is-need-load-module="true"
    @confirm="handleRefreshData"
    @handleDownloadTemplate="handleDownloadTemplate"
    @handleImport="handleImport"
  />

  <!-- 导出弹窗 -->
  <ExportFileModal
    v-model:visible="exportModalVisible"
    title="导出确认"
    :fetch-params="fetchParams"
    confirm-button-text="执行导出"
    :export-api="UserSettingApi.batchExportUser"
  />
</template>

<script setup lang="ts" name="UserSettingContainer">
  import { ref, computed, onMounted, getCurrentInstance } from 'vue'
  import Tree from '@/components/Tree/index.vue'
  import AddOrEditUserModal from '@/components/AddOrEditUserModal/index.vue'
  import { OrgStructureApi, RoleSettingApi, UserSettingApi } from '@/api'
  import { useParams } from '@/hooks/list'
  import { useTHeader } from '@/hooks/useTHeader'
  import { Message } from '@arco-design/web-vue'
  import type { IEnabled } from '@/types/common'
  import type {
    IUserList,
    IUserListItem,
    IUserListParamsByOrg,
    IUserListParamsByRole
  } from '@/types'
  import { useTableWrapperBorder, useTableBodyBorder } from '@/hooks/useTHeader'
  import { download } from '@/utils/files'
  import ExportFileModal from '@/components/ExportFileModal/index.vue'
  import ImportFileModal from '@/components/ImportFileModal/index.vue'

  type Props = {
    type: 'org' | 'role'
  }

  interface TreeItem {
    id: string
    name: string
    parentIds: Array<string | number>
    children: TreeItem[]
  }

  const props = defineProps<Props>()
  const tableWrapperBorder = useTableWrapperBorder() // 表格外边框
  const tableBodyBorder = useTableBodyBorder() // 表格body边框

  const { proxy } = getCurrentInstance() as any
  const isExpandAll = ref(false)
  const expandedKeys = ref<Array<string | number>>([])
  // 左侧按钮
  const headerButtonList = ref([
    {
      text: '折叠/展开',
      callback: () => {
        isExpandAll.value = !isExpandAll.value
      }
    }
  ])

  // 左侧树数据
  const treeData = ref<TreeItem[]>([])
  // 获取树数据
  async function getTreeData(keyword = ''): Promise<TreeItem[]> {
    const api = props.type === 'org' ? OrgStructureApi.getOrgTree : RoleSettingApi.getRoleTree
    try {
      const data = (await api({ keyword, enabled: 1 })) as any
      return data
    } catch (error) {
      return []
    }
  }

  const selectedKeys = ref<Array<string | number>>([])
  // 搜索左侧
  async function handleSearch(keyword: string) {
    const data = await getTreeData(keyword)
    if (data.length) {
      const { id, parentIds } = data[0]
      selectedKeys.value = [id]
      expandedKeys.value = [...parentIds, id]
      getListData()
    }
  }

  // 切换左侧树, 直接使用 v-model:selectedKeys 线上问题: @update:selectedKeys 比 @select 事件先行触发
  function handleUpdateSelectedKeys(keys: any) {
    if (keys[0] === selectedKeys.value[0]) {
      return
    }
    selectedKeys.value = keys
    getListData()
  }

  const exportOrgId = computed(() => {
    if (props.type === 'org') {
      return selectedKeys.value[0]
    }
    return null
  })

  const batchImportModalVisible = ref(false)
  const exportModalVisible = ref(false)
  const rightButtonList = ref([
    {
      text: '批量导入',
      callback() {
        batchImportModalVisible.value = true
      },
      permission: 'AdminSysUserImport'
    },
    {
      text: '导出',
      callback() {
        exportModalVisible.value = true
      },
      permission: 'AdminSysUserExport'
    }
  ])

  const loading = ref(false)
  const userTableHeader = ref()
  // 新增/编辑用户弹窗
  const addOrEditUserModalVisible = ref(false)
  const isCreateUser = ref(false)
  // 是否批量删除
  const isBatchDelete = ref(false)
  // 批量删除ids
  const batchDeleteIds = ref<number[]>([])
  // 当前用户
  const currentUser = ref<IUserListItem>()
  async function getUserTableHeader() {
    const headers = await useTHeader()
    if (headers && headers.length) {
      userTableHeader.value = [
        ...headers,
        {
          title: '操作',
          dataIndex: 'operation',
          slotName: 'operation',
          width: 140,
          buttons: [
            {
              text: '编辑',
              callback({ record }: { record: IUserListItem }) {
                addOrEditUserModalVisible.value = true
                isCreateUser.value = false
                currentUser.value = record
              },
              permission: 'AdminSysUserUpdate'
            },
            {
              text: '删除',
              status: 'danger',
              callback({ record }: { record: IUserListItem }) {
                isBatchDelete.value = false
                currentUser.value = record
                handleConfirmDelete()
              },
              permission: 'AdminSysUserDelete'
            },
            {
              text: '重置密码',
              callback({ record }: { record: IUserListItem }) {
                proxy.$confirm({
                  title: '重置密码',
                  content: `是否重置“${record.name || record.username}”的用户密码为默认密码？`,
                  onOk: () => {
                    UserSettingApi.resetPassword({ id: record.id }).then(() => {
                      Message.success('重置密码成功')
                    })
                  }
                })
              },
              permission: 'AdminSysUserResetPassword'
            }
          ]
        }
      ]
    }
  }

  // 打开新增用户弹窗
  function handleOpenCreateModal() {
    addOrEditUserModalVisible.value = true
    isCreateUser.value = true
  }

  // 批量删除
  function handleOpenBatchDeleteModal(ids: number[]) {
    isBatchDelete.value = true
    batchDeleteIds.value = ids
    handleConfirmDelete()
  }

  function handleConfirmDelete() {
    proxy.$confirm({
      title: isBatchDelete.value ? '警告' : '删除确认',
      content: isBatchDelete.value
        ? '是否确认批量删除所选中的所有用户，该操作无法撤销，请谨慎操作'
        : `是否确认删除用户名称为“${currentUser.value?.name}”的数据项？`,
      onOk: () => {
        if (!batchDeleteIds.value.length && !currentUser.value) {
          return
        }

        const api = isBatchDelete.value
          ? UserSettingApi.batchDeleteUser(batchDeleteIds.value)
          : UserSettingApi.deleteUser({ id: currentUser.value!.id })

        api.then(() => {
          Message.success('删除成功')
          getListData()
        })
      }
    })
  }

  // 新增/编辑用户
  function handleConfirm({
    orgId,
    roleIds,
    initRoleIds,
    initOrgId
  }: {
    orgId: number
    roleIds: number[]
    initOrgId: number | undefined
    initRoleIds: number[] | undefined
  }) {
    const currentKey = selectedKeys.value[0]
    if (!currentKey) {
      return
    }

    let isFreshList: boolean | undefined = false
    if (props.type === 'org') {
      isFreshList = +currentKey === orgId || +currentKey === initOrgId
    } else {
      isFreshList = roleIds.includes(+currentKey) || initRoleIds?.includes(+currentKey)
    }

    if (!isFreshList) {
      return
    }
    // 新增时 currentPage = 1, 编辑时, 更新 currentPage 的数据
    if (isCreateUser.value) {
      queryParams.value.currentPage = 1
    }
    getListData()
  }

  const totalUser = ref(0)
  const queryParams = useParams()
  const listData = ref<IUserList>([])
  const globalEnabled = ref<IEnabled | ''>('')
  const globalKeyword = ref('')

  const fetchParams = computed<IUserListParamsByOrg | IUserListParamsByRole>(
    () =>
      ({
        ...queryParams.value,
        enabled: globalEnabled.value,
        keyword: globalKeyword.value,
        [props.type === 'role' ? 'roleId' : 'orgId']: selectedKeys.value[0]
      } as IUserListParamsByOrg | IUserListParamsByRole)
  )

  // 获取列表数据
  function getListData() {
    UserSettingApi.getUserList(fetchParams.value).then((res: any) => {
      listData.value = res.list
      totalUser.value = res.totalCount
    })
  }

  function handleRefreshData() {
    queryParams.value.currentPage = 1
    queryParams.value.pageSize = 10
    getListData()
  }
  function handleChangeEnabled(enabled: IEnabled | '') {
    globalEnabled.value = enabled ?? ''
    getListData()
  }

  function handleRightSearch(keyword: string) {
    globalKeyword.value = keyword ?? ''
    getListData()
  }

  function handleReset() {
    globalKeyword.value = ''
    globalEnabled.value = ''
    getListData()
  }

  async function init() {
    await getUserTableHeader()
    treeData.value = await getTreeData()
    if (treeData.value.length) {
      selectedKeys.value = [treeData.value[0].id]
      getListData()
    }
  }

  async function handleDownloadTemplate() {
    const res = await UserSettingApi.getImportTemplate()
    download(res, '批量导入模板.xlsx')
  }

  const warnMessage = ref<Array<string>>([])
  function handleImport(formData: any) {
    const submitFormData = formData[0]
    if (exportOrgId.value !== null) {
      submitFormData.append('orgId', exportOrgId.value + '')
    }
    UserSettingApi.batchImportUser(submitFormData)
      .then(() => {
        warnMessage.value = ['导入成功']
        // 通知组织列表更新数据
        handleRefreshData()
      })
      .catch(data => {
        warnMessage.value = data
      })
  }

  onMounted(() => {
    init()
  })
</script>

<style lang="less" scoped>
  :deep(.arco-table) {
    height: 100% !important;
  }
  .card {
    padding: 16px;
  }
</style>
