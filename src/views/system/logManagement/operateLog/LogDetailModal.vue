<template>
  <Modal v-model:visible="currentVisible" title="操作日志详情">
    <div class="log-detail">
      <div v-for="(item, index) in list" :key="index" class="log-detail-item">
        <span class="log-detail-item__title">{{ item.title }}：</span>
        <span class="log-detail-item__value">{{ item.value }}</span>
      </div>
    </div>
    <template #footer>
      <a-button type="primary" @click="currentVisible = false">关闭</a-button>
    </template>
  </Modal>
</template>

<script setup lang="ts" name="LogDetailModal">
  import { computed } from 'vue'
  import { IAuditLogDetail } from '@/types'

  type Props = {
    visible: boolean
    detail: IAuditLogDetail
  }

  type Emits = {
    (e: 'update:visible', visible: boolean): void
  }

  const props = defineProps<Props>()
  const emits = defineEmits<Emits>()

  const currentVisible = computed({
    get() {
      return props.visible
    },
    set(visible: boolean) {
      emits('update:visible', visible)
    }
  })

  const list = computed(() => {
    return [
      { title: '日志ID', value: props.detail.id },
      { title: 'IP地址', value: props.detail.clientIpLocation },
      { title: '操作人', value: props.detail.operator },
      { title: '登录IP', value: props.detail.clientIp },
      { title: '请求方式', value: props.detail.method },
      { title: '操作方法', value: props.detail.operationMethod },
      { title: '请求地址', value: props.detail.url },
      { title: '请求参数', value: props.detail.parameter },
      { title: '返回参数', value: props.detail.result },
      { title: '操作内容', value: props.detail.operation },
      { title: '操作时间', value: props.detail.operationTime },
      { title: '异常信息', value: props.detail.errorMsg }
    ]
  })
</script>

<style lang="less" scoped>
  .log-detail {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    overflow-x: hidden;

    .log-detail-item {
      width: 100%;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      font-size: 14px;
      line-height: 1.5;
      word-break: break-all;
      .log-detail-item__title {
        width: 80px;
        flex: none;
      }

      .log-detail-item__value {
        width: calc(100% - 80px);
      }
    }

    .log-detail-item + .log-detail-item {
      margin-top: 12px;
    }
    .log-detail-item:nth-child(-n + 6),
    .log-detail-item:nth-last-child(-n + 2) {
      width: 50%;
    }
  }
</style>
