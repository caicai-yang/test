<template>
  <div class="action-items-wrapper">
    <DownloadTips />
    <span v-if="appStore.actionBar.isShowSearch" class="action-item" @click="onShowSearch">
      <SearchIcon />
    </span>
    <!-- <a-popover position="bottom" trigger="click"> -->
    <a-badge
      v-if="appStore.actionBar.isShowMessage"
      :count="userStore.unreadMessageNum"
      class="action-item"
      @click="toMessageList"
    >
      <NotificationsIcon />
    </a-badge>
    <!-- <template #content>
        <MessageContent />
      </template>
    </a-popover> -->
    <span v-if="appStore.actionBar.isShowRefresh" class="action-item" @click="onRefreshRoute">
      <RefreshIcon />
    </span>
    <span
      v-if="appStore.actionBar.isShowFullScreen && appStore.deviceType !== 'mobile'"
      class="action-item"
      @click="onScreenFull"
    >
      <ExpandIcon />
    </span>
    <span class="action-item" @click="onShowSetting">
      <SettingIcon />
    </span>
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue'
  import { Message } from '@arco-design/web-vue'
  import { useRoute, useRouter } from 'vue-router'
  import {
    IconSettings as SettingIcon,
    IconSearch as SearchIcon,
    IconFullscreen as ExpandIcon,
    IconRefresh as RefreshIcon,
    IconNotification as NotificationsIcon
  } from '@arco-design/web-vue/es/icon'
  import { useDebounceFn, useFullscreen } from '@vueuse/core'
  import useEmit from '@/hooks/useEmit'
  import useAppConfigStore from '@/store/modules/app-config'
  import useUserStore from '@/store/modules/user'
  import DownloadTips from './components/DownloadTips.vue'
  import useVisitedRouteStore from '@/store/modules/visited-routes'

  export default defineComponent({
    name: 'ActionItems',
    components: {
      SearchIcon,
      SettingIcon,
      ExpandIcon,
      NotificationsIcon,
      RefreshIcon,
      DownloadTips
    },
    setup() {
      const showSearchContent = ref(false)
      const searchContent = ref('')
      const settingRef = ref()
      const appStore = useAppConfigStore()
      const userStore = useUserStore()
      const router = useRouter()
      const route = useRoute()
      const emitter = useEmit()
      function onShowSearch() {
        emitter?.emit('show-search')
      }
      const { isSupported, enter, isFullscreen, exit } = useFullscreen(document.documentElement)
      function onScreenFull() {
        if (!isSupported) {
          Message.error('当前浏览器不支持全屏操作')
          return false
        }
        if (isFullscreen.value) {
          exit()
        } else {
          enter()
        }
      }
      const debouncedFn = useDebounceFn(() => {
        router.replace({ path: '/redirect' + route.path })
      }, 200)
      const visitedRouteStore = useVisitedRouteStore()
      function onRefreshRoute() {
        visitedRouteStore.deleteRefreshCachePath(route as any).then(() => {
          debouncedFn()
        })
      }
      function onShowSetting() {
        emitter?.emit('show-setting')
      }
      function toMessageList() {
        router.push('/system/messageCenter/messageList')
      }
      return {
        settingRef,
        showSearchContent,
        searchContent,
        appStore,
        userStore,
        onShowSearch,
        onScreenFull,
        onRefreshRoute,
        onShowSetting,
        toMessageList
      }
    }
  })
</script>

<style lang="less" scoped>
  .action-items-wrapper {
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
    z-index: 1;
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
  }
</style>
