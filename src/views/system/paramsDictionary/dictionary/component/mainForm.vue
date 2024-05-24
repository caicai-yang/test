<template>
  <a-modal
    :visible="visible"
    :title="title"
    title-align="start"
    width="500px"
    :mask-closable="false"
    ok-text="保存"
    @cancel="handleCancel"
    @ok="handleOk"
  >
    <a-form ref="formRef" :model="formData" :rules="rules" auto-label-width>
      <a-form-item field="name" label="字典名称">
        <a-input v-model.trim="formData.name" :max-length="50" placeholder="请输入字典名称" />
      </a-form-item>
      <a-form-item field="code" label="字典标识">
        <a-input v-model.trim="formData.code" :max-length="50" placeholder="请输入字典标识" />
      </a-form-item>
      <a-form-item label="备注">
        <a-input v-model.trim="formData.comment" :max-length="100" placeholder="请输入备注" />
      </a-form-item>
      <a-form-item label="启用状态">
        <a-radio-group v-model="formData.enabled" type="button">
          <a-radio :value="1">启用</a-radio>
          <a-radio :value="0">禁用</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script setup name="MainForm" lang="ts">
  import { ref, reactive, getCurrentInstance, watch } from 'vue'
  import { Message } from '@arco-design/web-vue'
  import { createDictionary, updateDictionary } from '@/api/system/dictionary'

  const { proxy } = getCurrentInstance() as any

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '新增字典'
    },
    data: {
      type: Object,
      default: () => {}
    }
  })

  watch(
    () => props.visible,
    val => {
      if (val && props.data.id) {
        formData.value = JSON.parse(JSON.stringify(props.data))
      }
    }
  )

  const formData = ref({
    name: '',
    code: '',
    comment: '',
    enabled: 1
  })

  const rules = reactive({
    name: [{ required: true, message: '请输入字典名称' }],
    code: [{ required: true, message: '请输入字典标识' }]
  })

  const emits = defineEmits(['update:visible', 'success'])

  function handleCancel() {
    formData.value = {
      name: '',
      code: '',
      comment: '',
      enabled: 1
    }
    proxy.$refs.formRef.resetFields()
    emits('update:visible', false)
  }

  function handleOk() {
    proxy.$refs.formRef.validate((valid: undefined | object) => {
      if (!valid) {
        if (props.data.id) {
          // 修改
          updateDictionary(formData.value).then(_ => {
            Message.success('修改成功')
            handleCancel()
            emits('success')
          })
        } else {
          // 新增
          createDictionary(formData.value).then(_ => {
            Message.success('新增成功')
            handleCancel()
            emits('success')
          })
        }
      }
    })
  }
</script>

<style lang="less" scoped>
  // .arco-input-wrapper {
  //   background: #fff;
  // }
  // :deep(.arco-picker) {
  //   background: #fff !important;
  // }
  // :deep(.arco-select-view-single) {
  //   background: #fff;
  // }
  // :deep(.arco-select-view) {
  //   background: #fff;
  // }
  // :deep(.arco-form-item-content) {
  //   border: 1px solid #ccc;
  // }

  // :deep(.arco-icon-hover) {
  //   display: none;
  // }
  // :deep(.arco-modal-footer) {
  //   text-align: center !important;
  // }

  // :deep(.clearnBorder > .arco-col > .arco-form-item-content-wrapper > .arco-form-item-content) {
  //   border: none !important;
  // }
  // :deep(.arco-switch-text) {
  //   position: absolute;
  //   top: 0;
  //   right: 15px;
  // }
</style>
