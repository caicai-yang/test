<template>
  <div class="rickTextMain">
    <a-form
      ref="formRef"
      :model="formData"
      :rules="isRead ? {} : rules"
      :disabled="isRead"
      layout="inline"
      class="custom-item-width"
    >
      <a-form-item label="消息标题:" field="title" :validate-trigger="['change', 'input']">
        <a-input
          v-model="formData.title"
          placeholder="请输入消息标题"
          :disabled="isdisable"
          :max-length="50"
          size="large"
        />
      </a-form-item>
      <a-form-item label="消息落款:">
        <a-input
          v-model="formData.signOff"
          placeholder="请输入消息落款"
          :disabled="isdisable"
          :max-length="20"
          size="large"
        />
      </a-form-item>
      <a-form-item label="落款日期">
        <a-date-picker
          v-model="formData.signOffDate"
          placeholder="请选择落款日期"
          size="large"
          :disabled="isdisable"
        />
      </a-form-item>
      <a-form-item label="封面">
        <Upload
          ref="uploadRef"
          v-model:file-list="fileListData"
          width="230"
          height="100"
          max-width="230"
          tip=""
        />
      </a-form-item>
    </a-form>
    <div>
      <div style="padding: 10px 0; color: #4e5969">消息正文：</div>
      <RichTextEditor
        ref="richTextEditor"
        style="height: 280px; overflow-y: scroll"
        :options="isRead ? { readOnly: true, modules: { toolbar: null } } : {}"
      />
    </div>
  </div>
</template>

<script lang="ts" setup name="CenterRichText">
  import { Message } from '@arco-design/web-vue'
  import { ref, toRef, reactive, watch, getCurrentInstance } from 'vue'
  import type { PropType } from 'vue'
  import Upload from '@/components/Upload/index.vue'

  const props = defineProps({
    data: {
      type: Object as PropType<{ [props: string]: any }>,
      default: () => {}
    },
    isRead: {
      type: Boolean,
      default: false
    }
  })

  const { proxy } = getCurrentInstance() as any
  const isdisable = ref(false)
  const formRef = ref(null)
  const fileListData = ref<Array<any>>([])

  const formData: { [props: string]: any } = toRef(props, 'data')

  const rules = reactive({
    title: [{ required: true, message: '消息标题不能为空' }]
  })

  watch(
    () => formData.value.content,
    (val: any) => {
      proxy.$refs.richTextEditor.setHtmlContent(val)
    }
  )

  watch(
    () => formData.value.imgUrl,
    (url: string) => {
      fileListData.value = [url || '']
    }
  )

  const uploadRef = ref()
  async function validateForm() {
    // 获取富文本编辑器JSON文本
    const editorText = proxy.$refs.richTextEditor.getJsonContent()
    const editHtml = proxy.$refs.richTextEditor.getHtmlContent()

    // 校验表单是否填写完毕
    const result = await proxy.$refs.formRef.validate((valid: any) => valid)
    if (result) {
      Message.warning('请填写消息内容')
      return false
    } else if (
      JSON.parse(editorText).ops.length &&
      JSON.parse(editorText).ops[0].insert.replace(/\s+/g, '') === ''
    ) {
      Message.warning('文章内容不能为空')
      return false
    } else if (editHtml.length > 3000) {
      Message.warning('文章内容长度不能超过3000')
      return false
    }
    formData.value.imgUrl = await uploadRef.value.handleUpload()
    formData.value.content = editHtml
    return true
  }

  defineExpose({
    validateForm
  })
</script>

<style lang="less" scoped>
  .rickTextMain {
    margin-top: 20px;
    background-color: #fff;
    padding: 20px;
  }
  :deep(.arco-row) {
    margin-bottom: 0;
  }
</style>
