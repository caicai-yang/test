<template>
  <span :class="{ 'form-item arco-input-wrapper arco-input-disabled': formItem }">
    <template v-for="item in options" :key="item.value">
      <template v-if="values.includes(item.value as string)">
        <a-tag v-if="item.color" class="dict-tag" :color="item.color" :size="size">{{
          item.name
        }}</a-tag>
        <span v-else>{{ item.name }}</span>
      </template>
    </template>
  </span>
</template>

<script setup name="DictTag" lang="ts">
  import { computed } from 'vue'
  import type { PropType } from 'vue'
  import { Dictionary } from '@/types/common'

  const props = defineProps({
    // 字典数组数据
    options: {
      type: Array as PropType<Dictionary[]>,
      default: () => []
    },
    // 当前的值
    value: {
      type: [Number, String, Boolean, Array],
      default: null
    },
    // 是否需要form表单样式
    formItem: {
      type: Boolean,
      default: false
    },
    // tag标签尺寸大小 cause by LK
    size: {
      type: String as PropType<'medium' | 'small' | 'large' | undefined>,
      default: 'medium'
    }
  })

  const values = computed(() => {
    if (props.value !== null && typeof props.value !== 'undefined') {
      // 转string是为了解决显示问题，字典返回的boolean值为string
      return Array.isArray(props.value) ? props.value.map(i => String(i)) : [String(props.value)]
    }
    return []
  })
</script>
<style lang="less" scoped>
  .dict-tag {
    height: auto;
    padding: 5px 8px;
    white-space: unset;
  }

  .form-item {
    min-height: 32px;
  }
</style>
