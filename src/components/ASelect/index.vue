<template>
  <Select ref="selectRef" v-model:popup-visible="popupVisible">
    <slot> </slot>
    <template v-for="slotName in existSlotNames" :key="slotName" #[slotName]="data">
      <slot :name="slotName" :data="data"></slot>
    </template>
  </Select>
</template>

<script setup lang="ts" name="ASelect">
  import { Select } from '@arco-design/web-vue'
  import { onMounted, onUnmounted, ref, useSlots, computed } from 'vue'
  import _ from 'lodash'
  import { IS_FIREFOX } from '@/utils'

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

  const selectRef = ref()

  const popupVisible = ref(false)

  const wheelName = IS_FIREFOX ? 'DOMMouseScroll' : 'mousewheel'

  const handleWheel = _.throttle((event: MouseEvent) => {
    const { disabled } = selectRef.value

    if (disabled || !popupVisible.value || isWheelInOption(event.target)) {
      return
    }

    popupVisible.value = false
  }, 100) as any

  function isWheelInOption(dom: any): boolean {
    if (dom?.className?.includes('select-option')) {
      return true
    }
    if (!dom) {
      return false
    }
    return isWheelInOption(dom.parentElement)
  }

  onMounted(() => {
    window.addEventListener(wheelName, handleWheel)
  })

  onUnmounted(() => {
    window.removeEventListener(wheelName, handleWheel)
  })
</script>

<style lang="less" scoped></style>
