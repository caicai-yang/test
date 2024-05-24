<template>
  <div class="main-container flex flex-direction-column">
    <a-card>
      <ContentTitle title="查看消息">
        <template #extra>
          <template v-if="formData.confirmRead">
            <a-button v-if="!formData.haveRead" type="primary" size="small" @click="toRead">
              已阅
            </a-button>
            <a-button v-else size="small" status="warning">已阅</a-button>
          </template>
        </template>
      </ContentTitle>
      <a-form ref="formRef" class="custom-item-width" :model="formData" layout="inline" disabled>
        <a-form-item label="消息编号">
          <a-input v-model.trim="formData.code" placeholder="请输入字段名称" />
        </a-form-item>
        <a-form-item label="消息名称">
          <a-input v-model.trim="formData.name" placeholder="请输入字段名称" />
        </a-form-item>
        <a-form-item label="发送渠道">
          <a-input v-model.trim="formData.sendChannel" placeholder="请输入字段名称" />
        </a-form-item>
        <a-form-item label="消息类型">
          <a-input v-model.trim="formData.type" placeholder="请输入字段名称" />
        </a-form-item>
        <a-form-item label="消息优先级">
          <a-input v-model.trim="formData.level" placeholder="请输入字段名称" />
        </a-form-item>
        <a-form-item label="消息描述">
          <a-input v-model.trim="formData.description" placeholder="请输入字段名称" />
        </a-form-item>
        <a-form-item label="推送时间">
          <a-input v-model.trim="formData.sendStartTime" placeholder="请输入字段名称" />
        </a-form-item>
        <a-form-item label="封面">
          <template #default>
            <a-image width="230" height="60" :src="formData.imgUrl" />
          </template>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card class="margin-top-10 flex1 arco-card-body100 arco-card-body-flex">
      <ContentTitle title="消息内容" />
      <RichTextEditor
        ref="richTextEditor"
        style="flex: 1; min-height: 0; overflow-y: auto"
        :options="{ readOnly: true, modules: { toolbar: null } }"
      />
      <div class="btn-footer">
        <a-button
          type="primary"
          size="large"
          @click="$router.push('/system/messageCenter/messageList')"
          >关闭</a-button
        >
      </div>
    </a-card>
  </div>
</template>
<script setup name="MessageList" lang="ts">
  import { ref, getCurrentInstance } from 'vue'
  import { findMessage, readMessage } from '@/api/system/messageList'
  import { Message } from '@arco-design/web-vue'
  import { useRoute } from 'vue-router'

  const { proxy }: any = getCurrentInstance()
  const route = useRoute()
  const formData = ref<any>({})

  const richTextEditor = ref()
  function getDetail(id: number) {
    findMessage(id).then(res => {
      formData.value = res
      richTextEditor.value.setHtmlContent(formData.value.content)
    })
  }

  function toRead() {
    proxy.$confirm({
      title: '确认已阅',
      type: 'success',
      content: '请确认是否阅读完毕',
      onOk: () => {
        readMessage(formData.value.id).then(() => {
          getDetail(formData.value.id)
          Message.success('确认成功')
        })
      }
    })
  }

  if (route.params && route.params.id) {
    getDetail(Number(route.params.id))
  }
</script>
<style lang="less">
  .main-container {
    height: 100%;

    .btn-footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-top: 16px;
    }
  }
</style>
