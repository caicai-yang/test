<template>
  <div class="user-setting">
    <a-row class="height100">
      <a-col :gutter="24" class="height100">
        <a-card class="arco-card-body100 arco-card-body-flex arco-card-tab">
          <a-tabs v-model:active-key="activeTabKey" lazy-load>
            <a-tab-pane key="org" title="组织"> <Container type="org" /></a-tab-pane>
            <a-tab-pane key="role" title="角色"> <Container type="role" /> </a-tab-pane>
          </a-tabs>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts" name="UserSetting">
  import { ref } from 'vue'
  import Container from './components/Container.vue'

  const activeTabKey = ref<'org' | 'role'>('org')
</script>

<style lang="less" scoped>
  .user-setting {
    width: 100%;
    height: 100%;
  }
</style>
