<template>
  <Modal
    v-model:visible="currentVisible"
    modal-class="role-user-list-modal"
    title="用户列表"
    :footer="false"
    @before-open="refreshUserList"
  >
    <div class="user-list-header">
      <span>角色名称：{{ currentRole?.name }}</span>
      <span>角色人数：{{ totalUser }}人</span>
      <a-button
        v-permission="'AdminSysUserCreate'"
        type="primary"
        @click="addUserModalVisible = true"
        >新增用户</a-button
      >
    </div>

    <Table
      :height="300"
      :show-footer-button="false"
      :loading="loading"
      :columns="tableHeader"
      :data="userList"
      :query-params="queryParams"
      :total="totalUser"
      @paginationChange="getUserList"
    />

    <AddOrEditUserModal
      v-if="addUserModalVisible"
      v-model:visible="addUserModalVisible"
      disabled-permission
      :current-role-ids="[currentRole!.id]"
      @confirm="refreshUserList"
    />
  </Modal>
</template>

<script setup lang="ts" name="UserListModal">
  import { computed, ref } from 'vue'
  import { RoleSettingApi } from '@/api'
  import { IRoleDetail, IRoleItem } from '@/types'
  import { useFindByDictionary } from '@/hooks/useDictionary'
  import { Message } from '@arco-design/web-vue'

  type Props = {
    visible: boolean
    currentRole: IRoleDetail | IRoleItem | undefined
  }

  type Emits = {
    (e: 'update:visible', visible: boolean): void
  }

  const props = defineProps<Props>()
  const emits = defineEmits<Emits>()

  const currentVisible = computed({
    get() {
      return props.visible
    },
    set(visible: boolean) {
      emits('update:visible', visible)
    }
  })

  // 表格 loading
  const loading = ref(false)
  const queryParams = ref({
    currentPage: 1,
    pageSize: 10
  })

  const tableHeader = ref([
    { title: '用户账号', dataIndex: 'username' },
    { title: '用户名称', dataIndex: 'name' },
    {
      title: '岗位',
      dataIndex: 'post',
      render({ record }: any) {
        return useFindByDictionary('SYS_USER_POST', record.post)?.name
      }
    },
    {
      title: '操作',
      dataIndex: 'operation',
      slotName: 'operation',
      buttons: [
        {
          text: '移除',
          permission: 'AdminSysRoleUserUnlink',
          callback: ({ record }: any) => {
            RoleSettingApi.unlinkRole({ roleId: props.currentRole!.id, userId: record.id }).then(
              () => {
                Message.success('移除成功')
                getUserList()
              }
            )
          }
        }
      ]
    }
  ])
  const userList = ref([])
  const totalUser = ref()
  const addUserModalVisible = ref(false)

  function getUserList() {
    loading.value = true
    RoleSettingApi.getRoleUserList({
      currentPage: queryParams.value.currentPage,
      pageSize: queryParams.value.pageSize,
      roleId: props.currentRole!.id
    })
      .then((res: any) => {
        userList.value = res.list
        totalUser.value = res.totalCount
      })
      .finally(() => {
        loading.value = false
      })
  }

  function refreshUserList() {
    queryParams.value = {
      currentPage: 1,
      pageSize: 10
    }

    getUserList()
  }
</script>

<style lang="less">
  .role-user-list-modal {
    .user-list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
  }
</style>
