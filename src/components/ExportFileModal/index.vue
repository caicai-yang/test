<template>
  <Modal
    v-model:visible="currentVisible"
    :title="title"
    :loading="currentLoading"
    :confirm-button-text="confirmButtonText"
    width="300px"
    @before-open="noPage = 0"
    @confirm="handleConfirm"
  >
    <a-space size="large">
      <a-radio-group v-model="noPage">
        <a-radio :value="0">导出当前页</a-radio>
        <a-radio :value="1">导出全部</a-radio>
      </a-radio-group>
    </a-space>
  </Modal>
</template>

<script setup lang="ts" name="ExportFileModal">
  import { computed, ref } from 'vue'
  import { IEnabled } from '@/types/common'
  import { download } from '@/utils/files'

  type Props = {
    // 弹窗
    visible: boolean
    // modal的loading
    loading?: boolean
    // 查询条件
    fetchParams: object
    // 弹窗标题
    title: string
    // 确认按钮文字
    confirmButtonText: string
    // 导出Api
    exportApi?: Function
    // 是否弹窗组件执行导出处理操作
    autoExport?: boolean
  }

  type Emits = {
    (e: 'update:visible', visible: boolean): void
    (e: 'update:loading', loading: boolean): void
    (e: 'confirm', noPage: IEnabled): void
  }

  const props = withDefaults(defineProps<Props>(), {
    visible: false,
    loading: false,
    fetchParams: () => {
      return {}
    },
    title: '',
    confirmButtonText: '',
    exportApi: undefined,
    autoExport: true
  })
  const emits = defineEmits<Emits>()

  const currentVisible = computed({
    get() {
      return props.visible
    },
    set(visible: boolean) {
      emits('update:visible', visible)
    }
  })

  const currentLoading = computed({
    get() {
      return props.loading
    },
    set(loading: boolean) {
      emits('update:loading', loading)
    }
  })

  const noPage = ref<IEnabled>(0)

  function handleConfirm() {
    const { autoExport, exportApi, fetchParams } = props
    /**
     * 是否需要自动下载（在当前组件完成下载操作）
     * 若需要自动下载，则必须传 autoExport=true, exportApi(导出请求地址)
     */
    if (autoExport && exportApi) {
      currentLoading.value = true
      // 导出全部时，无需转化为文件流
      exportApi({ ...fetchParams, noPage: noPage.value })
        .then((res: any) => {
          download(res, '用户数据.xlsx')
        })
        .finally(() => {
          currentLoading.value = false
          currentVisible.value = false
        })
    } else {
      emits('confirm', noPage.value)
    }
  }
</script>

<style lang="less" scoped></style>
