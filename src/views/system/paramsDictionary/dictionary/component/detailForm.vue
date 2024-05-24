<template>
  <a-modal
    :visible="visible"
    :title="title"
    title-align="start"
    width="600px"
    ok-text="保存"
    :mask-closable="false"
    @cancel="handleCancel"
    @ok="handleOk"
  >
    <a-form ref="formRef" class="flex-form-2" :model="formData" :rules="rules">
      <a-form-item field="name" label="字典标签">
        <a-input v-model.trim="formData.name" :max-length="50" placeholder="请输入字典标签" />
      </a-form-item>
      <a-form-item field="value" label="标签键值">
        <a-input v-model.trim="formData.value" :max-length="50" placeholder="请输入标签键值" />
      </a-form-item>
      <a-form-item field="comment" label="字典项备注">
        <a-input v-model.trim="formData.comment" :max-length="100" placeholder="请输入字典项备注" />
      </a-form-item>
      <a-form-item field="enabled" label="启用状态">
        <a-radio-group v-model="formData.enabled" type="button">
          <a-radio :value="1">启用</a-radio>
          <a-radio :value="0">禁用</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item field="color" label="标签样式">
        <a-select v-model="formData.color" placeholder="请选择标签样式" allow-clear>
          <template #label="{ data: colorData }">
            <a-tag :color="colorData.value">{{ colorData.value }}</a-tag>
          </template>
          <a-option v-for="color in colorList" :key="color" :value="color">
            <a-tag :color="color">{{ color }}</a-tag>
          </a-option>
        </a-select>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script setup name="DetailForm" lang="ts">
  import { ref, reactive, getCurrentInstance, watch } from 'vue'
  import { Message } from '@arco-design/web-vue'
  import { createLabel, updateLabel } from '@/api/system/dictionary'

  const { proxy } = getCurrentInstance() as any

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '新增字典标签'
    },
    data: {
      type: Object,
      default: () => {}
    },
    dictionaryCode: {
      type: String,
      default: ''
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

  const colorList = [
    'red',
    'orangered',
    'orange',
    'gold',
    'lime',
    'green',
    'cyan',
    'blue',
    'arcoblue',
    'purple',
    'pinkpurple',
    'magenta',
    'gray'
  ]

  const formData = ref({
    name: '',
    value: '',
    comment: '',
    enabled: 1,
    color: ''
  })

  const rules = reactive({
    name: [{ required: true, message: '请输入字典标签' }],
    value: [{ required: true, message: '请输入标签键值' }]
  })

  const emits = defineEmits(['update:visible', 'success'])

  function handleCancel() {
    formData.value = {
      name: '',
      value: '',
      comment: '',
      enabled: 1,
      color: ''
    }
    proxy.$refs.formRef.resetFields()
    emits('update:visible', false)
  }

  function handleOk() {
    proxy.$refs.formRef.validate((valid: undefined | object) => {
      if (!valid) {
        if (props.data.id) {
          // 修改
          updateLabel({ dictionaryCode: props.dictionaryCode, ...formData.value }).then(_ => {
            Message.success('修改成功')
            emits('success')
            handleCancel()
          })
        } else {
          // 新增
          createLabel({ dictionaryCode: props.dictionaryCode, ...formData.value }).then(_ => {
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
