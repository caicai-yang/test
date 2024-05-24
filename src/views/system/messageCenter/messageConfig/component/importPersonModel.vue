<template>
  <a-modal
    :visible="isImportPersonModel"
    title="导入用户"
    title-align="start"
    width="700px"
    :footer="false"
    @cancel="handleCancel"
  >
    <p style="margin-bottom: 5px">批量输入姓名（不同用户请换行）：</p>
    <div class="importPersonMain">
      <div style="width: 30%">
        <a-textarea
          v-model="textareaData"
          placeholder="请输入名字"
          style="height: 300px"
          @input="textareaInput"
        />
        <p>已输入行数 {{ textareaData === '' ? 0 : textareaLengthData }}行</p>
      </div>
      <div class="iconStyle">
        <p><icon-right @click="arrowRight" /></p>
        <p><icon-left @click="arrowLeft" /> </p>
      </div>
      <div style="flex: 1">
        <Table
          show-index
          is-selection
          :columns="tableHeader"
          :data="tableList"
          :row-selection="{ showCheckedAll: true }"
          :show-footer="false"
          :selected-keys="selectedRowKeys"
          @selection-change="handleSelection"
        />
      </div>
    </div>

    <div style="text-align: right; margin-top: 50px">
      <a-space>
        <a-button size="large" @click="handleCancel"> 取消 </a-button>
        <a-button type="primary" size="large" @click="handleOk"> 确定 </a-button>
      </a-space>
    </div>
  </a-modal>
</template>

<script lang="ts" setup name="ImportPerson">
  import { importPersonList, updatetPersonConfig } from '@/api/system/messageConfig'
  import { Message } from '@arco-design/web-vue'
  import { ref } from 'vue'
  import { useRoute } from 'vue-router'
  import _ from 'lodash-es'

  const route = useRoute()

  // textarea的值
  const textareaData = ref('')
  defineProps({
    isImportPersonModel: {
      type: Boolean
    }
  })
  const emit = defineEmits(['update:isImportPersonModel', 'againImportSearch'])

  const tableList = ref<any[]>([])

  const tableHeader = ref([
    {
      title: '用户名称',
      dataIndex: 'name'
    },
    {
      title: '用户账号',
      dataIndex: 'username'
    }
  ])

  const selectedRowKeys = ref<Array<number>>([])

  const textareaLengthData = ref(0)

  const handleCancel = () => {
    emit('update:isImportPersonModel', false)
    textareaData.value = ''
    tableList.value = []
    selectedRowKeys.value = []
  }

  function handleOk() {
    if (selectedRowKeys.value.length > 0) {
      updatetPersonConfig({
        userIdList: selectedRowKeys.value,
        configId: route.params.id as string
      }).then(_ => {
        emit('againImportSearch')
        handleCancel()
        Message.success('保存成功')
      })
    } else {
      Message.warning('请选择用户')
    }
  }

  // table 选择
  function handleSelection(val: Array<number>) {
    selectedRowKeys.value = val
  }

  // 导入用户: 左侧用户导入, 失败的保留
  const arrowRight = _.debounce(async function () {
    if (!textareaData.value.trim().length) {
      return
    }
    const textareaList: Array<string> = []
    selectedRowKeys.value = []
    textareaData.value.split('\n').forEach(item => {
      if (item) {
        item = item.replace(/\s*/g, '')
        !tableList.value.some(({ name }) => name === item) && textareaList.push(item)
      }
    })
    if (!textareaList.length) {
      return
    }
    const data = await importPerson(textareaList)
    tableList.value = [...tableList.value, ...data?.successUserList]
    textareaData.value = data?.failNameList.join('\n')
  }, 200)

  // 删除用户: 选中表格数据更新到左侧(增量)，更新表格数据
  const arrowLeft = _.debounce(function () {
    if (!selectedRowKeys.value.length) {
      return
    }
    const selectTableNames = []
    for (let i = 0; i < tableList.value.length; i++) {
      const tableItem: { [props: string]: any } = tableList.value[i]
      const isSame = selectedRowKeys.value.find(item => item === tableItem.id)
      if (isSame) {
        selectTableNames.push(tableItem.name)
        tableList.value.splice(i, 1)
        i = i - 1
      }
    }
    selectedRowKeys.value = []
    textareaData.value = textareaData.value + '\n' + selectTableNames.join('\n')
  }, 200)

  function textareaInput() {
    let textareaLength = 0
    textareaData.value.split('\n').forEach(item => {
      if (item && item !== '') {
        textareaLength++
      }
    })
    textareaLengthData.value = textareaLength
  }

  async function importPerson(data: string[]) {
    if (!data.length) {
      return
    }
    return importPersonList(data)
      .then(({ failNameList, successUserList }) => {
        return { failNameList, successUserList }
      })
      .catch(_ => {})
  }
</script>

<style lang="less" scoped>
  .importPersonMain {
    display: flex;
    .iconStyle {
      display: flex;
      flex-direction: column;
      justify-content: center;
      font-size: 30px;
      color: blue;
      cursor: pointer;
    }
  }
  :deep(.arco-table-tr-empty) {
    height: 200px;
  }
</style>
