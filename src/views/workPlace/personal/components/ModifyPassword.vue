<template>
  <div class="modify-password">
    <div class="modify-password-container">
      <a-form ref="formRef" :model="form" :rules="rules" auto-label-width>
        <a-form-item label="用户账号：">{{ userStore.username || username }}</a-form-item>
        <a-form-item field="oldPassword" label="输入旧密码：">
          <a-input-password v-model.trim="form.oldPassword" placeholder="请输入旧密码" />
        </a-form-item>
        <a-form-item field="password" label="输入新密码：">
          <a-input-password v-model.trim="form.password" placeholder="请输入新密码" />
        </a-form-item>
        <a-form-item field="confirmPassword" label="再次输入新密码：">
          <a-input-password v-model.trim="form.confirmPassword" placeholder="请再次输入新密码" />
        </a-form-item>
      </a-form>
      <div class="modify-password-tip">
        密码要求：请输入8-20位字符，且至少包含大写字母、小写字母、数字、符号中的三种
      </div>
      <a-button type="primary" :loading="loading" size="large" @click="handleSubmit">确定</a-button>
    </div>
  </div>
</template>

<script setup lang="ts" name="ModifyPassword">
  import { ref } from 'vue'
  import useUserStore from '@/store/modules/user'
  import validator from '@/utils/validate'
  import { UserSettingApi } from '@/api'
  import { updatePasswordByUsername } from '@/api/common'
  import AES from '@/utils/AES'
  import { Message } from '@arco-design/web-vue'

  const props = defineProps({
    callback: {
      type: Boolean,
      default: false
    },
    username: {
      type: String,
      default: ''
    },
    updateByUsername: {
      type: Boolean,
      default: false
    }
  })

  const emits = defineEmits(['success'])
  const userStore = useUserStore()

  const formRef = ref()
  const form = ref({
    oldPassword: '',
    password: '',
    confirmPassword: ''
  })

  const rules = ref({
    oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
    password: [
      {
        required: true,
        validator: validator({ name: '新密码', isPassword: true }),
        trigger: 'blur'
      }
    ],
    confirmPassword: [
      {
        required: true,
        validator(value: any, callback: any) {
          if (!value) {
            return callback('请再次输入新密码')
          }
          if (value !== form.value.password) {
            return callback('两次输入的密码不一致')
          }
          return callback()
        },
        trigger: 'blur'
      }
    ]
  })

  const loading = ref(false)

  function handleSubmit() {
    formRef.value.validate((valid: any) => {
      if (valid) {
        return
      }
      loading.value = true
      // 通过username更新密码（密码超出有效期强制修改）
      if (props.updateByUsername) {
        updatePasswordByUsername({
          username: userStore.username || props.username,
          oldPassword: AES.encrypt(form.value.oldPassword),
          password: AES.encrypt(form.value.password)
        })
          .then(() => {
            Message.success('修改成功')
            formRef.value.resetFields()
            if (props.callback) {
              emits('success')
            }
          })
          .finally(() => {
            loading.value = false
          })
      } else {
        // 普通更新密码（用户中心更新密码）
        UserSettingApi.updateUserPassword({
          oldPassword: AES.encrypt(form.value.oldPassword),
          password: AES.encrypt(form.value.password)
        })
          .then(() => {
            Message.success('修改成功')
            formRef.value.resetFields()
            if (props.callback) {
              emits('success')
            }
          })
          .finally(() => {
            loading.value = false
          })
      }
    })
  }
</script>

<style lang="less" scoped>
  .modify-password {
    .modify-password-container {
      width: 80%;
      text-align: center;

      .modify-password-tip {
        color: rgb(var(--danger-6));
        margin: 10px 0 20px;
      }
    }
  }
</style>
