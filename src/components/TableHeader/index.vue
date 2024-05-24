<template>
  <a-card :body-style="[{ padding: '0 0 16px 0', width: '100%' }, style]" :bordered="false">
    <!-- 默认有输入框，查询和重置按钮
      父组件存在name 为 table-config 的插槽时，则不显示此部分，只显示插槽table-config部分
    -->
    <div v-if="showFilter" class="flex justify-between">
      <!-- 左侧新增按钮和自定义按钮 -->
      <div v-if="showLeft">
        <a-space>
          <!-- 新增按钮 -->
          <a-tooltip
            :content="($attrs['add-button-tooltip'] as any)"
            :disabled="$attrs['add-button-tooltip-disabled'] ?? true"
          >
            <div>
              <AddButton
                v-if="isAddButton"
                v-permission="addButtonPermission"
                :is-add-icon="isAddIcon"
                :disabled="disabledAddButton"
                :size="addButtonSize"
                @add="doAdd"
              />
            </div>
          </a-tooltip>

          <!-- 自定义按钮显示区域 -->
          <template v-if="buttonList.length">
            <template
              v-for="(
                {
                  permission,
                  type,
                  size,
                  status,
                  disabled,
                  callback,
                  icon,
                  text,
                  isShowButton,
                  ...props
                },
                index
              ) in buttonList"
              :key="index"
            >
              <a-button
                v-if="
                  typeof isShowButton === 'function'
                    ? isShowButton()
                    : isShowButton === undefined
                    ? true
                    : isShowButton
                "
                v-permission="permission"
                :type="type || 'primary'"
                :size="size || 'large'"
                :status="status"
                :disabled="typeof disabled === 'function' ? disabled() : disabled"
                v-bind="props"
                @click="callback"
              >
                <template v-if="icon" #icon>
                  <component :is="icon" />
                </template>
                {{ text }}
              </a-button>
            </template>
          </template>
          <slot name="control-button"></slot>
        </a-space>
      </div>

      <!-- 右侧查询区域 -->
      <div class="flex1 flex justify-end" :style="searchWrapStyle ?? ''">
        <a-space>
          <!-- 自定义查询区域，可放置select选择器等 -->
          <slot name="control-search"></slot>
          <!-- 按启用状态搜索 -->
          <a-select
            v-if="hasEnabledSelect"
            v-model="currentEnabled"
            placeholder="按启用状态筛选"
            size="large"
            class="table-enabled-select"
            style="width: 240px"
            allow-clear
            @change="$emit('changeEnabled', $event)"
          >
            <a-option :value="1" label="启用" />
            <a-option :value="0" label="禁用" />
          </a-select>
          <template v-if="hasSearch">
            <!-- 默认有重置按钮，显示 输入框 查询按钮 重置按钮 -->
            <template v-if="isResetButton">
              <a-input
                v-if="defaultSearch"
                v-model.trim="searchValue"
                class="search-input"
                size="large"
                placeholder="输入关键字筛选"
                allow-clear
                :max-length="searchMaxLength"
                :style="defaultSearchStyle"
                @clear="doSearch"
                @keyup.enter="doSearch"
              />
              <!-- 查询按钮 -->
              <SearchButton @search="doSearch" />
              <!-- 重置按钮 -->
              <ResetButton @reset="doReset" />
            </template>

            <!-- 没有重置按钮，则显示 输入框（带有查询图标） -->
            <template v-else>
              <a-input
                v-model.trim="searchValue"
                class="input-search-button"
                size="large"
                placeholder="输入关键字搜索"
                allow-clear
                :max-length="searchMaxLength"
                :style="defaultSearchStyle"
                @clear="doSearch"
                @press-enter="doSearch"
              >
                <template #suffix>
                  <icon-search :size="15" @click="doSearch" />
                </template>
              </a-input>
            </template>
            <!-- 查询右侧 操作按钮 -->
            <slot name="operate-button"></slot>
          </template>
        </a-space>
      </div>
    </div>
    <!-- 所有字段都采用自定义显示 -->
    <div v-if="!showFilter" class="flex justify-end">
      <slot name="table-config"></slot>
    </div>
  </a-card>
</template>

<script lang="ts" name="TableHeader">
  import { computed, defineComponent, ref } from 'vue'
  import type { PropType } from 'vue'
  import type { IEnabled, TableButton } from '@/types'
  import _ from 'lodash-es'

  export default defineComponent({
    name: 'TableHeader',
    props: {
      // 是否显示新增按钮
      isAddButton: {
        type: Boolean,
        default: true
      },
      // 新增按钮权限标识
      addButtonPermission: {
        type: [String, Array],
        default: ''
      },
      // 是否显示新增按钮icon
      isAddIcon: {
        type: Boolean,
        default: false
      },
      // 禁用添加按钮
      disabledAddButton: {
        type: Boolean,
        default: false
      },
      // 添加按钮大小
      addButtonSize: {
        type: String as PropType<'mini' | 'small' | 'medium' | 'large'>,
        default: 'large'
      },
      // 是否显示重置按钮
      isResetButton: {
        type: Boolean,
        default: true
      },
      // 显示默认查询区域
      defaultSearch: {
        type: Boolean,
        default: true
      },
      // 默认搜索框样式
      defaultSearchStyle: {
        type: Object,
        default: () => {}
      },
      // 重置后执行搜索
      resetImmediaSearch: {
        type: Boolean,
        default: true
      },
      // 自定义样式
      style: {
        type: Object,
        default: () => {}
      },
      // 左侧除新增外的按钮
      buttonList: {
        type: Array as PropType<TableButton[]>,
        default: () => []
      },
      searchMaxLength: {
        type: Number,
        default: 50
      },
      // 是否要按启用状态筛选
      hasEnabledSelect: {
        type: Boolean,
        default: false
      },
      enabled: {
        type: [Number, String],
        default: ''
      },
      // 是否需要右侧搜索框
      hasSearch: {
        type: Boolean,
        default: true
      },
      queryParams: {
        type: Object,
        default: () => ({
          currentPage: 1,
          pageSize: 10,
          conditions: [] as Array<object>,
          sorts: [] as Array<object>
        })
      },
      searchWrapStyle: {
        type: String,
        default: ''
      }
    },
    emits: ['add', 'search', 'reset', 'changeEnabled', 'update:enabled', 'update:queryParams'],
    setup(props, { emit, slots, expose }) {
      const showFilter = computed(() => !slots['table-config'])
      const showLeft = computed(
        () => props.isAddButton || props.buttonList.length || !!slots['control-button']
      )
      const searchValue = ref('')
      const searchEnabled = ref<IEnabled | ''>('')

      function doAdd() {
        emit('add')
      }

      const doSearch = _.debounce(function () {
        emit('search', searchValue.value)
      }, 200)

      // 初始筛选条件
      const initQueryParams = ref(JSON.parse(JSON.stringify(props.queryParams)))

      function doReset() {
        searchValue.value = ''
        if (props.resetImmediaSearch) {
          doSearch()
        }

        // 重置时重置表头的筛选条件
        emit('update:queryParams', JSON.parse(JSON.stringify(initQueryParams.value)))
        emit('reset')
      }

      const currentEnabled = computed<any>({
        get() {
          return props.enabled ?? searchEnabled.value
        },
        set(enabled: IEnabled | '') {
          searchEnabled.value = enabled
          emit('update:enabled', enabled)
        }
      })

      expose({ doReset })

      return {
        showFilter,
        // target,
        doAdd,
        doSearch,
        doReset,
        showLeft,
        searchValue,
        currentEnabled
      }
    }
  })
</script>
<style lang="less" scoped>
  .table-header {
    padding: 15px 0;
    display: flex;
  }

  .flex1 {
    flex: 1;
  }

  .flex {
    display: flex;
  }

  .justify-between {
    justify-content: space-between;
  }

  .justify-end {
    justify-content: flex-end;
  }
  :deep(.arco-drawer-footer) {
    border-bottom: 2px solid #f5f5f5;
  }
</style>
