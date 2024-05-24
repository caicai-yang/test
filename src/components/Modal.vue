<template>
  <a-modal
    v-model:visible="modalVisible"
    v-bind="$attrs"
    class="modal-dialog-wrapper"
    title-align="start"
    :title="title"
    :ok-text="confirmButtonText"
    :cancel-text="cancelButtonText"
    :mask-closable="false"
    :footer="showFooter"
    :width="modelWidth"
    @before-open="handleOpen"
    @cancel="handleCancel"
  >
    <a-scrollbar outer-style="overflow: hidden" class="modal-dialog__wrap">
      <template v-if="type">
        <div class="modal-dialog-content">
          <component :is="IconName" :class="['modal-icon', `modal-icon-${type}`]" />
          <slot></slot>
        </div>
      </template>
      <slot v-else></slot>
    </a-scrollbar>
    <!-- 自定义footer, 解决@ok事件自动关闭弹窗问题 -->
    <template #footer>
      <!-- 需要在footer展示的自定义内容 -->
      <slot name="customFooter"></slot>
      <slot name="footer">
        <a-checkbox v-if="showChecked" v-model="createContinuous" class="continuous-checkbox">{{
          checkboxLabel
        }}</a-checkbox>
        <a-space>
          <a-button v-if="!hideCancel" @click="handleCancel">{{ cancelButtonText }}</a-button>
          <a-button
            type="primary"
            :loading="loading"
            :disabled="disabledConfirm"
            @click="handleConfirm"
            >{{ confirmButtonText }}</a-button
          >
        </a-space>
      </slot>
    </template>
  </a-modal>
</template>

<script setup lang="ts" name="Modal">
  import { computed, ref } from 'vue'
  import {
    IconExclamationCircleFill,
    IconInfoCircleFill,
    IconCheckCircleFill,
    IconCloseCircleFill
  } from '@arco-design/web-vue/es/icon'

  type Props = {
    visible: boolean
    title?: string
    confirmButtonText?: string
    cancelButtonText?: string
    loading?: boolean
    type?: string
    showChecked?: boolean
    isDefaultSelected?: boolean
    checkboxLabel?: string
    disabledConfirm?: boolean
    hideCancel?: boolean
    showFooter?: boolean
    width?: number | string | undefined // 弹窗宽度
    large?: boolean // 弹窗是否显示最大宽度（根据屏幕而定）
  }

  type Emits = {
    (event: 'update:visible', visible: boolean): void
    (event: 'cancel'): void
    (event: 'open'): void
    (event: 'confirm', createContinuous: boolean): void
  }

  const props = withDefaults(defineProps<Props>(), {
    visible: false,
    title: '操作',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    loading: false,
    type: '',
    showChecked: false, // 是否显示连续新建勾选checkbox
    isDefaultSelected: false, // 连续新建是否默认选中
    checkboxLabel: '连续新建', // checkbox显示文本
    disabledConfirm: false,
    showFooter: true, // 是否隐藏弹窗底部
    hideCancel: false, // 是否隐藏取消按钮
    width: ''
  })

  const emits = defineEmits<Emits>()
  const modelWidth =
    props.large && props.width
      ? Math.max(document.body.clientWidth * 0.75, Number(props.width.toString().split('px')[0]))
      : props.width

  const createContinuous = ref<boolean>(false)

  const modalVisible = computed({
    get() {
      return props.visible
    },
    set(visible: boolean) {
      emits('update:visible', visible)
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
    return ''
  })

  function handleCancel() {
    modalVisible.value = false
    emits('cancel')
  }

  function handleOpen() {
    createContinuous.value = props.isDefaultSelected || false
    emits('open')
  }

  const handleConfirm = () => {
    emits('confirm', createContinuous.value)
  }
</script>

<style lang="less">
  .modal-dialog-wrapper {
    .arco-modal-header {
      border-bottom: none;
    }

    .arco-modal-body {
      padding-right: 0;
    }

    .modal-dialog__wrap {
      max-height: 80vh;
      padding-right: 20px;
      overflow: auto;
      box-sizing: border-box;

      .modal-dialog-content {
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
      }

      .modal-icon {
        font-size: 18px;
        margin-right: 10px;
        flex: none;
        margin-top: 3px;
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
    }

    .arco-modal-footer {
      border-top: none;
      position: relative;
      .continuous-checkbox {
        position: absolute;
        left: 20px;
        bottom: 25px;
        user-select: none;
        padding-left: 0;
        .arco-checkbox-label {
          color: #999;
        }
      }
    }
  }
</style>
