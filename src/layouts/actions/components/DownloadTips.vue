<template>
  <a-popover v-if="showDownloadTips" position="bottom" trigger="click">
    <div class="action-item">
      <a-badge :count="downloadList.length" dot>
        <DownloadTipsIcon />
      </a-badge>
    </div>
    <template #content>
      <div class="download-content">
        <div v-for="item in downloadList" :key="item.eventId" class="download-item">
          <div class="download-name">{{ item.title }}</div>
          <div class="flex">
            <a-progress width="60%" :stroke-width="5" :percent="item.process">
              <template #text> {{ currentProcess(item.process) }} </template>
            </a-progress>
            <template v-if="showDownloadButton(item.process)">
              <a-button
                type="primary"
                size="mini"
                class="download-button"
                @click="toDownload(item.url)"
              >
                保存到本地
              </a-button>
              <a-button size="mini" class="download-button" @click="removeEvent(item.eventId)">
                清除
              </a-button>
            </template>
          </div>
        </div>
      </div>
    </template>
  </a-popover>
</template>

<script setup="DownloadTips" lang="ts">
  import { computed } from 'vue'
  import { IconToBottom as DownloadTipsIcon } from '@arco-design/web-vue/es/icon'
  import useUserStore from '@/store/modules/user'
  import NP from 'number-precision'

  const userStore = useUserStore()

  const downloadList = computed(() => userStore.getDownloadList)
  const showDownloadTips = computed(() => !!downloadList.value.length)

  // 提示文本
  function currentProcess(process: number) {
    if (!process && process !== 0) {
      return '下载中 0%'
    }
    if (Number(process) < 1) {
      return `下载中... ${NP.times(process, 100)}%`
    }
    return '100%'
  }

  // 显示下载按钮
  function showDownloadButton(process: number) {
    if (!process) {
      return false
    }
    return Number(process) >= 1
  }

  // 下载到本地
  function toDownload(url: string) {
    if (!url) {
      return
    }
    window.location.href = url
  }

  // 清除已下载内容
  function removeEvent(eventId: string) {
    userStore.removeDownloadByEventID(eventId)
  }
</script>

<style scoped lang="less">
  .action-item {
    min-width: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
    height: 100%;
    &:hover {
      cursor: pointer;
      background-color: var(--color-secondary-hover);
    }
    :deep(.arco-badge-number, .arco-badge-dot, .arco-badge-text, .arco-badge-custom-dot) {
      transform: translate(10%, 20%);
    }
  }

  .download-content {
    width: 250px;
  }

  .download-button {
    padding: 2px 5px;
    margin-left: 10px;
  }
</style>
