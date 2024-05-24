<template>
  <Modal v-bind="$attrs" class="confirm-modal" @cancel="cancel">
    <div class="modal-dialog-content">
      <component :is="IconName" :class="['modal-icon', `modal-icon-${type}`]" />
      <Scrollbar style="max-height: 500px; overflow: auto">
        {{ $attrs.content }}
      </Scrollbar>
    </div>
    <template #footer>
      <slot name="footer">
        <Space>
          <Button @click="cancel">{{ $attrs.cancelText }}</Button>
          <Button type="primary" @click="confirm">{{ $attrs.okText }}</Button>
        </Space>
      </slot>
    </template>
  </Modal>
</template>

<script setup lang="ts" name="Confirm">
  import { computed } from 'vue'
  import { Modal, Space, Button, Scrollbar } from '@arco-design/web-vue'
  import {
    IconExclamationCircleFill,
    IconInfoCircleFill,
    IconCheckCircleFill,
    IconCloseCircleFill
  } from '@arco-design/web-vue/es/icon'

  const props = defineProps({
    type: {
      type: String,
      default: 'warning'
    },
    onConfirm: {
      type: Function,
      default: () => {}
    },
    onCancel: {
      type: Function,
      default: () => {}
    }
  })

  const IconName = computed(() => {
    const type = props.type
    if (type === 'warning') {
      return IconExclamationCircleFill
    }
    if (type === 'info') {
      return IconInfoCircleFill
    }
    if (type === 'success') {
      return IconCheckCircleFill
    }
    if (type === 'error') {
      return IconCloseCircleFill
    }
    return IconCheckCircleFill
  })

  function cancel() {
    props.onCancel()
  }

  function confirm() {
    props.onConfirm()
  }
</script>

<style lang="less" scoped>
  .modal-dialog-content {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  .modal-icon {
    font-size: 30px;
    margin-right: 10px;
    flex: none;
  }

  .modal-icon-info {
    color: rgb(var(--primary-6));
  }
  .modal-icon-warning {
    color: rgb(var(--warning-6));
  }

  .modal-icon-success {
    color: rgb(var(--success-6));
  }

  .modal-icon-error {
    color: rgb(var(--danger-6));
  }
</style>
