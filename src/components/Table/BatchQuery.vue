<template>
  <a-modal
    v-model:visible="modalVisible"
    class="modal-dialog-wrapper"
    title-align="start"
    :title="title + '批量查询'"
    ok-text="确定"
    cancel-text="取消"
    :mask-closable="false"
    width="530px"
    :body-style="{ 'padding-top': '5px' }"
    @cancel="handleCancel"
  >
    <div v-show="isInput" class="tips">(支持块粘贴)</div>
    <div ref="batchQueryRef" class="batch-query-container">
      <div v-for="(record, rowIndex) in tableData" :key="rowIndex" class="flex batch-query-row">
        <div class="row-index">{{ rowIndex + 1 }}</div>
        <div class="row-content">
          <!-- 
          datetime 显示日期和时间
          date 显示日期
          time 显示时间
          -->
          <!-- 日期和时间区间选择 -->
          <a-range-picker
            v-if="dataType === 'datetime'"
            v-model="record.pickerValue"
            :time-picker-props="{ defaultValue: ['00:00:00', '23:59:59'] }"
            show-time
            style="flex: 1"
            allow-clear
            format="YYYY-MM-DD HH:mm:ss"
          />
          <!-- 日期区间选择 -->
          <a-range-picker
            v-else-if="dataType === 'date'"
            v-model="record.pickerValue"
            :time-picker-props="{ defaultValue: ['00:00:00', '23:59:59'] }"
            style="flex: 1"
            allow-clear
            format="YYYY-MM-DD"
          />
          <!-- 时间区间选择 -->
          <a-time-picker
            v-else-if="dataType === 'time'"
            v-model="record.pickerValue"
            type="time-range"
            disable-confirm
            style="flex: 1"
          />
          <!-- 其余条件选择 -->
          <template v-else>
            <!-- 筛选条件 -->
            <a-select
              v-model="record.operator"
              placeholder="请选择"
              style="width: 100px; margin-right: 5px"
            >
              <a-option
                v-for="item in comparatorList"
                :key="item"
                :value="item"
                :label="comparatorTranslate[item]"
              />
            </a-select>

            <!-- 若有字典值，则展示字典对应选项 -->
            <a-select
              v-if="dictionaryCode"
              v-model="record.searchValue"
              style="flex: 1"
              placeholder="请选择"
            >
              <a-option
                v-for="item in getDictionary(dictionaryCode)"
                :key="item.value"
                :value="item.value"
                :label="item.name"
              />
            </a-select>

            <!-- 若无字典，则直接展示输入框 -->
            <a-input
              v-else
              v-model.trim="record.searchValue"
              placeholder="请输入"
              allow-clear
              style="flex: 1"
              @focus="handleCellClick(rowIndex)"
            />
          </template>
          <a-space style="margin-left: 10px">
            <a-button type="primary" size="mini" shape="circle" @click="handleAdd">
              <icon-plus />
            </a-button>
            <a-button
              v-if="rowIndex > 0"
              type="primary"
              status="danger"
              size="mini"
              shape="circle"
              @click="handleMinus(rowIndex)"
            >
              <icon-minus />
            </a-button>
          </a-space>
        </div>
      </div>
    </div>
    <template #footer>
      <a-space>
        <a-button type="primary" size="small" class="primary-4" @click="handleReset">
          重置
        </a-button>
        <a-button size="small" @click="handleCancel">取消</a-button>
        <a-button type="primary" size="small" @click="handleConfirm">确定</a-button>
      </a-space>
    </template>
  </a-modal>
</template>

<script setup="BatchQuery" lang="ts">
  import { ref, computed, PropType, getCurrentInstance } from 'vue'
  import { useDictionary } from '@/hooks/useDictionary'
  import { pasteText } from './utils/table'

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    // 字段key值
    dataIndex: {
      type: String,
      default: ''
    },
    // 数据类型
    dataType: {
      type: String,
      default: ''
    },
    // 字典值
    dictionaryCode: {
      type: String,
      default: ''
    },
    // 选项列表
    comparatorList: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    // 选项文本对应值
    comparatorTranslate: {
      type: Object,
      default: () => {}
    }
  })

  const emits = defineEmits(['update:visible', 'confirm', 'reset'])
  const { proxy } = getCurrentInstance() as any

  const modalVisible = computed({
    get() {
      return props.visible
    },
    set(visible: boolean) {
      emits('update:visible', visible)
    }
  })

  const isInput = computed(
    () => !['datetime', 'date', 'time'].includes(props.dataType) && !props.dictionaryCode
  )

  const pasteFields = ref<'searchValue'[]>(['searchValue'])
  const increaseRow = ref(true)
  const editKey = 'searchValue'

  const tableData = ref([
    {
      operator: props.comparatorList[0],
      searchValue: '',
      pickerValue: []
    }
  ])

  // 获取字典数组
  function getDictionary(value: string) {
    const currentDictionary = useDictionary(value)
    return currentDictionary.value
  }

  function handleAdd() {
    tableData.value.push({
      operator: props.comparatorList[0] ?? 0,
      searchValue: '',
      pickerValue: []
    })
  }

  function handleMinus(rowIndex: number) {
    tableData.value.splice(rowIndex, 1)
  }

  const currentCell = ref()
  let hasPasteListener = false // 是否已有粘贴监听事件
  function handleCellClick(index: number) {
    currentCell.value = {
      column: {
        field: editKey
      },
      rowIndex: index
    }

    // 不需要块粘贴
    if (!isInput.value) {
      if (hasPasteListener) {
        proxy.$refs.batchQueryRef?.removeEventListener('paste', handlePaste)
        hasPasteListener = false
      }
      return
    }

    // 需要块粘贴且还没有监听粘贴事件
    if (isInput.value && !hasPasteListener) {
      hasPasteListener = true
      proxy.$refs.batchQueryRef?.addEventListener('paste', handlePaste)
    }
  }

  function handlePaste(e: ClipboardEvent) {
    e.preventDefault()
    pasteText(
      e,
      currentCell.value,
      pasteFields.value,
      tableData.value,
      increaseRow.value,
      () => {},
      (rowIndexList: number[]) => {
        pasteEnd(rowIndexList)
      }
    )
  }

  function pasteEnd(rowIndexList: number[]) {
    const currentOperator = tableData.value[rowIndexList[0]].operator
    rowIndexList.forEach((rowIndex: number) => {
      tableData.value[rowIndex].operator = currentOperator
    })
  }

  function reset() {
    tableData.value = [
      {
        operator: props.comparatorList[0],
        searchValue: '',
        pickerValue: []
      }
    ]
  }

  function handleReset() {
    reset()
    emits('reset')
    handleCancel()
  }

  function handleCancel() {
    modalVisible.value = false
    if (hasPasteListener) {
      proxy.$refs.batchQueryRef?.removeEventListener('paste', handlePaste)
      hasPasteListener = false
    }
  }

  function handleConfirm() {
    let queryData = []
    let conditions = []

    if (props.dataType && ['date', 'time', 'datetime'].includes(props.dataType)) {
      // 日期、时间、日期时间
      queryData = tableData.value.filter(v => v.pickerValue && v.pickerValue.length)
      conditions = queryData.map(item => ({
        field: props.dataIndex,
        comparator: 'BETWEEN',
        params: [item.pickerValue[0], item.pickerValue[1]]
      }))
    } else {
      // 字典或输入框
      queryData = tableData.value.filter(v => v.operator && v.searchValue)
      conditions = queryData.map(item => ({
        field: props.dataIndex,
        comparator: item.operator,
        params: [item.searchValue]
      }))
    }

    if (!queryData?.length) {
      emits('confirm', [])
      return handleCancel()
    }

    emits('confirm', conditions)
    handleCancel()
  }

  defineExpose({
    reset
  })
</script>

<style lang="less" scoped>
  .tips {
    font-size: 12px;
    color: #a0a0a0;
  }
  .batch-query-container {
    border: solid 1px #e8eaec;
    max-height: 300px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }
    /*滚动条的轨道*/
    &::-webkit-scrollbar-track {
      background-color: #ffffff;
    }
    /*滚动条里面的小方块，能向上向下移动*/
    &::-webkit-scrollbar-thumb {
      background-color: rgba(212, 215, 221, 0.8);
      border-radius: 5px;
    }
    &::-webkit-scrollbar-thumb:hover {
      background-color: rgba(158, 166, 176, 0.8);
    }
    &::-webkit-scrollbar-thumb:active {
      background-color: rgb(158, 166, 176);
    }
    /*边角，即两个滚动条的交汇处*/
    &::-webkit-scrollbar-corner {
      background-color: #ffffff;
    }

    .batch-query-row {
      & + .batch-query-row {
        border-top: solid 1px #e8eaec;
      }
      .row-index {
        width: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-right: solid 1px #e8eaec;
      }
      .row-content {
        flex: 1;
        display: flex;
        padding: 5px 10px;
      }
    }
  }
</style>
