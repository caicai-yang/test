<template>
  <a-modal
    :visible="visible"
    :title="title"
    title-align="start"
    width="500px"
    :mask-closable="false"
    @cancel="handleCancel"
    @ok="handleOk"
  >
    <a-form ref="formRef" :model="formData" :rules="rules" auto-label-width>
      <a-form-item field="name" label="字段集合名称">
        <a-input v-model.trim="formData.name" :max-length="50" placeholder="请输入字段集合名称" />
      </a-form-item>
      <a-form-item field="comment" label="备注">
        <a-input v-model.trim="formData.comment" :max-length="200" placeholder="请输入备注" />
      </a-form-item>
      <a-form-item field="label" label="标签">
        <a-input v-model.trim="formData.label" :max-length="50" placeholder="请输入标签" />
      </a-form-item>
      <a-form-item field="service" label="所属服务">
        <a-input v-model.trim="formData.service" :max-length="50" placeholder="请输入所属服务" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script setup name="MainForm" lang="ts">
  import { ref, reactive, getCurrentInstance, watch } from 'vue'
  import { Message } from '@arco-design/web-vue'
  import { createTable, updateTable } from '@/api/system/field'

  const { proxy } = getCurrentInstance() as any

  const formData = ref({
    name: '',
    comment: '',
    label: '',
    service: ''
  })

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '新增字段集合'
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

  // const globalDisabled = computed(() => props.data.id)

  const rules = reactive({
    name: [{ required: true, message: '请输入字段集合名称' }],
    comment: [{ required: true, message: '请输入备注' }],
    label: [{ required: true, message: '请输入标签' }],
    service: [{ required: true, message: '请输入所属服务' }]
  })

  const emits = defineEmits(['update:visible', 'success'])

  function handleCancel() {
    formData.value = {
      name: '',
      comment: '',
      label: '',
      service: ''
    }
    proxy.$refs.formRef.resetFields()
    emits('update:visible', false)
  }

  function handleOk() {
    proxy.$refs.formRef.validate((valid: undefined | object) => {
      if (!valid) {
        if (props.data.id) {
          // 修改
          updateTable(formData.value).then(_ => {
            Message.success('修改成功')
            handleCancel()
            emits('success')
          })
        } else {
          // 新增
          createTable(formData.value).then(_ => {
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
