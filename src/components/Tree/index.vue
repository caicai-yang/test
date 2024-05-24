<template>
  <a-scrollbar
    :outer-style="{ width: width, height: height, overflow: 'hidden', paddingRight: '20px' }"
    style="width: 100%; height: 100%; overflow: auto"
  >
    <a-tree
      v-if="isRefreshTree"
      v-model:expandedKeys="currentExpandedKeys"
      v-bind="$attrs"
      :data="data"
      :field-names="fieldNames"
    />
  </a-scrollbar>
</template>

<script setup lang="ts" name="Tree">
  import { computed, watchEffect, ref, nextTick } from 'vue'
  import { getExpandAndSelectKeysByTree } from '@/utils/plainTree'
  import { TreeFieldNames, TreeNodeData } from '@arco-design/web-vue'

  type Props = {
    data?: TreeNodeData[]
    fieldNames?: TreeFieldNames
    expandedKeys?: Array<number | string>
    isExpandAll?: boolean
    width?: string
    height?: string
  }

  type Emits = {
    (e: 'update:expandedKeys', expandedKeys: Array<number | string>): void
  }

  const props = withDefaults(defineProps<Props>(), {
    data: () => [],
    fieldNames: () => ({ key: 'id', title: 'name', children: 'children' }),
    expandedKeys: () => [],
    isExpandAll: false,
    width: '100%',
    height: '100%'
  })

  const emits = defineEmits<Emits>()

  const allExpandedKeys = computed(() => {
    return getExpandAndSelectKeysByTree(props.data as any).expandKeys
  })

  const currentExpandedKeys = computed({
    get() {
      return props.expandedKeys
    },
    set(expandedKeys: Array<string | number>) {
      emits('update:expandedKeys', expandedKeys)
    }
  })

  const isRefreshTree = ref(true)
  watchEffect(() => {
    isRefreshTree.value = false
    currentExpandedKeys.value = props.isExpandAll ? allExpandedKeys.value : []
    nextTick(() => {
      isRefreshTree.value = true
    })
  })
</script>

<style lang="less" scoped></style>
