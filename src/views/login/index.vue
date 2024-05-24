<template>
  <div class="login-container">
    <div class="login-main">
      <div class="login-logo">
        <img src="../../assets/loginLogo.png" alt="" />
      </div>
      <div>
        <div class="login-tab">
          <!-- <div class="login-tab-item" @click="tabChange(1)">
            <span :class="[{ active: isActive === 1 }, 'title']">登录</span>
          </div>
          <div class="login-tab-item" @click="tabChange(2)">
            <span :class="[{ active: isActive === 2 }, 'title']" @click="tabChange(2)">注册</span>
          </div> -->
        </div>
        <!-- <template v-if="isActive === 1"> -->
        <a-form
          ref="loginFormRef"
          layout="vertical"
          style="color: #fff"
          auto-label-width
          :model="loginForm"
          size="large"
          :rules="loginRules"
          @submit-success="onLogin"
        >
          <a-form-item field="username" :label="$t('Message.LoginPage.Username')">
            <a-input
              v-model.trim="loginForm.username"
              :placeholder="'请' + $t('Message.LoginPage.Username')"
              :max-length="20"
            />
          </a-form-item>
          <a-form-item field="password" :label="$t('Message.LoginPage.Password')">
            <a-input-password
              v-model.trim="loginForm.password"
              :placeholder="'请' + $t('Message.LoginPage.Password')"
              :max-length="20"
            />
          </a-form-item>
          <a-form-item v-if="showCaptcha" field="captcha" :label="$t('Message.LoginPage.Captcha')">
            <a-input
              v-model.trim="loginForm.captcha"
              :placeholder="'请' + $t('Message.LoginPage.Captcha')"
              :max-length="4"
            >
              <template #suffix>
                <img
                  :src="captchaImage"
                  alt=""
                  style="width: 100px; height: 40px; margin-bottom: 3px"
                  @click="getCaptcha()"
                />
              </template>
            </a-input>
          </a-form-item>
          <a-form-item>
            <!-- <div style="text-align: right; width: 100%">
              <span class="password" @click="getPassword">忘记密码</span>
            </div> -->
          </a-form-item>
          <div style="width: 100%; text-align: center">
            <a-button
              type="primary"
              :loading="loading"
              shape="round"
              class="login-button"
              html-type="submit"
            >
              {{ $t('Message.LoginPage.Login') }}
            </a-button>
          </div>
        </a-form>
        <!-- </template>
        <template v-else>
          <a-form
            ref="formEditRef"
            style="color: #fff"
            auto-label-width
            :model="registerForm"
            size="large"
          >
            <a-form-item
              field="username"
              label="输入账号"
              :rules="[
                { required: true, message: '名字不能为空' },
                { minLength: 5, message: '长度超过5位数' }
              ]"
              :validate-trigger="['change', 'input']"
            >
              <a-input v-model="registerForm.username" placeholder="请输入账号" />
            </a-form-item>
            <a-form-item
              field="password"
              label="输入密码"
              :rules="[{ required: true, message: '密码不能为空' }]"
            >
              <a-input-password v-model="registerForm.password" placeholder="请输入密码" />
            </a-form-item>
            <a-form-item
              field="checkPassword"
              label="再次确认密码"
              :rules="[{ required: true, message: '确认密码不能为空' }]"
            >
              <a-input-password v-model="registerForm.checkPassword" placeholder="请再次输入密码" />
            </a-form-item>
            <a-form-item
              field="phone"
              label="输入手机号"
              :rules="[{ required: true, message: '手机号不能为空' }]"
            >
              <a-input v-model="registerForm.telephone" placeholder="请输入手机号">
                <template #suffix>
                  <span class="captcha-button">获取验证码</span>
                </template>
              </a-input>
            </a-form-item>
            <a-form-item
              field="authCode"
              label="输入验证码"
              :rules="[{ required: true, message: '验证码不能为空' }]"
            >
              <a-input v-model="registerForm.captcha" placeholder="请输入验证码" />
            </a-form-item>
            <div style="width: 100%; text-align: center">
              <a-button
                type="primary"
                :loading="loading"
                shape="round"
                class="login-button"
                @click="toRegister"
              >
                注册
              </a-button>
            </div>
          </a-form>
        </template> -->
      </div>
    </div>
  </div>
  <!-- <forgetPassword v-model:isVisible="isVisible" /> -->
</template>

<script lang="ts" setup name="Login">
  import { setToken } from '@/utils/auth'
  import cache from '@/plugins/cache'
  import { login, getCaptchaImage } from '@/api/common'
  import { onMounted, ref, reactive, computed } from 'vue'
  import { Message } from '@arco-design/web-vue'
  import { useRoute, useRouter } from 'vue-router'
  import { uuid } from '@/utils/index'
  import AES from '@/utils/AES'
  import { useI18n } from 'vue-i18n'
  import { useConfig } from '@/hooks/useConfig'
  // import forgetPassword from './component/forgetPassword.vue'

  const _i18n = useI18n()
  const ENABLE_LOGIN_IMAGE_CAPTCHA = useConfig('ENABLE_LOGIN_IMAGE_CAPTCHA').value
  const showCaptcha = computed(
    () => ENABLE_LOGIN_IMAGE_CAPTCHA && String(ENABLE_LOGIN_IMAGE_CAPTCHA) === 'true'
  )

  // 登录
  const loginForm = ref({
    username: '', // admin
    password: '', // 12345678
    captcha: ''
  })

  // 注册
  // const registerForm = ref({
  //   username: '',
  //   password: '',
  //   checkPassword: '',
  //   telephone: '',
  //   captcha: ''
  // })

  const loginRules = reactive({
    username: [
      { required: true, message: '账号不能为空' },
      { maxLength: 20, message: '账号不能超过20个字符' }
    ],
    password: [
      { required: true, message: '密码不能为空' },
      { minLength: 8, maxLength: 20, message: '密码长度8-20位' }
    ],
    captcha: [{ required: true, message: '验证码不能为空' }]
  })

  const loading = ref(false)
  const router = useRouter()
  const route = useRoute()
  // const isVisible = ref(false)
  const loginFormRef = ref(null)
  // const isActive = ref(1)

  const captchaImage = ref('')
  const uuidV4 = uuid()

  onMounted(() => {
    getCaptcha()
  })

  // 登录
  const onLogin = () => {
    loading.value = true
    cache.local.set('USERNAME', loginForm.value.username)
    login({
      username: loginForm.value.username,
      password: AES.encrypt(loginForm.value.password),
      captcha: {
        operationId: uuidV4,
        code: loginForm.value.captcha
      }
    })
      .then(res => {
        setToken(res.authorization)
        Message.success(_i18n.t('Message.LoginSuccess') + '，欢迎：' + loginForm.value.username)
        loading.value = false
        // passwordExpired 密码是否已过期，0：否，1：是
        if (res.passwordExpired) {
          // 跳转修改密码页
          router.replace('/resetPassword')
          return
        }
        router.replace({
          path:
            route.query.redirect && route.query.redirect !== '/404'
              ? (route.query.redirect as string)
              : '/'
        })
      })
      .catch(() => {
        loading.value = false
        getCaptcha()
      })
  }

  // 获取验证码
  const getCaptcha = () => {
    getCaptchaImage({ operationId: uuidV4 }).then(res => {
      const blob = new Blob([res])
      const url = window.URL.createObjectURL(blob)
      captchaImage.value = url
    })
  }
  // const toRegister = () => {}

  // 切换选项卡
  // function tabChange(val: number) {
  //   isActive.value = val
  // }

  // function getPassword() {
  //   isVisible.value = true
  // }
</script>

<style lang="less" scoped>
  @keyframes scale-to {
    0% {
      transform: scale(0.2, 0.2);
    }

    100% {
      transform: scale(1, 1);
    }
  }

  @leftWith: 35%;

  .login-container {
    height: 100%;
    width: 100%;
    background-image: url('../../assets/background.png');
    background-size: cover;
    background-position: center center;
    .login-main {
      position: absolute;
      top: 50%;
      left: 13%;
      transform: translateY(-45%);
      width: 500px;
      height: auto;
      background: url('@/assets/loginInput.png') center center;
      background-size: 100% 100%;
      padding: 20px 50px;
      padding-bottom: 200px;
      .login-logo {
        text-align: center;
        > img {
          width: 200px;
        }
      }
      .login-tab {
        font-size: 25px;
        display: flex;
        margin: 20px 0 25px 0;
        padding: 0 50px;
        .login-tab-item {
          flex: 1;
          cursor: pointer;
          text-align: center;
        }
        .title {
          color: #fff !important;
          font-size: 22px;
          &.active {
            border-bottom: 3px solid #fff;
            font-weight: 550;
            padding-bottom: 3px;
          }
        }
      }
      .captcha-button {
        display: inline-block;
        line-height: 1.5rem;
        background: #169bd5;
        padding: 0 0.3rem;
        border-radius: 3px;
        color: #fff;
      }

      .login-button {
        width: 160px;
        background: #2829a8;
        line-height: 50px;
        height: 50px;
        font-size: 22px;
        font-weight: bold;
        &:hover {
          background-color: rgb(var(--primary-5));
          border-color: transparent;
        }
      }
    }
  }
  .password {
    cursor: pointer;
    color: #c0d6ef;
  }
  :deep(.arco-input-wrapper) {
    background-color: transparent;
    color: #fff;
    border: none;
    border-bottom: 2px solid #fff;
    border-radius: unset;
    &:hover {
      background-color: transparent;
      color: #fff;
      border: none;
      border-bottom: 2px solid #fff;
    }
  }
  :deep(.arco-input-error) {
    background-color: transparent !important;
    color: #fff !important;
    border: none !important;
    border-bottom: 2px solid #fff !important;
  }
  :deep(.arco-form-item-label-col) {
    margin-bottom: 0;
    .arco-form-item-label {
      font-size: 18px;
      color: #cdd7f0;
    }
  }
  :deep(.arco-form-item-label-required-symbol) {
    display: none;
  }
  :deep(.arco-input-suffix) {
    color: #fff;
  }
  :deep(.arco-icon-hover) {
    display: none;
  }
  :deep(.arco-modal > .arco-modal-footer) {
    text-align: center !important;
  }
</style>
