<template>
  <a-modal
    :visible="visible"
    :title="title"
    title-align="start"
    width="600px"
    :mask-closable="false"
    @cancel="handleCancel"
    @ok="handleOk"
  >
    <a-form ref="formRef" class="flex-form-2" :model="formData" :rules="rules">
      <a-form-item field="name" label="参数名称">
        <a-input v-model.trim="formData.name" :max-length="50" placeholder="请输入参数名称" />
      </a-form-item>
      <a-form-item field="code" label="参数键名">
        <a-input v-model.trim="formData.code" :max-length="100" placeholder="请输入参数键名" />
      </a-form-item>
      <a-form-item field="value" label="参数键值">
        <a-input v-model.trim="formData.value" :max-length="100" placeholder="请输入参数键值" />
      </a-form-item>
      <a-form-item label="备注">
        <a-input v-model.trim="formData.comment" :max-length="200" placeholder="请输入备注" />
      </a-form-item>
      <a-form-item field="status" label="状态">
        <a-radio-group v-model="formData.status" type="button">
          <a-radio v-for="item in statusList" :key="item.value" :value="item.value">
            {{ item.name }}
          </a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script setup name="ParamsEditForm" lang="ts">
  import { ref, reactive, getCurrentInstance, watch } from 'vue'
  import { Message } from '@arco-design/web-vue'
  import { createConfig, updateConfig } from '@/api/system/params'
  import { useDictionary } from '@/hooks/useDictionary'

  const { proxy } = getCurrentInstance() as any

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '新增参数'
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
    value: '',
    comment: '',
    status: 'PUBLIC'
  })

  const rules = reactive({
    name: [{ required: true, message: '请输入参数名称' }],
    code: [{ required: true, message: '请输入参数键名' }],
    value: [{ required: true, message: '请输入参数键值' }]
  })

  const emits = defineEmits(['update:visible', 'success'])

  const statusList = useDictionary('SYS_CONFIG_STATUS')

  function handleCancel() {
    formData.value = {
      name: '',
      code: '',
      value: '',
      comment: '',
      status: 'PUBLIC'
    }
    proxy.$refs.formRef.resetFields()
    emits('update:visible', false)
  }

  function handleOk() {
    proxy.$refs.formRef.validate((valid: undefined | object) => {
      if (!valid) {
        if (props.data.id) {
          // 修改
          updateConfig(formData.value).then(_ => {
            Message.success('修改成功')
            emits('success')
            handleCancel()
          })
        } else {
          // 新增
          createConfig(formData.value).then(_ => {
            Message.success('新增成功')
            emits('success')
            handleCancel()
          })
        }
      }
    })
  }
</script>

<style lang="less" scoped>
  .flex-form-2 {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    :deep(.arco-form-item) {
      width: 50%;
      display: flex;
      .arco-form-item-label-col {
        width: 110px;
        flex: none;
      }
      .arco-form-item-wrapper-col {
        width: auto;
        flex: 1;
      }
    }
  }
</style>
