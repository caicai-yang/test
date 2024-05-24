<template>
  <div id="richTextEditor" :style="{ height: height + 'px' }"></div>
</template>

<script lang="ts">
  import { defineComponent, onMounted } from 'vue'
  import Quill from 'quill'
  import ImageUploader from 'quill-image-uploader'
  import { Message } from '@arco-design/web-vue'
  import 'quill/dist/quill.snow.css'
  import { FileApi } from '@/api'
  import type { PropType } from 'vue'
  import type { QuillOptionsStatic } from 'quill'

  export default defineComponent({
    name: 'RichTextEditor',
    props: {
      height: {
        type: [Number, String],
        default: 'auto'
      },
      options: {
        type: Object as PropType<QuillOptionsStatic>,
        default: () => ({})
      }
    },
    setup(props) {
      let quill: Quill | null = null
      let options: QuillOptionsStatic = {}
      const init = () => {
        options = {
          modules: {
            toolbar: [
              ['bold', 'italic', 'underline', 'strike'], // 切换按钮
              ['blockquote', 'code-block'],

              [{ list: 'ordered' }, { list: 'bullet' }],
              [{ script: 'sub' }, { script: 'super' }], // 上标/下标
              [{ indent: '-1' }, { indent: '+1' }], // 减少缩进/缩进
              [{ direction: 'rtl' }], // 文本下划线

              [{ size: ['small', false, 'large', 'huge'] }], // 用户自定义下拉
              [{ header: [1, 2, 3, 4, 5, 6, false] }],

              [{ color: [] }, { background: [] }], // 主题默认下拉，使用主题提供的值
              [{ align: [] }],

              ['link', 'image'],

              ['clean'] // 清除格式
            ],
            imageUploader: {
              upload: async (file: File) => {
                if (!file.type.includes('image')) {
                  throw Message.warning('仅支持图片')
                }
                const formData = new FormData()
                formData.append('file', file)
                const { fileId } = (await FileApi.uploadFile(formData)) as any
                return fileId
              }
            }
          },
          placeholder: '请输入文章内容…',
          theme: 'snow',
          ...props.options
        }

        Quill.register('modules/imageUploader', ImageUploader)
        quill = new Quill(document.getElementById('richTextEditor') as Element, options)
      }
      onMounted(init)
      const getHtmlContent = () => {
        return (document.getElementById('richTextEditor')?.firstChild as any).innerHTML
      }
      const setHtmlContent = (value: any) => {
        if (options.readOnly && value) {
          quill?.root.setAttribute('data-placeholder', '')
        }
        ;(document.getElementById('richTextEditor')?.firstChild as any).innerHTML = value
      }
      const getJsonContent = () => {
        return JSON.stringify(quill?.getContents())
      }
      return {
        getHtmlContent,
        getJsonContent,
        setHtmlContent
      }
    }
  })
</script>
