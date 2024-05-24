<template>
  <div class="role-config">
    <a-row class="height100">
      <a-col :gutter="24" class="height100">
        <a-card class="arco-card-body100 arco-card-body-flex">
          <TableHeader
            v-model:enabled="enabled"
            has-enabled-select
            :add-button-permission="CREATE_PERMISSION"
            :has-search="false"
            :button-list="buttonList"
            :style="{ padding: '0 0 16px 0' }"
            @add="handleOpenCreateOrEditModal(undefined, true)"
            @changeEnabled="getTableList"
          />

          <Table
            v-model:expandedKeys="expandedKeys"
            is-selection
            is-custom-batch-delete
            :loading="loading"
            :columns="tableHeader"
            :data="tableList"
            :show-pagination="false"
            :default-expand-all-rows="isExpandAll"
            batch-delete-permission="AdminSysRoleBatchDelete"
            @delete-all="handleOpenBatchDeleteModal"
          />
        </a-card>
      </a-col>
    </a-row>

    <AddOrEditRoleModal
      v-model:visible="createOrEditModalVisible"
      :is-create-role="isCreateRole"
      :all-role-list="allRoleList"
      :current-role="currentRole"
      :table-list="tableList"
      @confirm="getTableList(enabled)"
    />

    <UserListModal v-model:visible="userModalVisible" :current-role="currentRole" />
  </div>
</template>

<script setup lang="ts" name="RoleConfig">
  import { ref, onMounted, getCurrentInstance } from 'vue'
  import { RoleSettingApi } from '@/api'
  // import TableHeader from '@/components/TableHeader.vue'
  // import Table from '@/components/Table.vue'
  import AddOrEditRoleModal from './components/AddOrEditRoleModal.vue'
  import UserListModal from './components/UserListModal.vue'
  import { Message } from '@arco-design/web-vue'
  // import { getExpandAndSelectKeysByTree } from '@/utils/plainTree'
  import type { IEnabled } from '@/types/common'
  import type { IRoleList, IRoleItem, IRoleDetail } from '@/types'

  const { proxy } = getCurrentInstance() as any
  // const isRefreshedTable = ref(true)
  const isExpandAll = ref(false)
  const expandedKeys = ref<(string | number)[]>([])
  // 所有能展开的节点
  // const allExpandedKeys = computed(() => {
  //   return getExpandAndSelectKeysByTree(tableList.value).expandKeys
  // })

  const buttonList = ref([
    {
      text: '折叠/展开',
      callback: () => {
        // isRefreshedTable.value = false
        isExpandAll.value = !isExpandAll.value
        // nextTick(() => {
        //   expandedKeys.value = isExpandAll.value ? allExpandedKeys.value : []
        //   isRefreshedTable.value = true
        // })
      }
    }
  ])

  // 表格加载状态
  const loading = ref(false)
  const tableList = ref<IRoleList>([])
  const currentRole = ref<IRoleItem | IRoleDetail>()
  const enabled = ref<any>('')
  const allRoleList = ref<IRoleList>([])
  function getTableList(enabled?: IEnabled | '') {
    const _enabled = enabled ?? ''
    RoleSettingApi.getRoleList({ enabled: _enabled }).then((res: any) => {
      tableList.value = res
      if (_enabled === '') {
        allRoleList.value = res
      }
    })
  }

  const CREATE_PERMISSION = 'AdminSysRoleCreate'
  type Record = { record: IRoleItem }
  const tableHeader = ref([
    { title: '角色名称', dataIndex: 'name', align: 'left' },
    { title: '权限字符', dataIndex: 'code' },
    { title: '显示排序', dataIndex: 'priority' },
    { title: '启用状态', dataIndex: 'enabled', dictionaryCode: 'ENABLED_OR_NOT' },
    { title: '创建人', dataIndex: 'createByUser' },
    { title: '创建时间', dataIndex: 'createTime' },
    {
      title: '操作',
      dataIndex: 'operation',
      slotName: 'operation',
      buttons: [
        {
          text: '新增',
          callback: ({ record }: Record) => handleOpenCreateOrEditModal(record, true),
          disabled: (record: IRoleItem) => record.enabled === 0,
          permission: CREATE_PERMISSION
        },
        {
          text: '编辑',
          callback: ({ record }: Record) => handleOpenCreateOrEditModal(record, false),
          permission: 'AdminSysRoleUpdate'
        },
        {
          text: '删除',
          status: 'danger',
          callback: ({ record }: Record) => handleOpenDeleteModal(record),
          permission: 'AdminSysRoleDelete'
        },
        {
          text: '用户列表',
          callback: ({ record }: Record) => {
            currentRole.value = record
            userModalVisible.value = true
          },
          disabled: (record: IRoleItem) => record.enabled === 0,
          permission: 'AdminSysRoleUserList'
        }
      ]
    }
  ])

  const createOrEditModalVisible = ref(false)
  const isCreateRole = ref(false)

  function handleOpenCreateOrEditModal(
    role: IRoleDetail | IRoleItem | undefined,
    isCreate: boolean
  ) {
    currentRole.value = role
    isCreateRole.value = isCreate
    createOrEditModalVisible.value = true
  }

  const isBatchDelete = ref(false)
  // 打开删除弹窗
  function handleOpenDeleteModal(record: IRoleItem) {
    currentRole.value = record
    isBatchDelete.value = false
    handleConfirmDelete()
  }

  const batchDeleteIds = ref<number[]>()
  function handleOpenBatchDeleteModal(ids: number[]) {
    isBatchDelete.value = true
    batchDeleteIds.value = ids
    handleConfirmDelete()
  }

  // 弹窗确认删除
  function handleConfirmDelete() {
    proxy.$confirm({
      title: '删除确认',
      content: isBatchDelete.value
        ? '是否确认批量删除所选中的所有角色，该操作无法撤销，请谨慎操作！'
        : `是否确认删除角色名称为“${currentRole.value?.name}”的数据项？`,
      onOk: () => {
        if (!isBatchDelete.value && !currentRole.value) {
          return
        }
        const api = isBatchDelete.value ? RoleSettingApi.batchDeleteRole : RoleSettingApi.deleteRole
        const params = isBatchDelete.value ? batchDeleteIds.value : { id: currentRole.value!.id }
        api(params as any).then(() => {
          Message.success('删除成功')
          getTableList(enabled.value)
        })
      }
    })
  }

  // 用户列表弹窗
  const userModalVisible = ref(false)

  onMounted(() => {
    getTableList()
  })
</script>

<style lang="less" scoped>
  .role-config {
    width: 100%;
    height: 100%;
  }
</style>
