<template>
  <Modal
    v-model:visible="currentVisible"
    confirm-button-text="保存"
    modal-class="role-user-modal"
    :title="isCreateRole ? '新建角色' : '编辑角色'"
    @before-open="handleBeforeOpen"
    @confirm="handleCreateOrEdit"
  >
    <a-form ref="formRef" :model="form" :rules="rules" class="role-form">
      <a-form-item field="name" label="角色名称">
        <a-input v-model="form.name" placeholder="请输入名称" :max-length="20" />
      </a-form-item>
      <a-form-item field="parentId" label="上级角色">
        <a-select
          v-model="form.parentId"
          placeholder="请选择上级角色"
          allow-search
          :allow-clear="!currentRole"
          :disabled="allRoleList.length === 0 || !isCreateRole"
        >
          <a-option v-for="(value, key) in parentObj" :key="key" :value="+key" :label="value" />
        </a-select>
      </a-form-item>
      <a-form-item field="code" label="权限字符">
        <a-input v-model="form.code" placeholder="请输入权限字符" :max-length="100" />
      </a-form-item>
      <FormItemWithTooltip label="显示排序" tooltip="数字越大显示优先级越高">
        <a-input-number
          v-model="form.priority"
          v-enter:10.number
          placeholder="请输入数字"
          :min="0"
          :max="9999999999"
          :precision="0"
        />
      </FormItemWithTooltip>
      <a-form-item label="备注">
        <a-input v-model="form.comment" placeholder="请输入备注" :max-length="200" />
      </a-form-item>
      <a-form-item label="启用状态" class="role-form-enabled">
        <a-radio-group v-model="form.enabled" type="button">
          <a-radio :value="1">启用</a-radio>
          <a-radio :value="0">禁用</a-radio>
        </a-radio-group>
        <a-button
          v-permission="'AdminSysRoleFind'"
          type="primary"
          size="small"
          @click="copyPermissionVisible = true"
        >
          权限复制
        </a-button>
      </a-form-item>
      <a-tabs v-if="currentVisible" default-active-key="1">
        <a-tab-pane key="1" title="菜单权限">
          <RoleTree v-model:checkedKeys="form.menuIds" :tree-data="menuList" type="menu"
        /></a-tab-pane>
        <a-tab-pane key="2" title="数据权限">
          <RoleTree v-model:checkedKeys="form.orgIds" :tree-data="orgList"
        /></a-tab-pane>
      </a-tabs>
    </a-form>

    <CopyPermission
      v-model:visible="copyPermissionVisible"
      :tree-data="tableList"
      @confirm="handleCopyPermission"
    />
  </Modal>
</template>

<script setup lang="ts" name="AddOrEditRoleModal">
  import { computed, ref } from 'vue'
  import RoleTree from './Tree.vue'
  import CopyPermission from './CopyPermission.vue'
  import { Message } from '@arco-design/web-vue'
  import { RoleSettingApi, OrgStructureApi } from '@/api'
  import { getMenuTree } from '@/api/system/menu'
  import { plainTreeNames } from '@/utils/plainTree'
  import { IRoleDetail, IRoleItem, IRoleList } from '@/types'

  type Props = {
    visible: boolean
    isCreateRole: boolean
    allRoleList: IRoleList
    currentRole: IRoleDetail | IRoleItem | undefined
    tableList: IRoleList
  }

  type Emits = {
    (e: 'update:visible', visible: boolean): void
    (e: 'confirm'): void
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

  const form = ref<any>({})
  const rules = computed(() => ({
    name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
    parentId: [
      {
        required: props.isCreateRole ? !!props.currentRole : form.value.parentId !== null,
        message: '请选择上级角色',
        trigger: 'blur'
      }
    ],
    code: [{ required: true, message: '请输入权限字符', trigger: 'blur' }]
  }))

  // 扁平化角色树
  const roleListPlain = computed(() => {
    return plainTreeNames(props.allRoleList)
  })

  const parentObj = computed(() => {
    // 新增时, 树有数据: 任选parentId, 无 parentId=0
    if (props.isCreateRole) {
      return props.currentRole
        ? { [props.currentRole.id]: props.currentRole.name }
        : { ...roleListPlain.value }
    }
    // 编辑时
    return { [form.value.parentId]: form.value.parentNames }
  })

  // 复制弹窗显隐
  const copyPermissionVisible = ref(false)
  function handleCopyPermission({ menuIds, orgIds }: { menuIds: string[]; orgIds: number[] }) {
    form.value.menuIds = menuIds
    form.value.orgIds = orgIds
  }
  // 获取角色详情
  async function getRoleDetailById(id: number) {
    return RoleSettingApi.findRole({ id })
      .then(res => res)
      .catch(_ => null)
  }

  // 菜单权限列表
  const menuList = ref()
  async function getMenuList() {
    return getMenuTree({ enabled: 1 }).then(res => {
      menuList.value = res
    })
  }

  // 数据权限列表
  const orgList = ref()
  async function getOrgList() {
    return OrgStructureApi.getOrgTree({ enabled: 1 }).then(res => {
      orgList.value = res
    })
  }

  // 头部新增时, currentRole = null
  async function handleBeforeOpen() {
    formRef.value.clearValidate()
    const findRole: IRoleDetail =
      props.currentRole && ((await getRoleDetailById(props.currentRole.id)) as any)
    // 有角色但查不到角色详情
    if (props.currentRole && !findRole) {
      return
    }
    if (props.isCreateRole) {
      form.value = {
        name: '',
        parentId: props.currentRole ? props.currentRole.id : null,
        parentNames: props.currentRole ? findRole.parentNames : '',
        code: '',
        priority: null,
        comment: '',
        enabled: 1,
        menuIds: [],
        orgIds: []
      }
    } else {
      form.value = { ...findRole, parentId: findRole.parentId === 0 ? null : findRole.parentId }
    }
    getMenuList()
    getOrgList()
  }

  const formRef = ref()
  // 新建/编辑角色
  function handleCreateOrEdit() {
    formRef.value.validate((validate: any) => {
      if (validate) {
        return
      }

      const api = props.isCreateRole ? RoleSettingApi.createRole : RoleSettingApi.updateRole
      api({
        ...form.value,
        parentId: form.value.parentId ?? 0,
        priority: form.value.priority ?? 0
      }).then(_ => {
        Message.success(props.isCreateRole ? '新增成功' : '编辑成功')
        currentVisible.value = false
        emits('confirm')
      })
    })
  }
</script>

<style lang="less">
  .role-user-modal {
    .role-form-enabled {
      .arco-form-item-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }
  }
</style>
