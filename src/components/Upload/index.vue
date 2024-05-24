<template>
  <AUpload
    v-bind="$attrs"
    :auto-upload="false"
    :accept="accept"
    :show-file-list="showFileList"
    @change="handleChange"
  >
    <template #upload-button>
      <div class="upload-default">
        <slot name="defaultImage">
          <template v-if="uploadType === 'image'">
            <div
              @click="previewHandle"
              @mouseenter="closeIconShow = true"
              @mouseleave="closeIconShow = false"
            >
              <img
                :src="image"
                :style="{
                  width: IMAGE_WIDTH,
                  height: IMAGE_HEIGHT,
                  maxWidth: IMAGE_MAX_WIDTH,
                  maxHeight: IMAGE_MAX_HEIGHT
                }"
              />
              <icon-close-circle
                v-if="props.fileList.length && closeIconShow"
                class="imageCloseCircle"
                size="18"
                style="color: rgba(0, 0, 0, 0.5)"
                @click.stop="fileDelete"
              />
            </div>
            <ImagePreview v-model:visible="previewVisible" :src="image" />
          </template>
          <template v-else-if="uploadType === 'file'">
            <div v-if="!fileName" class="fileUpload"><IconUpload /></div>
            <div
              v-else
              class="fileUpload"
              @mouseenter="closeIconShow = true"
              @mouseleave="closeIconShow = false"
            >
              <div class="name" :title="fileName">{{ fileName }}</div>
              <IconCloseCircle
                v-if="closeIconShow && !$attrs.disabled"
                class="delete"
                @click.stop="fileDelete"
              />
            </div>
          </template>
          <template v-else-if="uploadType === 'fileList'">
            <div class="fileListUpload">
              <IconUpload class="icon" />
              <div class="tip_text">{{ uploadTip }}</div>
            </div>
          </template>
        </slot>
        <div v-if="tip" :class="['upload-default-tip', `upload-default-tip__${tipPosition}`]">{{
          tip
        }}</div>
      </div>
    </template>
  </AUpload>
</template>

<script setup lang="ts" name="Upload">
  import { computed, ref } from 'vue'
  import { FileItem, Message, ImagePreview } from '@arco-design/web-vue'
  import { FileApi } from '@/api'

  type Props = {
    accept?: string
    fileList: Array<FileItem | string> | string
    tip?: string
    tipPosition?: 'center' | 'bottom'
    limit?: number
    showFileList?: boolean
    maxSize?: number // 单位 M
    defaultImage?: string
    width?: number | string // 图片宽度
    height?: number | string // 图片高度
    maxWidth?: number | string // 图片最大宽度
    maxHeight?: number | string // 图片最大高度
    acceptTip?: string
    isCommonFile?: boolean
    uploadType?: string
    uploadTip?: string
    fileType?: string
  }

  type Emits = {
    (e: 'update:fileList', fileList: Array<FileItem | { url: string }>): void
    (e: 'change', fileItem: Array<FileItem | { url: string }>, fileList: FileItem[]): void
  }

  const props = withDefaults(defineProps<Props>(), {
    accept: '.jpg,.png,.jpeg',
    tip: '点击图片更换头像',
    tipPosition: 'bottom',
    limit: 1,
    showFileList: false,
    maxSize: 1,
    defaultImage: '',
    acceptTip: '仅支持JPG/PNG格式，请重新上传',
    width: 'auto',
    height: 'auto',
    maxWidth: 200,
    maxHeight: 300,
    isCommonFile: true,
    uploadType: 'image', // 默认image 可选file类型等等
    uploadTip: '点击上传附件，或将文件拖入此区域',
    fileType: 'common'
  })

  const emits = defineEmits<Emits>()
  const previewVisible = ref<boolean>(false)
  const closeIconShow = ref<boolean>(false)
  // 图片占位图
  const image = computed(() => {
    if (props.defaultImage) {
      return props.defaultImage
    }
    if (props.fileList.length) {
      const item = props.fileList[0]
      return typeof item === 'string' ? item : item.url
    }
    return new URL('/src/assets/image.png', import.meta.url).href
  })
  // 上传文件名
  const fileName = computed(() => {
    if (props.fileList?.length) {
      const item = props.fileList[0]
      return typeof item === 'string' ? item : item.name
    }
    return ''
  })

  const IMAGE_WIDTH = computed(() => handlePX(props.width))
  const IMAGE_HEIGHT = computed(() => handlePX(props.height))
  const IMAGE_MAX_WIDTH = computed(() => handlePX(props.maxWidth))
  const IMAGE_MAX_HEIGHT = computed(() => handlePX(props.maxHeight))
  function handlePX(event: string | number) {
    if (typeof event === 'string') {
      event = event.toLocaleLowerCase()
      if (event.endsWith('px')) {
        event = event.slice(0, -2)
      }
      event = typeof Number(event) === 'number' ? Number(event) + 'px' : 'auto'
    } else if (typeof event === 'number') {
      event = event + 'px'
    } else {
      event = 'auto'
    }
    return event
  }

  function handleChange(fileList: FileItem[], fileItem: FileItem) {
    const { file } = fileItem
    const { size, name } = file!
    const type = name && name.substring(name.lastIndexOf('.') + 1) // 截取name的后缀
    if (size / 1024 / 1024 > props.maxSize) {
      return Message.warning(`仅支持上传${props.maxSize}M大小以内的文件，请重新上传`)
    }

    if (!type || !props.accept.includes(type)) {
      return Message.warning(props.acceptTip || '不支持上传该格式文件')
    }
    // TODO: 后期完善 multiple file 的情况
    emits('update:fileList', [fileItem])
    emits('change', [fileItem], fileList)
  }

  async function handleUpload() {
    if (!props.fileList.length) {
      return ''
    }
    // 目前的业务场景都是限制上传一张图片, 后端上传文件接口也暂无批量上传
    const item = props.fileList[0]
    if ((item as FileItem).file) {
      const { file } = item as FileItem
      const formData = new FormData()
      formData.append('file', file!)
      formData.append('fileType', props.fileType)
      if (!props.isCommonFile) {
        formData.append('fileType', file!.type)
      }

      const { fileId } = (await FileApi.uploadFile(formData)) as any
      return fileId
    }
    return item || ''
  }
  // 上传文件删除按钮handle
  const fileDelete = () => {
    // 更新上传文件list状态
    emits('update:fileList', [])
  }
  // 点击图片预览
  const previewHandle = (e: Event) => {
    if (props.fileList.length) {
      e.stopPropagation()
      previewVisible.value = true
    }
  }
  defineExpose({
    handleUpload
  })
</script>

<style lang="less" scoped>
  .arco-upload {
    width: 100%;
  }
  .upload-default {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;

    .upload-default-tip__center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .upload-default-tip__bottom {
      margin-top: 12px;
    }
    .fileUpload {
      width: 100%;
      border: 1px solid #ccc;
      border-radius: 4px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: #999;
      position: relative;
      .name {
        width: 126px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 14px;
      }
      .delete {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        right: 8px;
        font-size: 14px;
      }
    }
    .fileListUpload {
      display: flex;
      align-items: center;
      .icon {
        color: #999;
        font-size: 20px;
      }
      .tip_text {
        margin-left: 15px;
        color: #666;
      }
    }
    .imageCloseCircle {
      position: absolute;
      top: -5px;
      right: -7px;
      overflow: hidden;
      border-radius: 50%;
      background-color: #fff;
    }
  }
</style>
