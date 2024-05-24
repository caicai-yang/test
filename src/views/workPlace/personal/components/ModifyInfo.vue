<template>
  <div class="modify-info">
    <div class="modify-info-container">
      <Upload ref="uploadRef" v-model:fileList="fileList" />
      <a-form ref="formRef" :model="form" :rules="rules" style="width: 80%">
        <a-form-item label="用户账号：">{{ form.username }}</a-form-item>
        <a-form-item field="name" label="用户名称：">
          <a-input v-model.trim="form.name" :max-length="20" placeholder="请输入用户名称" />
        </a-form-item>
        <a-form-item field="mobile" label="联系号码：">
          <a-input v-model.trim="form.mobile" :max-length="11" />
        </a-form-item>
        <a-form-item label="性别：">
          <a-radio-group v-model="form.sex">
            <a-radio value="MAN">男</a-radio>
            <a-radio value="WOMAN">女</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </div>

    <a-button
      class="modify-info-button"
      type="primary"
      size="large"
      :loading="loading"
      @click="handleSubmit"
      >确定</a-button
    >
  </div>
</template>

<script setup lang="ts" name="ModifyInfo">
  import { ref, onMounted, watch } from 'vue'
  import useUserStore from '@/store/modules/user'
  import Upload from '@/components/Upload/index.vue'
  import { UserSettingApi } from '@/api'
  import validator from '@/utils/validate'
  import { Message } from '@arco-design/web-vue'
  import type { FileItem } from '@arco-design/web-vue'
  import type { IUpdatePersonalInfo } from '@/types'
  import _ from 'lodash'

  const userStore = useUserStore()
  const fileList = ref<Array<FileItem | string>>([])

  const formRef = ref()

  const form = ref({
    id: '',
    username: '',
    name: '',
    mobile: '',
    sex: ''
  })

  const rules = ref({
    name: [{ required: true, message: '请输入用户名称', trigger: 'blur' }],
    mobile: [
      {
        required: false,
        validator: validator({ isRequired: false, isPhone: true }),
        trigger: 'blur'
      }
    ]
  })

  const loading = ref(false)

  const oldForm = ref()
  async function getPersonalInfo() {
    const user = (await userStore.getUser()) as any
    form.value = user
    oldForm.value = _.cloneDeep(user)
    fileList.value = [user.avatar || '']
  }

  const isUpdate = ref(false)
  watch(
    () => form.value,
    now => {
      if (now && oldForm.value && !_.isEqual(now, oldForm.value)) {
        isUpdate.value = true
      }
    },
    { deep: true }
  )
  const uploadRef = ref()
  function handleSubmit() {
    formRef.value.validate(async (valid: any) => {
      if (valid) {
        return
      }
      const avatar = await uploadRef.value.handleUpload()
      if (!isUpdate.value && avatar === oldForm.value.avatar) {
        return
      }

      loading.value = true
      const params: IUpdatePersonalInfo = form.value
      params.avatar = avatar
      UserSettingApi.updatePersonalInfo(params)
        .then(() => {
          Message.success('修改成功')
          userStore.saveUser(params)
          oldForm.value = _.cloneDeep(params)
          fileList.value = [avatar]
          isUpdate.value = false
        })
        .finally(() => {
          loading.value = false
        })
    })
  }

  onMounted(() => {
    getPersonalInfo()
  })
</script>

<style lang="less" scoped>
  .modify-info {
    text-align: center;
    .modify-info-container {
      display: flex;
      justify-content: flex-start;
      align-items: center;
    }

    .modify-info-button {
      margin-top: 24px;
    }
  }
</style>
