<template>
  <div class="reset-password">
    <div class="tips"> 【信息安全提示：当前用户密码已过期，请修改密码！】 </div>
    <ModifyPassword callback :username="username" update-by-username @success="success" />
  </div>
</template>
<script setup name="resetPassword" lang="ts">
  import useUserStore from '@/store/modules/user'
  import cache from '@/plugins/cache'
  import ModifyPassword from '../workPlace/personal/components/ModifyPassword.vue'

  const username = cache.local.get('USERNAME') as string

  function success() {
    const userStore = useUserStore()
    userStore.setPasswordExpired(0)
    location.href = '/index'
  }
</script>
<style lang="less" scoped>
  .reset-password {
    width: 800px;
    margin: 0 auto;
    padding-top: 5%;
    .tips {
      text-align: left;
      padding-left: 130px;
      font-size: 18px;
      margin-bottom: 15px;
    }
  }
</style>
