<template>
  <a-button type="primary" :size="size" :disabled="disabled" class="primary-button" @click="onAdd">
    <template v-if="isAddIcon" #icon>
      <IconPlus size="16" />
    </template>
    {{ buttonText }}
  </a-button>
</template>

<script lang="ts" setup name="AddButton">
  import { computed, PropType } from 'vue'
  const props = defineProps({
    text: {
      type: String,
      default: '新增'
    },
    isAddIcon: {
      type: Boolean,
      default: false
    },
    size: {
      type: String as PropType<'large' | 'mini' | 'medium' | 'small'>,
      default: 'large'
    },
    disabled: {
      type: Boolean,
      default: false
    }
  })
  const emits = defineEmits(['add'])

  const buttonText = computed(() => props.text)

  function onAdd() {
    emits('add')
  }
</script>

<style lang="less" scoped>
  .primary-button {
    padding: 0 20px;
  }
</style>
