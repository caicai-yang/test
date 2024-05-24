<template>
  <div v-if="currentVisible && isFetched">
    <Modal
      v-model:visible="currentVisible"
      :title="type === 'create' ? '新增用户' : '编辑用户'"
      :loading="modalLoading"
      @before-open="formRef.clearValidate()"
      @confirm="handleConfirm"
    >
      <a-form ref="formRef" :model="form" :rules="rules">
        <a-form-item field="username" label="用户账号">
          <a-input
            v-model.trim="form.username"
            v-enter.number="userNameReg"
            :max-length="20"
            :disabled="type === 'edit'"
            placeholder="请输入用户账号"
          />
        </a-form-item>
        <a-form-item field="name" label="用户名称">
          <a-input
            v-model.trim="form.name"
            v-enter.word="nameReg"
            :max-length="20"
            :disabled="type === 'edit'"
            placeholder="请输入用户名称"
          />
        </a-form-item>

        <a-form-item field="mobile" label="联系号码">
          <a-input v-model.trim="form.mobile" placeholder="请输入号码" :max-length="11" />
        </a-form-item>
        <a-form-item field="orgId" label="所属组织">
          <a-tree-select
            v-model="form.orgId"
            placeholder="请选择所属组织"
            allow-search
            :data="orgList"
            :field-names="{ key: 'id', title: 'name', children: 'children' }"
            :filter-tree-node="filterTreeNode"
            :tree-props="{ 'default-expand-all': false }"
          />
        </a-form-item>
        <a-form-item label="权限有效期至">
          <a-date-picker v-model="form.validDate" :placeholder="`默认${DEFAULT_USER_VALID_TIME}`" />
        </a-form-item>
        <a-form-item label="性别">
          <a-select v-model="form.sex" placeholder="请选择性别">
            <a-option
              v-for="item in sysUserSex"
              :key="item.value"
              :value="item.value"
              :label="item.name"
            />
          </a-select>
        </a-form-item>

        <a-form-item label="岗位">
          <a-select v-model="form.post" placeholder="请选择岗位">
            <a-option
              v-for="item in sysUserPost"
              :key="item.value"
              :value="item.value"
              :label="item.name"
            />
          </a-select>
        </a-form-item>

        <a-form-item label="启用状态">
          <a-radio-group v-model="form.enabled" type="button">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="备注">
          <a-input v-model.trim="form.comment" placeholder="请输入备注" :max-length="200" />
        </a-form-item>

        <a-form-item field="roleIds" label="权限角色" :disabled="disabledPermission">
          <a-tree-select
            v-model="form.roleIds"
            placeholder="请选择权限角色"
            tree-check-strictly
            tree-checkable
            allow-search
            :data="roleList"
            :field-names="{ key: 'id', title: 'name', children: 'children' }"
            :filter-tree-node="filterTreeNode"
          />
        </a-form-item>
      </a-form>

      <template #footer>
        <a-space>
          <a-button
            v-if="type === 'edit'"
            v-permission="'AdminSysUserTransferAuth'"
            type="primary"
            status="danger"
            @click="transferPermissionModalVisible = true"
          >
            权限移交
          </a-button>
          <a-button @click="currentVisible = false">取消</a-button>
          <a-button type="primary" @click="handleConfirm">确定</a-button>
        </a-space>
      </template>
    </Modal>

    <Modal
      v-model:visible="transferPermissionModalVisible"
      title="权限移交"
      :loading="transferLoading"
      @before-close="transferFormRef.resetFields()"
      @confirm="handleTransferPermission"
    >
      <a-form ref="transferFormRef" :model="transferForm" :rules="transferRules">
        <a-form-item field="username" label="用户账号">
          <a-input
            v-model.trim="transferForm.username"
            v-enter.number="userNameReg"
            :max-length="20"
            placeholder="请输入用户账号"
          />
        </a-form-item>
        <a-form-item field="name" label="用户名称">
          <a-input
            v-model.trim="transferForm.name"
            v-enter.word="nameReg"
            :max-length="20"
            placeholder="请输入用户名称"
          />
        </a-form-item>
      </a-form>
    </Modal>
  </div>
</template>

<script setup lang="ts" name="AddOrEditUserModal">
  import { ref, computed, onMounted } from 'vue'
  import Modal from '@/components/Modal.vue'
  import { useDictionary } from '@/hooks/useDictionary'
  import { useConfig } from '@/hooks'
  import { DEFAULT_USER_VALID_TIME } from '@/utils/constant'
  import { filterTreeNode } from '@/utils'
  import validator from '@/utils/validate'
  import { RoleSettingApi, OrgStructureApi, UserSettingApi } from '@/api'
  import { IRoleList } from '@/types'
  import { Message } from '@arco-design/web-vue'

  type Props = {
    visible: boolean
    disabledPermission?: boolean
    type?: 'create' | 'edit'
    currentRoleIds?: number[] // 角色设置新增用户
    // eslint-disable-next-line vue/require-default-prop
    id?: number // 编辑用户
    transferRoleIds?: Array<string | number> | null
  }

  type Emits = {
    (e: 'update:visible', visible: boolean): void
    (
      e: 'confirm',
      data: {
        orgId: number
        roleIds: number[]
        initOrgId: number | undefined
        initRoleIds: number[] | undefined
      }
    ): void
  }

  const props = withDefaults(defineProps<Props>(), {
    type: 'create',
    disabledPermission: false,
    currentRoleIds: () => [],
    transferRoleIds: null
  })

  const emits = defineEmits<Emits>()

  const currentVisible = computed({
    get() {
      return props.visible
    },
    set(visible: boolean) {
      emits('update:visible', visible)
    }
  })

  // 字典
  const sysUserSex = useDictionary('SYS_USER_SEX')
  const sysUserPost = useDictionary('SYS_USER_POST')
  // 参数
  const userNameReg = useConfig('SYS_USER_USERNAME_REGEXP') // 工号
  const nameReg = useConfig('SYS_USER_NAME_REGEXP') // 用户名称

  const modalLoading = ref(false)

  const form = ref<any>({
    username: '',
    name: '',
    mobile: '',
    enabled: 1,
    orgId: '',
    sex: '',
    post: '',
    comment: '',
    validDate: '',
    roleIds: []
  })
  // 原始表单数据(用于编辑时还未保存先权限转移)
  const initForm = ref()

  const rules = ref({
    username: [{ required: true, message: '请输入工号', trigger: 'blur' }],
    name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
    mobile: [
      {
        validator: validator({ isRequired: false, isPhone: true }),
        trigger: 'blur'
      }
    ],
    orgId: [{ required: true, message: '请选择所属组织', trigger: 'change' }],
    comment: [{ required: true, message: '请选择组织单位', trigger: 'blur' }],
    roleIds: [{ required: true, message: '请选择角色权限', trigger: 'change' }]
  })

  const formRef = ref()

  // 角色列表
  const roleList = ref<IRoleList>([])
  function getRoleList() {
    return RoleSettingApi.getRoleTree({ enabled: 1 }).then((res: any) => {
      roleList.value = res
    })
  }

  // 组织列表
  const orgList = ref([])
  function getOrgList() {
    return OrgStructureApi.getOrgTree({ enabled: 1 }).then((res: any) => {
      orgList.value = res
    })
  }

  function handleConfirm() {
    formRef.value.validate((validate: any) => {
      if (validate) {
        return
      }
      modalLoading.value = true
      const api = props.type === 'create' ? UserSettingApi.createUser : UserSettingApi.updateUser
      api(form.value)
        .then(() => {
          Message.success(props.type === 'create' ? '新增成功' : '编辑成功')
          currentVisible.value = false
          const { orgId, roleIds } = form.value
          // 只要编辑时才有初始initForm
          const { orgId: initOrgId, roleIds: initRoleIds } = initForm.value || {}
          emits('confirm', { orgId, roleIds, initOrgId, initRoleIds })
        })
        .finally(() => {
          modalLoading.value = false
        })
    })
  }

  // 权限移交相关
  const transferPermissionModalVisible = ref(false)
  const transferLoading = ref(false)
  const transferFormRef = ref()
  const transferForm = ref({
    username: '',
    name: ''
  })
  const transferRules = ref({
    username: [{ required: true, message: '请输入工号', trigger: 'blur' }],
    name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
  })

  // 权限移交
  function handleTransferPermission() {
    transferFormRef.value.validate((valid: any) => {
      if (valid) {
        return
      }
      transferLoading.value = true
      const { id, roleIds } = initForm.value
      const { username, name } = transferForm.value
      UserSettingApi.transferAuth({
        id,
        roleIds: props.transferRoleIds ?? roleIds,
        username,
        name
      })
        .then(() => {
          Message.success('权限转移成功')
          currentVisible.value = false
          const { orgId, roleIds } = form.value
          // 只要编辑时才有初始initForm
          const { orgId: initOrgId, roleIds: initRoleIds } = initForm.value || {}
          emits('confirm', { orgId, roleIds, initOrgId, initRoleIds })
        })
        .finally(() => {
          transferLoading.value = false
          transferPermissionModalVisible.value = false
        })
    })
  }

  const isFetched = ref(false)

  async function init() {
    await getRoleList()
    await getOrgList()
    const { type, disabledPermission, currentRoleIds } = props
    if (type === 'create') {
      form.value = {
        username: '',
        name: '',
        mobile: '',
        enabled: 1,
        orgId: '',
        sex: '',
        post: '',
        comment: '',
        validDate: '',
        roleIds: disabledPermission ? currentRoleIds : []
      }
      isFetched.value = true
    } else if (props.id) {
      isFetched.value = false
      const findUser = await UserSettingApi.findUser({ id: props.id })
      form.value = findUser
      initForm.value = JSON.parse(JSON.stringify(findUser))
      isFetched.value = true
    }
  }

  onMounted(() => {
    init()
  })
</script>

<style lang="less" scoped></style>
