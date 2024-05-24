<template>
  <div class="role-check-list">
    <a-checkbox v-model="isExpandAll" @change="handleChangeExpandAll">展开/折叠</a-checkbox>
    <a-checkbox v-model="isCheckAll" @change="handleChangeCheckAll">全选/全不选</a-checkbox>
    <a-checkbox v-model="checkStrictly">父子联动</a-checkbox>
  </div>
  <div class="role-tree">
    <a-tree
      v-model:checked-keys="currentCheckedKeys"
      v-model:expanded-keys="expandedKeys"
      checkable
      :check-strictly="!checkStrictly"
      :data="treeData"
      :field-names="fieldNames"
    />
  </div>
</template>

<script setup lang="ts" name="RoleConfigTree">
  import { ref, computed } from 'vue'
  import { getExpandAndSelectKeysByTree } from '@/utils/plainTree'

  type TreeData = {
    id: number
    name: string
    code: string
    children: TreeData[]
    [key: string]: any
  }

  type Props = {
    treeData?: TreeData[]
    checkedKeys?: (string | number)[]
    type?: 'menu' | 'org'
  }

  type Emits = {
    (e: 'update:checkedKeys', checkedKeys: (string | number)[]): void
  }

  const props = withDefaults(defineProps<Props>(), {
    treeData: () => [],
    checkedKeys: () => [],
    type: 'org'
  })
  const emits = defineEmits<Emits>()

  const expandAndSelectedKeys = computed(() => {
    return getExpandAndSelectKeysByTree(props.treeData, props.type === 'org' ? 'id' : 'code')
  })

  // arco design 中 icon 必须为 render 函数，没有对 string 类型的icon过滤处理, 重置 icon 字段, 避免页面报错
  const fieldNames = computed(() => {
    if (props.type === 'org') {
      return { key: 'id', title: 'name', children: 'children', icon: '_' }
    }
    return { key: 'code', title: 'name', children: 'children', icon: '_' }
  })

  const isExpandAll = ref(false)
  const expandedKeys = ref<(string | number)[]>([])
  function handleChangeExpandAll(checked: any) {
    isExpandAll.value = checked
    expandedKeys.value = isExpandAll.value ? expandAndSelectedKeys.value.expandKeys : []
  }

  // 是否父子联动
  const checkStrictly = ref(false)

  const isCheckAll = ref(false)
  function handleChangeCheckAll(checked: any) {
    isCheckAll.value = checked
    currentCheckedKeys.value = isCheckAll.value ? expandAndSelectedKeys.value.selectKeys : []
  }

  const currentCheckedKeys = computed({
    get() {
      return props.checkedKeys
    },
    set(checkedKeys) {
      emits('update:checkedKeys', checkedKeys)
    }
  })
</script>

<style lang="less" scoped>
  .role-check-list {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 16px 10px;
  }

  .role-tree {
    margin: 0 16px;
    padding: 8px;
    border: 1px solid var(--color-neutral-3);
    max-height: 200px;
    overflow: auto;
  }
</style>
