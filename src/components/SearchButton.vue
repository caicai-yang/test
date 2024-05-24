<template>
  <a-button type="primary" :size="size" class="primary-2" @click="onSearch">
    {{ buttonText }}
  </a-button>
</template>

<script lang="ts" setup name="SearchButton">
  import { computed, PropType } from 'vue'
  const props = defineProps({
    text: {
      type: String,
      default: '查询'
    },
    size: {
      type: String as PropType<'large' | 'mini' | 'medium' | 'small'>,
      default: 'large'
    }
  })
  const emits = defineEmits(['search'])

  const buttonText = computed(() => props.text)

  function onSearch() {
    emits('search')
  }
</script>
