<template>
  <Modal v-model:visible="currentVisible" :title="title" @before-open="handleReset">
    <div class="batch-import-header">
      <div v-if="isNeedLoadModule" class="batch-import-header-text">
        <span>仅支持导入</span>
        <div v-for="(item, index) in supportFile" :key="index">
          <span class="batch-import-header-type">{{ item }}</span>
          <span v-if="index < supportFile.length - 1">、</span>
        </div>
        <span>格式文件</span>
        <span v-if="isNeedDownloadTemplate">，</span>
        <a-button
          v-if="isNeedDownloadTemplate"
          v-permission="'AdminSysUserImportTemplate'"
          type="text"
          @click="handleDownloadTemplate"
          >点击下载模板</a-button
        >
      </div>
      <a-upload
        :accept="fileType"
        :disabled="fileList.length >= limit"
        :auto-upload="false"
        :show-file-list="false"
        @change="handleFileChange"
      >
        <template #upload-button>
          <a-button type="outline" :disabled="fileList.length >= limit"
            >选择文件</a-button
          ></template
        >
      </a-upload>
    </div>
    <Table :data="fileList" :columns="columns" :show-footer="false" />
    <div class="batch-import-tip">
      <div class="batch-import-tip-title">提示信息</div>

      <a-scrollbar outer-style="overflow: hidden" style="height: 100%; overflow: auto">
        <template v-if="currentMessage.length">
          <div v-for="(item, index) in currentMessage" :key="index">{{ item }}</div>
        </template>
        <a-empty v-else />
      </a-scrollbar>
    </div>
    <template #footer>
      <a-button @click="handleReset">重置</a-button>
      <a-button type="primary" :loading="currentLoading" @click="handleImport">开始导入</a-button>
    </template>
  </Modal>
</template>

<script setup lang="ts" name="ImportFileModel">
  import { computed, ref } from 'vue'
  // import Table from '@/components/Table.vue'
  import { formatterFileSize } from '@/utils/formatter'
  import type { FileItem } from '@arco-design/web-vue'
  import _ from 'lodash-es'
  import { Message } from '@arco-design/web-vue'

  const props = defineProps({
    // 弹窗
    visible: {
      type: Boolean,
      default: false
    },
    // 导入错误提示信息
    message: {
      type: Object,
      default: () => {
        return []
      }
    },
    // 标题
    title: {
      type: String,
      default: ''
    },
    // 是否需要下载模板
    isNeedLoadModule: {
      type: Boolean,
      default: true
    },
    // 上传文件类型
    fileType: {
      type: String,
      default: ''
    },
    // 上传文件数限制
    limit: {
      type: Number,
      default: 1
    },
    // 上传文件大小
    fileSize: {
      type: Number,
      default: 999999999999
    },
    // modal的loading
    loading: {
      type: Boolean,
      default: false
    },
    // 是否需要下载模板
    isNeedDownloadTemplate: {
      type: Boolean,
      default: true
    }
  })

  type Emits = {
    (e: 'update:visible', visible: boolean): void
    (e: 'update:message', message: object): void
    (e: 'update:loading', loading: boolean): void
    (e: 'handleDownloadTemplate'): void
    (e: 'handleImport', formData: any): void
  }

  type BatchImportFileItem = FileItem & { size: number | undefined }

  const emits = defineEmits<Emits>()

  const currentVisible = computed({
    get() {
      return props.visible
    },
    set(visible: boolean) {
      emits('update:visible', visible)
    }
  })
  const currentMessage = computed({
    get() {
      return props.message
    },
    set(message: object) {
      emits('update:message', message)
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
  // 支持文件导入格式
  const supportFile = computed(() => {
    return props.fileType.split(',')
  })
  const fileList = ref<BatchImportFileItem[]>([])

  // 上传文件
  function handleFileChange(files: FileItem[]) {
    console.log(files)
    const data = files[files.length - 1]
    const newFile = { ...data, size: data.file?.size }
    // 校检文件大小
    if (props.fileSize) {
      const isLt = (newFile.size as number) / 1024 / 1024 < props.fileSize
      if (!isLt) {
        Message.warning(`上传文件大小不能超过 ${props.fileSize} MB!`)
      } else {
        fileList.value.push(newFile)
      }
    } else {
      fileList.value.push(newFile)
    }
  }

  const columns = ref([
    { title: '文件名', dataIndex: 'name' },
    {
      title: '大小',
      dataIndex: 'size',
      render({ record }: { record: BatchImportFileItem }) {
        return formatterFileSize(record.size)
      }
    },
    {
      title: '操作',
      dataIndex: 'operation',
      slotName: 'operation',
      buttons: [
        {
          text: '删除',
          // { record }: { record: BatchImportFileItem }
          callback({ rowIndex }: { rowIndex: number }) {
            fileList.value.splice(rowIndex, 1)
          }
        }
      ]
    }
  ])

  // 下载模板
  const handleDownloadTemplate = _.debounce(async function () {
    emits('handleDownloadTemplate')
  }, 100)

  // 重置
  function handleReset() {
    fileList.value = []
    currentMessage.value = []
  }

  // 开始导入
  function handleImport() {
    if (!fileList.value.length) {
      Message.warning('请选择导入文件')
      return
    }
    const formData: any = []
    fileList.value.forEach(item => {
      const formVal = new FormData()
      formVal.append('file', item.file as any)
      formData.push(formVal)
    })
    emits('handleImport', formData)
  }
</script>
<style lang="less" scoped>
  .batch-import-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;

    .batch-import-header-text {
      display: flex;
      justify-content: flex-start;
      align-items: center;

      .batch-import-header-type {
        padding: 2px 6px;
        background-color: var(--color-fill-2);
      }

      .arco-btn-text {
        padding: 0;

        &:hover {
          background-color: transparent;
        }
      }
    }

    .arco-btn:hover {
      transform: none;
    }
  }

  .batch-import-tip {
    width: 100%;
    height: 200px;
    border: 1px solid var(--color-neutral-3);
    margin-top: 12px;
    display: flex;
    flex-direction: column;

    .batch-import-tip-title {
      background-color: var(--color-neutral-2);
      font-size: 14px;
      font-weight: 700;
      padding: 6px;
      flex: none;
    }

    .arco-empty {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
  }
</style>
