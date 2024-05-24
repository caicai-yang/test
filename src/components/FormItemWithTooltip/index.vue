<template>
  <a-form-item>
    <template #label>
      <a-tooltip :content="tooltip" :disabled="!tooltip">
        <component :is="iconName" />
      </a-tooltip>
      <span>{{ label }}</span>
    </template>
    <slot></slot>
  </a-form-item>
</template>

<script setup lang="ts" name="FormItemWithTooltip">
  // eslint-disable-next-line
  import { IconQuestionCircleFill } from '@arco-design/web-vue/es/icon'

  type Props = {
    label?: string
    tooltip?: string
    iconName?: string
  }

  withDefaults(defineProps<Props>(), {
    label: '',
    tooltip: '',
    iconName: 'IconQuestionCircleFill'
  })
</script>

<style lang="less" scoped></style>
