<template>
  <a-button type="primary" size="large" class="primary-4" @click="onReset">
    {{ buttonText }}
  </a-button>
</template>

<script lang="ts" setup name="ResetButton">
  import { computed } from 'vue'
  const props = defineProps({
    text: {
      type: String,
      default: '重置'
    }
  })
  const emits = defineEmits(['reset'])

  const buttonText = computed(() => props.text)

  function onReset() {
    emits('reset')
  }
</script>
