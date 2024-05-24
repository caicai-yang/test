<template>
  <a-progress
    class="progress"
    :class="[currentTextAlign, textColor]"
    v-bind="colorObj"
    :width="width"
    :stroke-width="strokeWidth"
    :percent="currentPercent"
  >
    <template #text>
      <template v-if="fraction">
        <span style="margin-right: 8px"> {{ fraction[0] + '/' + fraction[1] }}</span>
      </template>
      {{ text }}
    </template>
  </a-progress>
</template>

<script setup lang="ts" name="Progress">
  import { computed } from 'vue'
  import NP from 'number-precision'
  import type { IProgressStatus } from '@/types'

  type Props = {
    strokeWidth?: number
    status?: IProgressStatus
    percent?: number | undefined // 必须小于1
    width?: string | number
    fraction?: [number, number] | undefined
    textAlign?: 'left' | 'right' | undefined
  }

  const props = withDefaults(defineProps<Props>(), {
    size: 'large',
    percent: undefined,
    strokeWidth: 16,
    status: 'primary',
    width: '100%',
    fraction: undefined,
    textAlign: undefined
  })

  const currentPercent = computed(() => {
    if (props.percent !== undefined) {
      return NP.divide(props.percent, 100)
    }
    if (props.fraction) {
      const [number1, number2] = props.fraction
      return +(number1 / number2).toFixed(4)
    }
    return 0
  })

  const text = computed(() => {
    return `${NP.times(currentPercent.value, 100)}%`
  })

  const colorObj = computed<{ color: string; trackColor: string }>(() => {
    if (props.status === 'primary') {
      return { color: 'rgb(var(--primary-6))', trackColor: 'rgba(var(--primary-6), 0.6)' }
    }

    if (props.status === 'warning') {
      return { color: 'rgb(var(--warning-6))', trackColor: 'rgba(var(--warning-6), 0.6)' }
    }

    if (props.status === 'success') {
      return { color: 'rgb(var(--success-6))', trackColor: 'rgba(var(--success-6), 0.6)' }
    }

    if (props.status === 'info') {
      return { color: 'rgb(117, 117, 117)', trackColor: 'rgb(221, 211, 211)' }
    }

    return { color: 'rgb(var(--danger-6))', trackColor: 'rgba(var(--danger-6), 0.6)' }
  })

  const progressText = computed(() => {
    return {
      width: typeof props.width === 'number' ? props.width + 'px' : props.width,
      lineHeight: props.strokeWidth + 'px'
    }
  })

  const currentTextAlign = computed(() => {
    if (props.textAlign === 'left') {
      return 'align-left'
    } else if (props.textAlign === 'right') {
      return 'align-right'
    }
    return ''
  })

  // eslint-disable-next-line vue/return-in-computed-property
  const textColor = computed(() => {
    if (!props.textAlign) {
      return ''
    } else if (props.status === 'primary') {
      return 'primary-text'
    } else if (props.status === 'warning') {
      return 'warning-text'
    } else if (props.status === 'success') {
      return 'success-text'
    } else if (props.status === 'info') {
      return 'info-text'
    }
    return 'danger-text'
  })
</script>

<style lang="less" scoped>
  .progress {
    :deep(.arco-progress-line-wrapper) {
      position: relative;
      .arco-progress-line-text {
        margin: 0;
        position: absolute;
        width: v-bind('progressText.width');
        height: 100%;
        line-height: v-bind('progressText.lineHeight');
        text-align: center;
        color: #fff;
        font-size: 12px;
      }
    }
    &.align-left :deep(.arco-progress-line-wrapper) {
      padding-left: 40px;
      .arco-progress-line-text {
        position: absolute;
        left: 0;
        color: inherit;
        width: auto;
      }
    }
    &.align-right :deep(.arco-progress-line-wrapper .arco-progress-line-text) {
      position: static;
      color: var(--color-text-2);
      width: auto;
      padding-left: 3px;
    }

    &.primary-text :deep(.arco-progress-line-wrapper .arco-progress-line-text) {
      color: rgb(var(--primary-6));
    }
    &.warning-text :deep(.arco-progress-line-wrapper .arco-progress-line-text) {
      color: rgb(var(--warning-6));
    }
    &.success-text :deep(.arco-progress-line-wrapper .arco-progress-line-text) {
      color: rgb(var(--success-6));
    }
    &.danger-text :deep(.arco-progress-line-wrapper .arco-progress-line-text) {
      color: rgb(var(--danger-6));
    }
    &.info-text :deep(.arco-progress-line-wrapper .arco-progress-line-text) {
      color: rgb(117, 117, 117);
    }
  }
</style>
