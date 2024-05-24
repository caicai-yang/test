<template>
  <div>
    <a-modal
      :visible="props.isVisible"
      title="忘记密码"
      title-align="start"
      @cancel="handleCancel"
      @ok="handleOk"
    >
      <a-form ref="formForgetRef" :model="formForget" auto-label-width :rules="ruleForm">
        <a-form-item field="username" label="输入账号" :validate-trigger="['blur']">
          <a-input v-model="formForget.username" placeholder="请输入账号" />
        </a-form-item>
        <a-form-item field="phone" label="输入注册手机号" :validate-trigger="['blur']">
          <a-input v-model="formForget.phone" placeholder="请输入手机号" />
          <a-button type="primary">获取验证码</a-button>
        </a-form-item>
        <a-form-item field="authCode" label="输入验证码" :validate-trigger="['blur']">
          <a-input-password v-model="formForget.authCode" placeholder="请输入验证码" />
        </a-form-item>
        <a-form-item field="password" label="图片验证" :validate-trigger="['blur']">
          <a-input-password v-model="formForget.password" placeholder="请输入图片验证码" />
        </a-form-item>
        <a-form-item field="password" label="输入新密码" :validate-trigger="['blur']">
          <a-input-password v-model="formForget.password" placeholder="请输入新密码" />
        </a-form-item>
        <a-form-item field="checkPassword" label="再次确认密码" :validate-trigger="['blur']">
          <a-input-password v-model="formForget.checkPassword" placeholder="请再次输入密码" />
        </a-form-item>
      </a-form>
      <p style="color: #e0001b"
        >密码要求：请输入8-20位字符，且至少包含大写字母、小写字母、数字、符号中的三种</p
      >
    </a-modal>
  </div>
</template>

<script setup>
  import { ref, reactive, onUpdated } from 'vue'
  const ruleForm = reactive({
    username: [
      { required: true, message: '账号不能为空' },
      { minLength: 5, message: '长度超过5位数' }
    ],
    password: [{ required: true, message: '新密码不能为空' }],
    authCode: [{ required: true, message: '验证码不能为空' }],
    phone: [{ required: true, message: '手机号不能为空' }],
    checkPassword: [{ required: true, message: '确认密码不能为空' }]
  })
  const formForgetRef = ref(null)
  const formForget = reactive({
    size: 'medium',
    username: 'admin',
    password: '123456',
    authCode: '',
    phone: '',
    checkPassword: ''
  })
  const props = defineProps({
    isVisible: {
      type: Boolean
    }
  })
  onUpdated(() => {
    console.log(props.isVisible)
  })
  const emit = defineEmits(['update:isVisible'])
  const handleCancel = () => {
    emit('update:isVisible', false)
  }
  function handleOk() {
    formForgetRef.value.validate(valid => {
      if (!valid) {
        emit('update:isVisible', false)
      }
    })
  }
</script>

<style lang="less" scoped>
  .arco-input-wrapper {
    background: #fff;
  }
  :deep(.arco-form-item-content) {
    border: 1px solid #ccc;
  }

  :deep(.arco-icon-hover) {
    display: none;
  }
  :deep(.arco-modal-footer) {
    text-align: center !important;
  }
</style>
