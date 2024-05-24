<template>
  <td>
    <!-- column.dataType === 'IconFont' 显示 iconfont -->
    <!-- column.dataType === 'tag' 显示 tag 标签; 目前只有字典设置模块需要自定义展示，其他模块都可以通过字典值dictionaryCode转义 -->
    <!-- column.dictionaryCode  显示字典 -->

    <!-- 有自定义render和slotName的，无需转义 -->
    <span
      v-if="
        !column.render &&
        !column.slotName &&
        (column.dictionaryCode || ['IconFont', 'tag', 'IMG'].includes(column.dataType))
      "
      :class="['arco-table-cell', `arco-table-cell-align-${column.align}`]"
    >
      <span class="arco-table-td-content">
        <!-- 显示 iconfont -->
        <template v-if="column.dataType === 'IconFont' && record[column.dataIndex]">
          <!-- 本地svg图标 -->
          <template v-if="record[column.dataIndex].startsWith(CUSTOMER_SVG_PREFIX)">
            <SvgIcon
              :name="record[column.dataIndex].split(CUSTOMER_SVG_PREFIX)[1]"
              style="width: 20px; height: 20px"
              color="#30333b"
            />
          </template>
          <!-- ui icon -->
          <component :is="record[column.dataIndex]" v-else :size="20" />
        </template>

        <!-- 显示 tag 标签 -->
        <template v-else-if="column.dataType === 'tag'">
          <!-- 有设置颜色值，显示tag -->
          <a-tag v-if="record.color" class="dict-tag" :color="record.color">{{
            record[column.dataIndex]
          }}</a-tag>
          <!-- 否则显示普通文本 -->
          <span v-else>{{ record[column.dataIndex] }}</span>
        </template>

        <!-- 有字典值，则字典转义显示 -->
        <template v-else-if="column.dictionaryCode">
          <DictTag
            :options="getDictionary(column.dictionaryCode)"
            :value="record[column.dataIndex]"
          />
        </template>

        <template v-else-if="column.dataType === 'IMG' && record[column.dataIndex]">
          <img :src="record[column.dataIndex]" />
        </template>
      </span>
    </span>
    <!-- 否则正常显示 -->
    <slot v-else></slot>
  </td>
</template>

<script setup name="ArcoTableTd" lang="ts">
  import { useDictionary } from '@/hooks/useDictionary'
  import SvgIcon from '../SvgIcon/index.vue'
  import { CUSTOMER_SVG_PREFIX } from '@/utils/constant'

  defineProps({
    column: {
      type: Object,
      default: () => {}
    },
    record: {
      type: Object,
      default: () => {}
    }
  })

  // 获取字典数组
  function getDictionary(value: string) {
    const currentDictionary = useDictionary(value)
    return currentDictionary.value
  }
</script>
<style lang="less" scoped>
  .dict-tag {
    height: auto;
    padding: 5px 8px;
    white-space: unset;
  }
</style>
