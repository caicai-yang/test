<template>
  <div class="flex justify-content-between align-items-center content">
    <span class="title">{{ title }}</span>
    <div v-if="showRight" class="flex justify-content-end">
      <slot name="extra"></slot>
    </div>
  </div>
</template>
<script setup name="ContentTitle" lang="ts">
  import { useSlots } from 'vue'
  defineProps({
    title: {
      type: String,
      default: ''
    }
  })

  const slots = useSlots()
  const showRight = !!slots.extra
</script>
<style lang="less" scoped>
  .content {
    margin-bottom: 10px;
  }
  .title {
    font-family: '微软雅黑 Bold', '微软雅黑 Regular', '微软雅黑', sans-serif;
    font-weight: 700;
    font-style: normal;
    font-size: 15px;
    color: var(--color-text-1);
  }
  .justify-content-end {
    :deep(button + button) {
      margin-left: 16px;
    }
  }
</style>
