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
      <a-form-item field="locale" label="语种名称">
        <a-select v-model="formData.locale" placeholder="请选择语种名称">
          <a-option
            v-for="local in localList"
            :key="local.value"
            :value="local.value"
            :label="local.name"
            :disabled="disabledLocal(local.value as string)"
          />
        </a-select>
      </a-form-item>
      <a-form-item field="value" label="语种值">
        <a-input v-model.trim="formData.value" :max-length="100" placeholder="请输入语种值" />
      </a-form-item>
      <a-form-item field="enabled" label="状态">
        <a-radio-group v-model="formData.enabled" type="button">
          <a-radio v-for="item in enabledList" :key="item.value" :value="+item.value">
            {{ item.name }}
          </a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script setup name="LanguageEditForm" lang="ts">
  import { ref, reactive, getCurrentInstance, watch } from 'vue'
  import { Message } from '@arco-design/web-vue'
  import { createLanguage, updateLanguage } from '@/api/system/language'
  import { useDictionary } from '@/hooks/useDictionary'

  const { proxy } = getCurrentInstance() as any

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '新增语种'
    },
    data: {
      type: Object,
      default: () => {}
    },
    // 类型
    type: {
      type: String,
      default: ''
    },
    // 关联数据ID
    foreignId: {
      type: [String, Number],
      default: ''
    },
    // 已被添加local
    selectLocalList: {
      type: Array<String>,
      default: () => []
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
    id: '',
    locale: '',
    value: '',
    enabled: 1 as 0 | 1
  })

  const rules = reactive({
    locale: [{ required: true, message: '请选择语种名称' }],
    value: [{ required: true, message: '请输入语种值' }]
  })

  const emits = defineEmits(['update:visible', 'success'])

  const localList = useDictionary('SYS_LOCALE')
  const enabledList = useDictionary('ENABLED_OR_NOT')

  function disabledLocal(value: string) {
    return props.selectLocalList.includes(value)
  }

  function handleCancel() {
    formData.value = {
      id: '',
      locale: '',
      value: '',
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
          const requestParams = {
            id: formData.value.id,
            locale: formData.value.locale,
            value: formData.value.value,
            enabled: formData.value.enabled
          }
          updateLanguage(requestParams).then(_ => {
            Message.success('修改成功')
            emits('success')
            handleCancel()
          })
        } else {
          // 新增
          const requestParams = {
            locale: formData.value.locale,
            value: formData.value.value,
            type: props.type,
            enabled: formData.value.enabled,
            foreignId: props.foreignId
          }
          createLanguage(requestParams).then(_ => {
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
