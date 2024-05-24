<template>
  <a-popover v-model="visible" trigger="click" @popup-visible-change="visibleChange">
    <template #content>
      <div class="icon-container">
        <a-tabs
          v-model="iconActiveKey"
          :default-active-key="defaultActiveKey"
          class="tabs-container"
          size="small"
          @change="tabsChange($event as string)"
        >
          <a-tab-pane key="pc">
            <template #title> <icon-desktop size="15" /> pc 端 </template>
          </a-tab-pane>
          <a-tab-pane key="pda">
            <template #title> <icon-mobile size="15" /> pda 端 </template>
          </a-tab-pane>
        </a-tabs>
        <a-input
          v-model.trim="searchValue"
          placeholder="搜索图标名称"
          allow-clear
          style="width: 100%"
          class="input-search-button"
          @clear="onSearch"
          @press-enter="onSearch"
        >
          <template #suffix>
            <icon-search :size="15" @click="onSearch" />
          </template>
        </a-input>
        <div class="mt-4"></div>
        <div class="icon-wrapper">
          <a-row :wrap="true">
            <template v-if="isPCIcon">
              <a-col v-for="item of iconNames" :key="item" :span="4">
                <div
                  class="flex justify-center align-items-center flex-col icon-item"
                  :class="{ active: iconActive(item) }"
                  @click="onSelectItem(item)"
                >
                  <component :is="item" style="font-size: 26px" />
                  <div class="label-name" :class="{ active: iconActive(item) }">{{ item }}</div>
                </div>
              </a-col>
            </template>
            <template v-else>
              <!-- pda 端使用本地svg图标 -->
              <a-col v-for="item of svgIconNames" :key="item" :span="4">
                <div
                  class="flex justify-center align-items-center flex-col icon-item svg-item"
                  @click="onSelectItem(item, 'customerSvg')"
                >
                  <SvgIcon :name="item" style="width: 25px; height: 25px" :color="svgColor(item)" />
                  <div class="label-name" :class="{ active: iconActive(item) }">{{ item }}</div>
                </div>
              </a-col>
            </template>
          </a-row>
        </div>
        <div class="mt-1"></div>
        <a-pagination
          size="mini"
          :page-size="pageSize"
          :total="total"
          :show-size-changer="false"
          @change="onPageChange"
        />
      </div>
    </template>
    <a-button v-if="!seletedItem" type="primary">请选择图标</a-button>
    <a-button v-else status="success">
      已选择 &nbsp;&nbsp;
      <!-- 本地svg图标 -->
      <template v-if="seletedItem.startsWith(CUSTOMER_SVG_PREFIX)">
        <SvgIcon
          :name="seletedItem.split(CUSTOMER_SVG_PREFIX)[1]"
          style="width: 15px; height: 15px"
          color="#00b42a"
        />
      </template>
      <!-- ui icon -->
      <component :is="seletedItem" v-else />
    </a-button>
  </a-popover>
</template>

<script lang="ts" setup>
  import * as Icons from '@arco-design/web-vue/es/icon'
  import SvgIcon from './SvgIcon/index.vue'
  import { useClipboard } from '@vueuse/core'
  import { Message } from '@arco-design/web-vue'
  import { ref, watch, computed } from 'vue'
  import { CUSTOMER_SVG_PREFIX } from '@/utils/constant'
  const svgSource = import.meta.glob('@/assets/icons/svg/*.svg')

  const emit = defineEmits(['onSelect', 'update:value'])
  const props = defineProps({
    value: {
      type: String,
      default: ''
    },
    enableCopy: {
      type: Boolean,
      default: false
    }
  })
  const iconList = Object.keys(Icons).filter(it => it !== 'default')
  const svgList = ref<string[]>([])
  const iconActiveKey = ref('pc')
  const tempActive = ref('pc')
  const defaultActiveKey = ref('pc')
  const pageSize = 24
  const currentPage = ref(1)
  const iconNames = ref(iconList.slice(0, pageSize))
  const svgIconNames = ref<string[]>([])
  const searchList = ref<Array<string>>([])
  const total = ref(iconList.length)
  const visible = ref(false)
  const seletedItem = ref(props.value)
  const searchValue = ref('')

  watch(
    () => props.value,
    newVal => {
      seletedItem.value = newVal
    }
  )

  const isPCIcon = computed(() => iconActiveKey.value === 'pc')

  function handleSvgNames() {
    const _svgList = []
    for (const path in svgSource) {
      const p = path.split('/src/assets/icons/svg/')[1].split('.svg')[0]
      _svgList.push(p)
    }
    svgList.value = _svgList
    svgIconNames.value = svgList.value.slice(0, pageSize)
  }

  // 切换终端（pc 或 pda）
  function tabsChange(value: string) {
    iconActiveKey.value = value
    tempActive.value = value
    searchValue.value = ''
    iconNames.value = iconList.slice(0, pageSize)
    svgIconNames.value = svgList.value.slice(0, pageSize)
    if (value === 'pc') {
      total.value = iconList.length
    } else {
      total.value = svgList.value.length
    }
  }

  // svg区分是否选中
  function svgColor(item: string) {
    return seletedItem.value && seletedItem.value.split(CUSTOMER_SVG_PREFIX)[1] === item
      ? '#00b42a'
      : '#4e5969'
  }

  function iconActive(item: string) {
    if (!seletedItem.value) {
      return false
    }
    // pda端
    if (seletedItem.value.startsWith(CUSTOMER_SVG_PREFIX)) {
      return seletedItem.value.split(CUSTOMER_SVG_PREFIX)[1] === item
    }
    // PC端
    return seletedItem.value === item
  }

  function onPageChange(page: number) {
    const _iconList = isPCIcon.value ? iconList : svgList.value
    currentPage.value = page
    const _newIconNames =
      searchList.value.length === 0
        ? _iconList.slice((page - 1) * pageSize, page * pageSize)
        : searchList.value.slice((page - 1) * pageSize, page * pageSize)
    if (isPCIcon.value) {
      iconNames.value = _newIconNames
    } else {
      svgIconNames.value = _newIconNames
    }
  }
  function onSearch() {
    const _iconList = isPCIcon.value ? iconList : svgList.value
    if (searchValue.value) {
      const temp = searchValue.value.toLowerCase()
      searchList.value = _iconList.filter(it => {
        return it.toLowerCase().includes(temp)
      })
      total.value = searchList.value.length
      if (isPCIcon.value) {
        iconNames.value = searchList.value.slice(0, pageSize)
      } else {
        svgIconNames.value = searchList.value.slice(0, pageSize)
      }
    } else {
      searchList.value = []
      total.value = _iconList.length
      const _newIconNames = _iconList.slice(
        (currentPage.value - 1) * pageSize,
        currentPage.value * pageSize
      )
      if (isPCIcon.value) {
        iconNames.value = _newIconNames
      } else {
        svgIconNames.value = _newIconNames
      }
    }
  }
  async function onSelectItem(item: string, iconType?: string) {
    const _item = iconType === 'customerSvg' ? CUSTOMER_SVG_PREFIX + item : item
    emit('onSelect', _item)
    emit('update:value', _item)
    seletedItem.value = _item
    visible.value = false
    if (props.enableCopy) {
      const { isSupported, copied, copy } = useClipboard()
      if (isSupported) {
        await copy(`<${item} />`)
        if (copied) {
          Message.success(`已选择并且复制成功 ${item} 图标`)
        }
      }
    }
  }

  function visibleChange(visible: boolean) {
    // 解决切换到pda端后，重新打开页面时，tabs的激活项还是pc端的问题
    if (!visible) {
      defaultActiveKey.value = tempActive.value
    }
  }

  handleSvgNames()
</script>
<style lang="less" scoped>
  :deep(.arco-pagination) {
    justify-content: center;
  }
  .icon-container {
    width: 360px;
    overflow: hidden;
    text-align: center;
    .icon-wrapper {
      min-height: 250px;
      .icon-item {
        height: 60px;
        // overflow: hidden;
        text-align: center;
        .label-name {
          width: 70%;
          margin: 0 auto;
          font-size: 12px;
          color: #888;
          margin-top: 5px;
          text-overflow: ellipsis;
          overflow: hidden;
          word-wrap: normal;
          &.active {
            color: #00b42a;
          }
        }
        .arco-icon {
          transform: scale(1);
          transition: transform 0.2s linear;
        }
        &:hover {
          cursor: pointer;
          .arco-icon {
            transform: scale(1.5);
            transition: transform 0.2s linear;
          }
        }
        &.active {
          color: #00b42a;
        }
      }
      .svg-item {
        svg {
          transform: scale(1);
          transition: transform 0.2s linear;
        }
        &:hover svg {
          transform: scale(1.5);
          transition: transform 0.2s linear;
        }
      }
    }
  }
</style>
