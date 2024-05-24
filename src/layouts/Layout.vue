<template>
  <a-config-provider :locale="locale">
    <div
      class="vaw-layout-container"
      :class="[appStore.deviceType === 'mobile' && 'is-mobile', appStore.theme]"
    >
      <!-- 上下布局 -->
      <template v-if="appStore.layoutMode === 'ttb'">
        <VAWHeader />
        <InnerSideBar />
        <MainLayout :show-nav-bar="false" />
      </template>
      <!-- 分栏 -->
      <template v-else-if="appStore.layoutMode === 'lcr'">
        <TabSplitSideBar />
        <MainLayout />
      </template>
      <!-- 左右 -->
      <template v-else>
        <SideBar />
        <MainLayout />
      </template>
      <div
        v-if="appStore.deviceType === 'mobile'"
        class="mobile-shadow"
        :class="[appStore.isCollapse ? 'close-shadow' : 'show-shadow']"
        @click="closeMenu"
      ></div>
    </div>
  </a-config-provider>
  <Setting ref="settingRef" />
  <SearchContent ref="searchContentRef" />
</template>

<script lang="ts">
  import { defineComponent, onBeforeUnmount, onMounted, ref, computed } from 'vue'
  import useEmit from '@/hooks/useEmit'
  import useAppConfigStore from '@/store/modules/app-config'
  import { useChangeMenuWidth } from '@/hooks/useMenuWidth'
  import usePrimaryColor from '@/hooks/usePrimaryColor'
  import useTheme from '@/hooks/useTheme'
  import { DeviceType } from '@/store/types'
  import useLanguageStore from '@/store/modules/language'
  // 简体中文
  import zhCN from '@arco-design/web-vue/es/locale/lang/zh-cn'
  // 繁体中文
  import zhTW from '@arco-design/web-vue/es/locale/lang/zh-tw'
  // 英文
  import enUS from '@arco-design/web-vue/es/locale/lang/en-us'
  // 德语
  import deDE from '@arco-design/web-vue/es/locale/lang/de-de'
  // 法语
  import frFR from '@arco-design/web-vue/es/locale/lang/fr-fr'
  // 泰语
  import thTH from '@arco-design/web-vue/es/locale/lang/th-th'
  // 韩语
  import koKR from '@arco-design/web-vue/es/locale/lang/ko-kr'
  // 日文
  import jaJP from '@arco-design/web-vue/es/locale/lang/ja-jp'

  interface Locales {
    [key: string]: any
  }

  export default defineComponent({
    name: 'Layout',
    setup() {
      const languageStore = useLanguageStore()
      const locales = {
        zh_CN: zhCN,
        zh_TW: zhTW,
        en_US: enUS,
        de_DE: deDE,
        fr_FR: frFR,
        th_TH: thTH,
        ko_KR: koKR,
        ja_JP: jaJP
      } as Locales
      const locale = computed(() => locales[languageStore.localLang] || 'zh_CN')

      const settingRef = ref()
      const searchContentRef = ref()
      const appStore = useAppConfigStore()
      useTheme(appStore.theme as 'light' | 'dark')
      useChangeMenuWidth(appStore.sideWidth)
      usePrimaryColor(appStore.themeColor)
      const emitter = useEmit()
      emitter?.on('show-setting', () => {
        settingRef.value?.openDrawer()
      })
      emitter?.on('show-search', () => {
        searchContentRef.value?.show()
      })
      onMounted(() => {
        handleScreenResize()
        window.addEventListener('resize', handleScreenResize)
      })
      onBeforeUnmount(() => {
        window.removeEventListener('resize', handleScreenResize)
      })
      function handleScreenResize() {
        const width = document.body.clientWidth
        if (width <= 768) {
          appStore.changeDevice(DeviceType.MOBILE)
          appStore.toggleCollapse(true)
        } else if (width < 992 && width > 768) {
          appStore.changeDevice(DeviceType.PAD)
          appStore.toggleCollapse(true)
        } else if (width < 1200 && width >= 992) {
          appStore.changeDevice(DeviceType.PC)
          appStore.toggleCollapse(false)
        } else {
          appStore.changeDevice(DeviceType.PC)
          appStore.toggleCollapse(false)
        }
      }
      function closeMenu() {
        appStore.toggleCollapse(true)
      }
      return {
        settingRef,
        searchContentRef,
        appStore,
        closeMenu,
        locale
      }
    }
  })
</script>

<style lang="less">
  .vaw-layout-container {
    height: 100%;
    max-width: 100%;
    position: relative;
    overflow-x: hidden;
    .mobile-shadow {
      display: none;
    }
    .layout-mode-ttb {
      margin-top: @logoHeight;
      transition: all @transitionTime;
    }
  }
  .is-mobile {
    .mobile-shadow {
      background-color: #000000;
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 997;
    }
    .close-shadow {
      display: none;
    }
    .show-shadow {
      display: block;
      opacity: 0.5;
      transition: all @transitionTime;
    }
  }
</style>
