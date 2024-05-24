<template>
  <a-modal
    :visible="visible"
    :title="title"
    title-align="start"
    width="800px"
    :mask-closable="false"
    @cancel="handleCancel"
    @ok="handleOk"
  >
    <a-form ref="formRef" class="flex-form-2" :model="formData" :rules="rules">
      <a-form-item field="name" label="字段名称">
        <a-input v-model.trim="formData.name" :max-length="50" placeholder="请输入字段名称" />
      </a-form-item>
      <a-form-item field="fieldName" label="数据库字段名称">
        <a-input
          v-model.trim="formData.fieldName"
          :max-length="50"
          placeholder="请输入数据库字段名称"
        />
      </a-form-item>
      <a-form-item field="slotName" label="字段插槽">
        <a-input
          v-model.trim="formData.slotName"
          :max-length="50"
          placeholder="前端自定义插槽名称(slotName)"
        />
      </a-form-item>
      <a-form-item field="dictionaryCode" label="字典标识">
        <a-input
          v-model.trim="formData.dictionaryCode"
          :max-length="50"
          placeholder="请输入字典标识"
        />
      </a-form-item>
      <a-form-item field="dataType" label="数据类型">
        <a-select v-model.trim="formData.dataType" placeholder="请选择数据类型">
          <a-option
            v-for="item in dataTypeList"
            :key="item.value"
            :value="item.value"
            :label="item.name"
          />
        </a-select>
      </a-form-item>
      <a-form-item field="foreignTableName" label="外部关联表表名">
        <a-input
          v-model.trim="formData.foreignTableName"
          :max-length="50"
          placeholder="请输入外部关联表表名"
        />
      </a-form-item>
      <a-form-item field="type" label="类型">
        <a-select v-model.trim="formData.type" placeholder="请选择类型">
          <a-option
            v-for="item in typeList"
            :key="item.value"
            :value="item.value"
            :label="item.name"
          />
        </a-select>
      </a-form-item>
      <a-form-item field="foreignFieldName" label="外部关联表字段名">
        <a-input
          v-model.trim="formData.foreignFieldName"
          :max-length="50"
          placeholder="请输入外部关联表字段名"
        />
      </a-form-item>
      <a-form-item field="label" label="标签">
        <a-input v-model.trim="formData.label" :max-length="50" placeholder="请输入标签" />
      </a-form-item>
      <a-form-item field="comment" label="备注">
        <a-input v-model.trim="formData.comment" :max-length="200" placeholder="请输入备注" />
      </a-form-item>
      <a-form-item field="enabled" label="启用状态">
        <a-radio-group v-model="formData.enabled" type="button">
          <a-radio :value="1">启用</a-radio>
          <a-radio :value="0">禁用</a-radio>
        </a-radio-group>
      </a-form-item>
      <FormItemWithTooltip field="priority" label="显示排序" tooltip="数字越大显示优先级越高">
        <a-input-number
          v-model.trim="formData.priority"
          :min="0"
          :max="9999999999"
          :step="1"
          :precision="0"
          placeholder="请输入显示排序"
        />
      </FormItemWithTooltip>
      <a-form-item field="searchable" label="表头是否查询">
        <a-radio-group v-model="formData.searchable" type="button">
          <a-radio :value="1">是</a-radio>
          <a-radio :value="0">否</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item field="display" label="字段是否显示">
        <a-radio-group v-model="formData.display" type="button">
          <a-radio :value="1">是</a-radio>
          <a-radio :value="0">否</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item field="width" label="字段显示宽度">
        <a-input-number
          v-model.trim="formData.width"
          :min="0"
          :max="9999999999"
          :step="1"
          :precision="0"
          placeholder="请输入字段显示宽度"
        />
        <span style="margin-left: 10px">px</span>
      </a-form-item>
      <a-form-item field="freeze" label="字段显示位置">
        <a-select v-model="formData.freeze" allow-clear>
          <a-option value="left" label="左冻结" />
          <a-option value="right" label="右冻结" />
        </a-select>
      </a-form-item>
      <a-form-item field="hasEditIcon" label="字段编辑图标">
        <a-radio-group v-model="formData.hasEditIcon" type="button">
          <a-radio :value="1">是</a-radio>
          <a-radio :value="0">否</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script setup name="DetailForm" lang="ts">
  import { ref, reactive, getCurrentInstance, watch } from 'vue'
  import { Message } from '@arco-design/web-vue'
  import { createField, updateField } from '@/api/system/field'
  import { useDictionary } from '@/hooks/useDictionary'

  const { proxy } = getCurrentInstance() as any

  const formData = ref({
    name: '',
    fieldName: '',
    dataType: '',
    comment: '',
    type: '',
    dictionaryCode: '',
    foreignTableName: '',
    foreignFieldName: '',
    label: '',
    enabled: 1,
    priority: 0,
    searchable: 1,
    display: 1,
    width: 0,
    freeze: '' as 'left' | 'right' | '',
    slotName: '',
    hasEditIcon: 0
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
    },
    tableName: {
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

  const rules = reactive({
    name: [{ required: true, message: '请输入字段名称' }],
    fieldName: [{ required: true, message: '请输入数据库字段名称' }],
    dataType: [{ required: true, message: '请选择数据类型' }],
    type: [{ required: true, message: '请选择类型' }],
    comment: [{ required: true, message: '请输入备注' }],
    label: [{ required: true, message: '请输入标签' }],
    enabled: [{ required: true, message: '请选择启用状态' }],
    searchable: [{ required: true, message: '请选择是否过滤' }],
    display: [{ required: true, message: '请选择字段是否显示' }]
  })

  // const enabledOptions = useDictionary('SYS_MSG_STATUS')
  // const searchableOptions = useDictionary('ENABLED_OR_NOT')
  const dataTypeList = useDictionary('SYS_FIELD_DATA_TYPE')
  const typeList = useDictionary('SYS_FIELD_TYPE')

  // const dataTypeList = ref([
  //   {
  //     name: 'INTEGER',
  //     label: '整型'
  //   },
  //   {
  //     name: 'DECIMAL',
  //     label: '浮点型'
  //   },
  //   {
  //     name: 'STRING',
  //     label: '字符串'
  //   },
  //   {
  //     name: 'DATE',
  //     label: '日期'
  //   },
  //   {
  //     name: 'DATETIME',
  //     label: '时间'
  //   }
  // ])

  // const typeList = ref([
  //   {
  //     name: 'INNER',
  //     label: '表内部字段'
  //   },
  //   {
  //     name: 'OUTER',
  //     label: '外部关联表字段'
  //   }
  // ])

  const emits = defineEmits(['update:visible', 'success'])

  function handleCancel() {
    formData.value = {
      name: '',
      fieldName: '',
      dataType: '',
      comment: '',
      type: '',
      dictionaryCode: '',
      foreignTableName: '',
      foreignFieldName: '',
      label: '',
      enabled: 1,
      priority: 0,
      searchable: 1,
      display: 1,
      width: 0,
      freeze: '',
      slotName: '',
      hasEditIcon: 0
    }
    proxy.$refs.formRef.resetFields()
    emits('update:visible', false)
  }

  function handleOk() {
    proxy.$refs.formRef.validate((valid: undefined | object) => {
      if (!valid) {
        if (props.data.id) {
          // 修改
          updateField({ tableName: props.tableName, ...formData.value }).then(_ => {
            Message.success('修改成功')
            emits('success')
            handleCancel()
          })
        } else {
          // 新增
          createField({ tableName: props.tableName, ...formData.value }).then(_ => {
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
        width: 150px;
        flex: none;
      }
      .arco-form-item-wrapper-col {
        width: auto;
        flex: 1;
      }
    }
  }
</style>
