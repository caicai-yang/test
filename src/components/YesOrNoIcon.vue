<template>
  <Icon-check v-if="value" class="check" />
  <Icon-close v-else class="close" />
</template>
<script setup lang="ts" name="YesOrNoIcon">
  import { PropType } from 'vue'
  import { IEnabled } from '@/types/common'
  defineProps({
    value: {
      type: [Boolean, Number] as PropType<boolean | IEnabled>,
      default: 0
    }
  })
</script>
<style lang="less" scoped>
  .check {
    color: #70b654;
    font-size: 18px;
  }
  .close {
    color: #e0001b;
    font-size: 18px;
  }
</style>
