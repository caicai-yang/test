<template>
  <a-drawer
    :visible="currentVisible"
    :class="[isClickOut ? 'c-drawer' : '']"
    v-bind="$attrs"
    :closable="false"
    @ok="currentVisible = false"
    @cancel="cancel"
  >
    <template #header>
      <slot name="header"></slot>
    </template>
    <template #title>
      <slot name="title"></slot>
    </template>
    <slot></slot>

    <template #footer>
      <slot name="footer"></slot>
    </template>
    <div class="table-search" @click="cancel">
      <icon-double-right style="color: rgb(134, 144, 156)" :size="20" />
    </div>
  </a-drawer>
</template>
<script setup lang="ts" name="CDrawer">
  import { computed } from 'vue'

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    // 是否可点击外部
    isClickOut: {
      type: Boolean,
      default: false
    }
  })

  const emits = defineEmits(['update:visible', 'cancel'])

  const currentVisible = computed({
    get() {
      return props.visible
    },
    set(visible: boolean) {
      emits('update:visible', visible)
    }
  })

  function cancel() {
    currentVisible.value = false
    emits('cancel')
  }
</script>
<style lang="less">
  .c-drawer {
    pointer-events: none;
    .arco-drawer {
      z-index: 99;
      pointer-events: all;
      box-shadow: 5px 0px 14px rgba(0 0 0 / 60%);
    }
    .table-search {
      width: 24px;
      height: 80px;
      border: 1px solid rgba(229, 231, 235, var(--tw-border-opacity));
      border-top: 0;
      display: flex;
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      z-index: 1;
      align-items: center;
      background-color: #ffffff;
      box-shadow: 2px 0px 10px 0px rgb(0 0 0 / 20%);
      cursor: pointer;
      border-radius: 0px 4px 4px 0px;
      line-height: 22px;
      &:hover {
        background-color: var(--color-fill-3);
      }
    }
  }
</style>
