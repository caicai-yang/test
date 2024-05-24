<template>
  <a-select
    ref="selectRef"
    v-model="currentSelected"
    v-model:input-value="inputValue"
    :class="[multiple && isScrollTag ? 'multiple-select' : '']"
    :multiple="multiple"
    allow-search
    allow-clear
    :limit="limit"
    :loading="loading"
    :filter-option="false"
    :show-extra-options="false"
    :disabled="disabled"
    v-bind="$attrs"
    @dropdown-reach-bottom="handleReachBottom"
    @search="handleSearch"
    @clear="handleClear"
    @change="handleChange"
    @popup-visible-change="popVisibleChange"
  >
    <a-option
      v-for="item in transferData"
      :key="dataKey === 'self' ? item : item[dataKey]"
      :value="jsonStringify(item)"
      :label="transferLabel(item)"
      :title="hasNativeTooltip ? transferLabel(item) : ''"
      :style="item.hideItem ? { display: 'none' } : ''"
    />
    <template v-for="slotName in existSlotNames" :key="slotName" #[slotName]="{ data }">
      <slot :name="slotName" :data="data"></slot>
    </template>
  </a-select>
</template>

<script setup lang="ts" name="SelectInfiniteScroll">
  import { ref, computed, onMounted, onUnmounted, toRef, useSlots } from 'vue'
  import _ from 'lodash'

  type Props = {
    disabled?: boolean // 是否禁用
    limit?: number // 最多选择
    fieldNames?: Record<string, string> | undefined // 接口字段转换
    defaultData?: Record<string, string> | undefined // 单选时，默认选项对应的下拉选择数据，解决回显只显示code问题
    modelValue?: any[] | string | number // 多选数组, 单选字符串
    api: (params: Record<string, any>) => Promise<any>
    queryParams?: Record<string, any>
    dataKey?: string // option 唯一标识
    valueKey?: string // value 取值字段
    searchKey?: string // 下拉框搜索key值
    labelFormatter: ((item: any) => string) | string
    multiple?: boolean
    disabledData?: Record<string, any> | Array<Record<string, any>> | undefined
    hasNativeTooltip?: boolean
    returnSelf?: boolean // 是否返回选中自身
    formatterKeyword?: (keyword: string) => string
    isScrollTag?: boolean // 多选时是否需要单行内滚动
  }

  const props = withDefaults(defineProps<Props>(), {
    limit: 5,
    disabled: false,
    fieldNames: undefined,
    defaultData: undefined,
    modelValue: () => [],
    queryParams: () => ({
      currentPage: 1,
      pageSize: 10
    }),
    multiple: true,
    dataKey: 'id',
    valueKey: 'id',
    searchKey: 'keyword',
    disabledData: undefined,
    hasNativeTooltip: false,
    returnSelf: false,
    formatterKeyword: undefined,
    isScrollTag: false
  })

  const emits = defineEmits<{
    (e: 'update:modelValue', data: any[] | any): void
    (e: 'change', data: any[] | any): void
    (e: 'getData', data: any[] | any): void
    (e: 'clear'): void
  }>()

  const slots = useSlots()
  // Select 支持的插槽
  const supportSlotNames = [
    'trigger', // 自定义触发元素
    'prefix', // 前缀元素
    'search-icon', // 选择框的搜索图标
    'loading-icon', // 选择框的加载中图标
    'arrow-icon', // 选择框的箭头图标
    'footer', // 下拉框的页脚
    'header', // 下拉框的页头
    'label', // 选择框的显示内容, data: SelectOptionData
    'option', // 选项内容, data: SelectOptionData
    'empty' // 选项为空时的显示内容
  ]

  // 业务代码传进来的插槽
  const existSlotNames = computed(() => {
    return supportSlotNames.filter(slotName => slots[slotName])
  })

  const currentSelected = computed({
    get() {
      if (!props.multiple) {
        return props.modelValue
      }
      return (props.modelValue as any[])?.map(item => JSON.stringify(item)) ?? []
    },
    set(value: string[] | string) {
      if (!props.multiple) {
        return emits('update:modelValue', value)
      }

      emits(
        'update:modelValue',
        (value as string[]).map(item => jsonParse(item))
      )
    }
  })

  const loading = ref(false)
  const currentQueryParams = toRef(props, 'queryParams')

  const data = ref<any[]>([])
  const total = ref()

  function jsonStringify(item: any) {
    if (!props.multiple) {
      return props.dataKey === 'self' ? item : item[props.valueKey]
    }
    try {
      return JSON.stringify(item)
    } catch (error) {
      return item
    }
  }

  function jsonParse(item: any) {
    try {
      return JSON.parse(item)
    } catch (error) {
      return item
    }
  }

  // 选项 label
  function transferLabel(item: any) {
    if (typeof props.labelFormatter === 'function') {
      return props.labelFormatter(item)
    }

    return props.dataKey === 'self' ? item : item[props.labelFormatter]
  }

  // 转化数据
  const transferData = computed(() => {
    if (props.disabled) {
      if (props.defaultData) {
        return [props.defaultData]
      }
      return props.disabledData ?? props.modelValue
    }
    const transferData = props.fieldNames
      ? data.value.map((item: any) => {
          const newItem: any = {}
          for (const key in props.fieldNames) {
            newItem[props.fieldNames[key]] = item[key]
          }
          return newItem
        })
      : _.cloneDeep(data.value)

    // 单选时，下拉选项分页，解决第二页起的值回显问题
    if (!props.multiple && props.defaultData && props.defaultData[props.dataKey]) {
      const differenceDefault = _.differenceBy(
        [{ ...props.defaultData, hideItem: true }],
        transferData,
        props.dataKey
      )
      differenceDefault.length && transferData.unshift(...differenceDefault)
    }

    const differenceData = _.differenceBy(props.modelValue, transferData, props.dataKey)
    differenceData.length && transferData.push(...differenceData)

    return transferData
  })

  // 输入框内容
  const inputValue = ref('')

  // 滚动加载
  function handleReachBottom() {
    // 已经加载全部
    if (data.value.length === total.value) {
      return
    }
    currentQueryParams.value.currentPage = currentQueryParams.value.currentPage + 1
    props.api(currentQueryParams.value).then((res: any) => {
      data.value = [...data.value, ...res.list]
      total.value = res.totalCount
      emits('getData', data.value)
    })
  }

  // 清除
  function handleClear() {
    handleSearch('')
    emits('clear')
  }

  // 搜索
  const handleSearch = _.debounce(function (keyword: string) {
    loading.value = true
    currentQueryParams.value.currentPage = 1
    if (props.formatterKeyword) {
      currentQueryParams.value[props.searchKey] = props.formatterKeyword(keyword)
      inputValue.value = props.formatterKeyword(keyword)
    } else {
      currentQueryParams.value[props.searchKey] = keyword
    }

    props
      .api(currentQueryParams.value)
      .then((res: any) => {
        data.value = res.list
        total.value = res.totalCount
        emits('getData', data.value)
      })
      .finally(() => {
        loading.value = false
      })
  }, 300)

  const handleChange = (value: any) => {
    if (props.multiple && !value?.length) {
      handleSearch('')
    }
    if (props.returnSelf) {
      const item = (transferData.value as any).filter((v: any) => v[props.valueKey] === value)[0]
      return emits('change', item)
    }
    emits('change', value)
  }

  const popVisibleChange = (visible: boolean) => {
    if (!visible && !currentSelected.value?.length && !transferData.value?.length) {
      reset()
    }
  }

  // 重置数据
  function reset() {
    data.value = []
    total.value = 0
    handleSearch('')
  }

  const selectRef = ref()
  const selectInputRef = ref()

  function handleSelectBlur() {
    // 单选且当前值不在列表中(多选默认拼接到transferData中了)
    const notInList =
      !props.multiple &&
      !(transferData.value as any[]).some(item => {
        if (props.dataKey === 'self') {
          return item === currentSelected.value
        }
        return item[props.valueKey] === currentSelected.value
      })

    // 有关键字并且当前值不在列表中, 重置下拉列表
    if ((currentQueryParams.value[props.searchKey] && notInList) || props.formatterKeyword) {
      handleSearch('')
    }
  }

  onMounted(() => {
    !props.disabled && handleSearch('')

    selectInputRef.value = selectRef.value?.$el.parentNode.getElementsByTagName('input')[0]

    selectInputRef.value && selectInputRef.value.addEventListener('blur', handleSelectBlur)
  })

  onUnmounted(() => {
    selectInputRef.value && selectInputRef.value.removeEventListener('blur', handleSelectBlur)
  })

  defineExpose({
    reset
  })
</script>

<style lang="less">
  .multiple-select {
    .arco-select-view-inner {
      overflow: auto !important;
      height: 32px;
    }
  }
</style>
