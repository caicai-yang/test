<template>
  <!-- <div :class="['custom-th', 'arco-table-cell', `arco-table-cell-align-${column.align}`]"> -->
  <span v-if="column.required" class="arco-table-required">*</span>
  <span v-if="column.hasEditIcon"><icon-edit class="edit-icon" /></span>
  {{ column.title }}
  <a-popconfirm
    v-if="column.filter || column.searchable"
    position="bottom"
    ok-text="确定"
    cancel-text="重置"
    @ok="confirm"
    @cancel="handleReset"
  >
    <!-- 不显示icon -->
    <template #icon><span></span></template>
    <!-- 弹窗内容部分 -->
    <template #content>
      <a-space direction="vertical">
        <a-space>
          <!-- 
          datetime 显示日期和时间
          date 显示日期
          time 显示时间
          -->
          <!-- 日期和时间区间选择 -->
          <div v-if="DATATYPE === 'datetime'">
            <a-range-picker
              v-model="dateTimeValue"
              :time-picker-props="{ defaultValue: ['00:00:00', '23:59:59'] }"
              show-time
              style="width: 380px"
              allow-clear
              format="YYYY-MM-DD HH:mm:ss"
            />
          </div>
          <!-- 日期区间选择 -->
          <div v-else-if="DATATYPE === 'date'">
            <a-range-picker
              v-model="dateValue"
              :time-picker-props="{ defaultValue: ['00:00:00', '23:59:59'] }"
              style="width: 380px"
              allow-clear
              format="YYYY-MM-DD"
            />
          </div>
          <!-- 时间区间选择 -->
          <div v-else-if="DATATYPE === 'time'">
            <a-time-picker
              v-model="timeValue"
              type="time-range"
              disable-confirm
              style="width: 252px"
            />
          </div>
          <!-- 其余条件选择 -->
          <div v-else>
            <a-space>
              <!-- 筛选条件 -->
              <a-select v-model="formData.operator" style="width: 100px" placeholder="请选择">
                <a-option
                  v-for="item in comparatorList"
                  :key="item"
                  :value="item"
                  :label="comparatorTranslate[item]"
                />
              </a-select>
              <!-- 若有字典值，则展示字典对应选项 -->
              <a-select
                v-if="column.dictionaryCode"
                v-model="formData.searchValue"
                style="width: 180px"
                placeholder="请选择"
              >
                <a-option
                  v-for="item in getDictionary(column.dictionaryCode)"
                  :key="item.value"
                  :value="item.value"
                  :label="item.name"
                />
              </a-select>
              <!-- 若无字典，则直接展示输入框 -->
              <a-input
                v-else
                v-model.trim="formData.searchValue"
                style="width: 180px"
                placeholder="请输入"
                allow-clear
              />
            </a-space>
          </div>
          <icon-list
            class="icon-list"
            :style="{
              color: isBatchActive ? 'rgb(var(--primary-6))' : 'var(--color-text-2)'
            }"
            @click="showBatchSearch"
          />
        </a-space>
        <div class="flex justify-content-center">
          <!-- 排序 -->
          <a-radio-group v-model="sortValue">
            <a-radio value="ASC">正序</a-radio>
            <a-radio value="DESC">倒序</a-radio>
          </a-radio-group>
        </div>
      </a-space>
    </template>
    <!-- 过滤按钮图标 -->
    <span class="arco-icon-hover arco-icon-hover-disabled arco-table-filters">
      <icon-filter
        :style="{
          cursor: 'pointer',
          color: isActive ? 'rgb(var(--primary-6))' : 'var(--color-text-2)'
        }"
      />
    </span>
  </a-popconfirm>

  <!-- 批量查询框 -->
  <BatchQuery
    v-if="hasBatchSearch"
    ref="batchQueryRef"
    v-model:visible="modalVisible"
    :title="column.title"
    :data-index="column.dataIndex"
    :data-type="DATATYPE"
    :dictionary-code="column.dictionaryCode"
    :comparator-list="comparatorList"
    :comparator-translate="comparatorTranslate"
    @reset="batchQueryReset"
    @confirm="batchQueryConfirm"
  />
</template>
<script setup="TableTh" lang="ts">
  import { ref, computed, watch } from 'vue'
  import { useDictionary } from '@/hooks/useDictionary'
  import type { Condition, Sort } from '@/types/common'

  const props = defineProps({
    column: {
      type: Object,
      default: () => {}
    },
    queryParams: {
      type: Object,
      default: () => ({
        currentPage: 1,
        pageSize: 10,
        conditions: [] as Array<Condition>,
        sorts: [] as Array<Sort>
      })
    }
  })

  const emits = defineEmits(['filter'])
  const modalVisible = ref(false)
  const batchQueryRef = ref()
  const sysFieldComparator = useDictionary('SYS_FIELD_COMPARATOR') // 字段比较符

  // 表头查询下拉选项翻译
  const comparatorTranslate = computed<{ [key: string]: string }>(() => {
    if (!sysFieldComparator.value?.length) {
      return {
        EQ: '等于',
        NOT_EQ: '不等于',
        GT: '大于',
        LT: '小于',
        LIKE: '包含',
        NOT_LIKE: '不包含'
      }
    }

    const sysFieldComparatorTranslate: { [key: string]: string } = {}
    sysFieldComparator.value.forEach(item => {
      sysFieldComparatorTranslate[item.value] = item.name
    })

    return sysFieldComparatorTranslate
  })

  // 默认显示的列表: 等于 包含 不包含
  const defaultComparator = ['EQ', 'LIKE', 'NOT_LIKE']

  // 筛选项标题下拉列表
  const comparatorList = computed(() => {
    if (props.column.comparators && props.column.comparators instanceof Array) {
      return props.column.comparators
    }

    if (props.column.dictionaryCode) {
      return ['EQ', 'NOT_EQ']
    }

    return defaultComparator
  })

  /**
   * 字段类型
   * 区分 DATE、DATETIME 与其他类型
   */
  const DATATYPE = computed(() => {
    if (props.column.dataType && typeof props.column.dataType === 'string') {
      return props.column.dataType.toLowerCase()
    }

    return null
  })

  const isActive = computed(() => {
    const { dataIndex } = props.column
    const { conditions, sorts } = props.queryParams
    return (
      conditions.some((item: any) => item.field === dataIndex) ||
      sorts.some((item: any) => item.field === dataIndex)
    )
  })

  const isBatchActive = computed(() => currentBatchConditions.value.length > 0)

  const formData = ref({
    operator: '', // 下拉框选中类型
    searchValue: '' // 输入框文本
  })
  const dateTimeValue = ref([]) // 日期时间值
  const dateValue = ref([]) // 日期值
  const timeValue = ref([]) // 时间值
  const sortValue = ref('') // 排序

  // 筛选条件被重置时, 去除已有值
  watch(
    () => props.queryParams.conditions,
    currentConditions => {
      if (!currentConditions) {
        return
      }

      if (!currentConditions.some((item: any) => item.field === props.column.dataIndex)) {
        formData.value = {
          operator: '',
          searchValue: ''
        }
        dateTimeValue.value = []
        dateValue.value = []
        timeValue.value = []
        sortValue.value = ''

        // 重置BatchQuery组件相关数据
        batchQueryRef.value?.reset()
        currentBatchConditions.value = []
      }
    },
    { deep: true }
  )

  // 获取字典数组
  function getDictionary(value: string) {
    const currentDictionary = useDictionary(value)
    return currentDictionary.value
  }

  // 确定
  function confirm() {
    const condition = {
      field: props.column.dataIndex,
      comparator: formData.value.operator,
      params: [] as Array<string>
    }
    const sort = {
      field: props.column.dataIndex,
      order: sortValue.value
    }

    const conditions = []

    if (DATATYPE.value && ['date', 'time', 'datetime'].includes(DATATYPE.value)) {
      const currentValue = ref([])
      switch (DATATYPE.value) {
        // 日期
        case 'date':
          currentValue.value = dateValue.value
          break
        // 时间
        case 'time':
          currentValue.value = timeValue.value
          break
        // 日期时间
        case 'datetime':
          currentValue.value = dateTimeValue.value
          break
        default:
          break
      }

      condition.comparator = 'BETWEEN'
      if (currentValue.value.length !== 0) {
        condition.params = [currentValue.value[0], currentValue.value[1]]
      } else {
        condition.params = []
      }
    } else if (!formData.value.operator || !formData.value.searchValue) {
      // 其余类型，未选择比较符或未填写查询内容，则回传参数内容为空
      condition.comparator = ''
      condition.params = []
    } else {
      condition.comparator = formData.value.operator
      condition.params = [formData.value.searchValue]
    }

    if (condition.comparator && condition.params.length) {
      conditions.push(condition)
    }
    if (currentBatchConditions.value.length) {
      conditions.push(...currentBatchConditions.value)
    }

    emits('filter', {
      conditions,
      sort
    })
  }

  // 重置
  function reset() {
    formData.value = {
      operator: '', // 下拉框选中类型
      searchValue: '' // 输入框文本
    }
    dateTimeValue.value = []
    dateValue.value = []
    timeValue.value = []
    sortValue.value = ''

    // 查询字段置空
    const sort = {
      field: props.column.dataIndex,
      order: ''
    }
    emits('filter', {
      conditions: [],
      sort
    })
  }

  function handleReset() {
    reset()
    // 重置BatchQuery组件相关数据
    batchQueryRef.value?.reset()
    currentBatchConditions.value = []
  }

  const hasBatchSearch = ref(false)
  function showBatchSearch() {
    !hasBatchSearch.value && (hasBatchSearch.value = true)
    modalVisible.value = true
  }

  const currentBatchConditions = ref<Condition[]>([])
  // 批量查询重置
  function batchQueryReset() {
    currentBatchConditions.value = []
    reset()
  }

  // 批量查询确认
  function batchQueryConfirm(conditions: Condition[]) {
    currentBatchConditions.value = conditions
    confirm()
  }
</script>
<style lang="less" scoped>
  .custom-th {
    display: table-cell;

    & > :deep(.vxe-cell) {
      padding: 0;
      display: inline-grid;
    }
  }
  .arco-icon-setting {
    position: absolute;
    top: 0;
    right: left;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 100%;
    line-height: 1;
    vertical-align: 0;
    background-color: transparent;
    cursor: pointer;
    transition: all 0.1s cubic-bezier(0, 0, 1, 1);
  }

  .arco-table-required {
    color: rgb(var(--danger-6));
    margin-right: 4px;
  }

  .edit-icon {
    font-size: 15px;
    color: rgb(var(--primary-6));
  }

  .icon-list {
    font-size: 20px;
    cursor: pointer;
  }
</style>
