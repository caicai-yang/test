<template>
  <div class="personal-info">
    <!-- 头像 -->
    <a-avatar :size="130" shape="square" :image-url="userStore.avatar" />
    <!-- 个人信息 -->
    <div class="personal-info-list">
      <div v-for="(item, index) in list" :key="index" class="personal-info-item">
        <div class="personal-info-item__title">{{ item.title }}：</div>
        <div class="personal-info-item__value">{{ item.value }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="PersonalInfo">
  import { computed, onMounted } from 'vue'
  import useUserStore from '@/store/modules/user'
  import { useFindByDictionary } from '@/hooks/useDictionary'
  import { DEFAULT_USER_VALID_TIME } from '@/utils/constant'

  const userStore = useUserStore()
  const list = computed(() => {
    return [
      { title: '用户名称', value: userStore?.name },
      { title: '用户账号', value: userStore?.username },
      { title: '联系号码', value: userStore?.mobile },
      { title: '所属组织', value: userStore?.orgName },
      { title: '权限有效期', value: userStore?.validDate || DEFAULT_USER_VALID_TIME },
      { title: '性别', value: useFindByDictionary('SYS_USER_SEX', userStore?.sex)?.name },
      { title: '岗位', value: useFindByDictionary('SYS_USER_POST', userStore?.post)?.name },
      { title: '创建日期', value: userStore?.createTime }
    ]
  })

  onMounted(() => {
    userStore.getUser()
  })
</script>

<style lang="less" scoped>
  .personal-info {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    margin-top: 15px;

    .personal-info-list {
      margin-top: 30px;
      .personal-info-item {
        display: flex;
        justify-content: flex-start;
        align-items: center;

        &__value {
          flex: 1;
        }
      }

      .personal-info-item + .personal-info-item {
        margin-top: 12px;
      }
    }
  }
</style>
