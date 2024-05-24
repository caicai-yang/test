<template>
  <div class="main-container height100">
    <a-row :gutter="10" class="height100">
      <a-col :span="6" class="height100">
        <a-card class="arco-card-body100"> <PersonalInfo /> </a-card>
      </a-col>
      <a-col :span="18" class="height100">
        <a-card class="arco-card-body100">
          <a-tabs default-active-key="1" class="personal-info-tab" lazy-load>
            <a-tab-pane key="1" title="登录记录">
              <LoginRecord />
            </a-tab-pane>
            <a-tab-pane key="2" title="修改密码">
              <ModifyPassword />
            </a-tab-pane>
            <a-tab-pane key="3" title="修改信息">
              <ModifyInfo />
            </a-tab-pane>
          </a-tabs>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts" name="Personal">
  import PersonalInfo from './components/PersonalInfo.vue'
  import LoginRecord from './components/LoginRecord.vue'
  import ModifyPassword from './components/ModifyPassword.vue'
  import ModifyInfo from './components/ModifyInfo.vue'
</script>

<style lang="less" scoped>
  .personal-info-tab {
    height: 100%;
    display: flex;
    flex-direction: column;

    :deep(.arco-tabs-content) {
      flex: 1;

      .arco-tabs-content-list,
      .arco-tabs-pane {
        height: 100%;
      }
    }
  }
</style>
