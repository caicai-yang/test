<template>
  <Modal
    v-model:visible="currentVisible"
    width="700px"
    :title="isCreate ? '新增组织' : '编辑组织'"
    :loading="loading"
    @before-open="handleBeforeOpen"
    @confirm="handleCreateOrEdit"
  >
    <a-form ref="formRef" :model="form" :rules="rules" class="flex-form-2">
      <a-form-item field="code" label="组织代码">
        <a-input v-model="form.code" placeholder="请输入组织代码" :max-length="50" />
      </a-form-item>
      <a-form-item field="name" label="组织名称">
        <a-input v-model="form.name" placeholder="请输入组织名称" :max-length="50" />
      </a-form-item>
      <a-form-item v-if="isOperateTree" label="父级组织">
        <a-input :key="form.parentNames" disabled :default-value="form.parentNames" />
      </a-form-item>
      <template v-else>
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

        <a-form-item field="type" label="组织类型">
          <a-select v-model="form.type" placeholder="请选择">
            <a-option
              v-for="item in orgType"
              :key="item.value"
              :value="item.value"
              :label="item.name"
            />
          </a-select>
        </a-form-item>

        <a-form-item field="attribute" label="组织属性">
          <a-select v-model="form.attribute" placeholder="请选择">
            <a-option
              v-for="item in orgAttribute"
              :key="item.value"
              :value="item.value"
              :label="item.name"
            />
            <a-option />
          </a-select>
        </a-form-item>

        <a-form-item label="组织负责人">
          <a-input v-model="form.director" placeholder="请输入负责人" :max-length="100" />
        </a-form-item>

        <a-form-item label="备注">
          <a-input v-model="form.comment" placeholder="请输入备注" :max-length="200" />
        </a-form-item>
      </template>
      <a-form-item label="启用状态">
        <a-radio-group v-model="form.enabled" type="button">
          <a-radio :value="1">启用</a-radio>
          <a-radio :value="0">禁用</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </Modal>
</template>

<script setup lang="ts" name="AddOrEditOrgModal">
  import { computed, ref } from 'vue'
  import { OrgStructureApi } from '@/api'
  import { useDictionary } from '@/hooks/useDictionary'
  import { IOrgTreeItem, IOrgListItem } from '@/types'
  import { Message } from '@arco-design/web-vue'

  type Props = {
    visible: boolean
    isCreate: boolean
    isOperateTree: boolean
    currentOperateOrg: IOrgTreeItem | IOrgListItem | null | undefined
  }

  type Emits = {
    (e: 'update:visible', visible: boolean): void
    (e: 'confirm'): void
  }

  const props = defineProps<Props>()
  const emits = defineEmits<Emits>()

  const loading = ref(false)
  const currentVisible = computed({
    get() {
      return props.visible
    },
    set(visible: boolean) {
      emits('update:visible', visible)
    }
  })

  const formRef = ref()
  // 新增时org表单
  const form = ref<any>({})
  const rules = ref({
    code: [{ required: true, message: '请输入组织代码', trigger: 'blur' }],
    name: [{ required: true, message: '请输入组织名称', trigger: 'blur' }],
    type: [{ required: true, message: '请选择组织类型', trigger: 'change' }],
    attribute: [{ required: true, message: '请选择组织属性', trigger: 'change' }]
  })

  // 字典
  const orgType = useDictionary('SYS_ORG_TYPE')
  const orgAttribute = useDictionary('SYS_ORG_ATTRIBUTE')

  async function handleBeforeOpen() {
    formRef.value.clearValidate()

    if (props.isCreate) {
      const { id, parentNames, name } = props.currentOperateOrg || {}
      // 无组织架构树时传0
      form.value = {
        code: '',
        name: '',
        enabled: 1,
        parentId: id || 0,
        parentNames: parentNames ? parentNames + '/' + name : name || ''
      }
    } else {
      form.value = await OrgStructureApi.findOrg({ id: props.currentOperateOrg!.id })
    }
  }

  // 新增/编辑组织
  function handleCreateOrEdit() {
    formRef.value.validate((validate: any) => {
      if (validate) {
        return
      }
      loading.value = true
      const api = props.isCreate ? OrgStructureApi.createOrg : OrgStructureApi.updateOrg
      api({
        ...form.value,
        priority: form.value.priority ?? 0
      } as any)
        .then(() => {
          Message.success(props.isCreate ? '新增成功' : '编辑成功')
          currentVisible.value = false
          emits('confirm')
        })
        .finally(() => {
          loading.value = false
        })
    })
  }
</script>

<style lang="less" scoped></style>
