<template>
  <Modal
    v-model:visible="modalVisible"
    title="权限复制"
    @confirm="handleConfirm"
    @before-close="formRef.resetFields()"
  >
    <a-form ref="formRef" :model="form" :rules="rules">
      <a-form-item field="currentRoleId" label="角色名称">
        <a-tree-select
          v-model="form.currentRoleId"
          placeholder="请选择角色"
          allow-search
          :data="treeData"
          :filter-tree-node="filterTreeNode"
          :field-names="{ key: 'id', title: 'name', children: 'children' }"
        />
      </a-form-item>
    </a-form>
  </Modal>
</template>

<script setup lang="ts" name="CopyPermission">
  import { computed, ref } from 'vue'
  import Modal from '@/components/Modal.vue'
  import { IRoleDetail } from '@/types'
  import { RoleSettingApi } from '@/api'

  type TreeData = {
    id: number
    name: string
    children: TreeData[]
    [key: string]: any
  }

  type Props = {
    visible: boolean
    treeData: TreeData[]
  }

  type Emits = {
    (e: 'update:visible', visible: boolean): void
    (e: 'confirm', data: { menuIds: string[]; orgIds: number[] }): void
  }

  const props = withDefaults(defineProps<Props>(), {
    treeData: () => []
  })
  const emits = defineEmits<Emits>()

  const modalVisible = computed({
    get() {
      return props.visible
    },
    set(visible) {
      emits('update:visible', visible)
    }
  })

  const formRef = ref()
  const form = ref({
    currentRoleId: ''
  })

  const rules = ref({
    currentRoleId: [{ required: true, message: '请选择角色', trigger: 'change' }]
  })

  function filterTreeNode(searchValue: any, nodeData: any) {
    return nodeData.name.toLowerCase().indexOf(searchValue.toLowerCase()) > -1
  }

  function handleConfirm() {
    formRef.value.validate(async (valid: any) => {
      if (valid) {
        return
      }
      const { menuIds, orgIds }: IRoleDetail = (await RoleSettingApi.findRole({
        id: +form.value.currentRoleId
      })) as any

      emits('confirm', { menuIds, orgIds })
      modalVisible.value = false
    })
  }
</script>

<style lang="less" scoped></style>
