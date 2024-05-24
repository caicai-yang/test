<template>
  <messageDetailForm
    ref="messageDetailFormRef"
    :data="messageData"
    :is-read="isRead"
    @allPersonChange="allPersonChange"
  />
  <a-card :bordered="false" class="margin-top-15">
    <ContentTitle title="消息内容" />
    <centerRichText ref="centerRichTextRef" :data="messageData" :is-read="isRead" />
    <a-space
      v-if="!isRead"
      align="center"
      :size="20"
      fill
      style="display: flex; justify-content: center"
    >
      <!-- 新增消息配置用户点回上一步 -->
      <template v-if="hasFrom">
        <a-button size="large" @click="cancelRoute">取消</a-button>
        <a-button size="large" type="primary" @click="handleNextStep($route.params.id as string)"
          >下一步</a-button
        >
      </template>

      <template v-else>
        <a-button size="large" @click="cancelRoute"> 取 消 </a-button>

        <!-- 编辑状态 -->
        <a-button v-if="currentId !== ''" type="primary" @click="() => submit('save')">
          保存
        </a-button>
        <!-- 新增状态，选择推送所有用户 -->
        <a-button v-else-if="isAllPerson" type="primary" @click="() => submit('all')">
          保存
        </a-button>
        <!-- 新增状态，非推送所有用户 -->
        <a-button v-else type="primary" @click="() => submit()"> 下一步 </a-button>
      </template>
    </a-space>
  </a-card>
  <div class="margin-top-15">
    <footerTable v-if="isRead" />
  </div>
</template>

<script setup name="MessageConfigDetail" lang="ts">
  import { ref, getCurrentInstance } from 'vue'
  import { Message } from '@arco-design/web-vue'
  import messageDetailForm from './component/messageDetailForm.vue'
  import centerRichText from './component/centerRichText.vue'
  import footerTable from './component/footerTable.vue'
  import { useRoute, useRouter } from 'vue-router'
  import { messageConfigDetail } from '@/api/system/messageConfig'
  import { addMessageConfig, updateMessageConfig } from '@/api/system/messageConfig'

  import { useCloseTab } from '@/hooks/useTabs'

  const { proxy } = getCurrentInstance() as any
  const route = useRoute()
  const router = useRouter()
  // 消息重复周期默认为年
  const messageData: { [props: string]: any } = ref({
    sendTimeUnit: 'YEAR'
  })
  const isAllPerson = ref<string>('false')
  const isEdit = ref(false)
  const isAdd = ref(false)
  const isRead = ref(false)
  const currentId = ref('')

  function getDetail(id: string | number) {
    messageConfigDetail({ id }).then(res => {
      // res.isConfirmRead = res.isConfirmRead.toString()
      // res.isSendNow = res.isSendNow.toString()
      // res.isSendToAll = res.isSendToAll.toString()
      messageData.value = res
    })
  }

  function allPersonChange(val: string) {
    isAllPerson.value = val
  }

  function cancelRoute() {
    useCloseTab('/system/messageCenter/messageConfig')
  }

  // 下一步
  function handleNextStep(id: string) {
    router.push({
      path: `/system/messageCenter/messageConfig/configPerson/${id}`,
      query: { from: 'configMessage' }
    })
  }

  // 提交表单
  async function submit(type?: string) {
    // 消息详情校验
    const topValidate: boolean = await proxy.$refs.messageDetailFormRef.validateForm()
    if (!topValidate) {
      return
    }
    // 消息内容校验
    const contentValidate: boolean = await proxy.$refs.centerRichTextRef.validateForm()
    if (!contentValidate) {
      return
    }

    if (type === 'save') {
      // 编辑保存（更新）
      updateMessageConfig(messageData.value).then(() => {
        Message.success('保存成功')
        useCloseTab('/system/messageCenter/messageConfig')
      })
    } else {
      addMessageConfig(messageData.value).then(res => {
        Message.success('保存成功')
        if (type === 'all') {
          // 新建保存，选择推送所有用户
          useCloseTab('/system/messageCenter/messageConfig')
        } else {
          // 新建保存，非推送所有用户
          handleNextStep(res.id)
        }
      })
    }
  }

  function handleParams() {
    isAdd.value = route.params.type === 'isAdd'
    isEdit.value = route.params.type === 'isEdit'
    isRead.value = route.params.type === 'isRead'
    route.params.id && (currentId.value = route.params.id as string)
    if (currentId.value && !isAdd.value) {
      getDetail(currentId.value)
    }
  }

  const hasFrom = ref(false)

  if (route.params) {
    handleParams()
    hasFrom.value = route.query.from === 'configPerson'
  }
</script>

<style lang="scss" scoped></style>
