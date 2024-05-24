<template>
  <div class="language">
    <a-row class="height100">
      <a-col :gutter="24" class="height100">
        <a-card class="arco-card-body100 arco-card-body-flex arco-card-tab">
          <a-tabs v-model:active-key="activeTabKey" lazy-load>
            <a-tab-pane key="MENU" title="菜单">
              <Menu
                ref="menuRef"
                type="MENU"
                :lang="localLang"
                @add="addLanguage"
                @update="updateLanguage"
                @delete="toDelete"
              />
            </a-tab-pane>
            <a-tab-pane key="FIELD" title="字段">
              <Field
                ref="fieldRef"
                type="FIELD"
                :lang="localLang"
                @add="addLanguage"
                @update="updateLanguage"
                @delete="toDelete"
              />
            </a-tab-pane>
            <a-tab-pane key="DICT" title="字典">
              <Dict
                ref="dictRef"
                type="DICT"
                :lang="localLang"
                @add="addLanguage"
                @update="updateLanguage"
                @delete="toDelete"
              />
            </a-tab-pane>
            <a-tab-pane key="MESSAGE" title="全局提醒">
              <MessageLanguage
                ref="messageRef"
                type="MESSAGE"
                :lang="localLang"
                @add="addLanguage"
                @update="updateLanguage"
                @delete="toDelete"
              />
            </a-tab-pane>
          </a-tabs>
        </a-card>
      </a-col>
    </a-row>

    <!-- 新增或编辑语种 -->
    <EditForm
      v-model:visible="visible"
      :title="title"
      :type="activeTabKey"
      :foreign-id="foreignId"
      :data="editData"
      :select-local-list="selectLocalList"
      @success="success"
    />
  </div>
</template>

<script setup lang="ts" name="Language">
  import { ref, getCurrentInstance } from 'vue'
  import { Message } from '@arco-design/web-vue'
  import Menu from './component/menu.vue'
  import Field from './component/field.vue'
  import Dict from './component/dict.vue'
  import MessageLanguage from './component/messageLanguage.vue'
  import EditForm from './component/editForm.vue'
  import useLanguageStore from '@/store/modules/language'
  import { deleteLanguage } from '@/api/system/language'
  import { useFindByDictionary } from '@/hooks/useDictionary'
  import { UpdateRecord } from '@/types/language'

  const { proxy } = getCurrentInstance() as any

  const languageStore = useLanguageStore()
  const localLang = languageStore.localLang
  const activeTabKey = ref<'MENU' | 'FIELD' | 'DICT' | 'MESSAGE'>('MENU')

  const visible = ref(false)
  const title = ref('')
  const foreignId = ref<string | number>('')
  const editData = ref({})
  const selectLocalList = ref<string[]>([])

  function addLanguage(id: string | number, localList: string[]) {
    foreignId.value = id
    title.value = '新增语种'
    editData.value = {}
    selectLocalList.value = localList
    visible.value = true
  }

  function updateLanguage(data: UpdateRecord, localList: string[]) {
    foreignId.value = ''
    title.value = '更新语种'
    editData.value = JSON.parse(JSON.stringify(data))
    selectLocalList.value = localList
    visible.value = true
  }

  function success() {
    switch (activeTabKey.value) {
      case 'MENU':
        proxy.$refs.menuRef.getDetailList()
        break
      case 'FIELD':
        proxy.$refs.fieldRef.getLanguageDetail()
        break
      case 'DICT':
        proxy.$refs.dictRef.getLanguageDetail()
        break
      case 'MESSAGE':
        proxy.$refs.messageRef.getDetailList()
        break
      default:
        break
    }
  }

  function toDelete(id: number, local: string) {
    const lang = useFindByDictionary('SYS_LOCALE', local)
    proxy.$confirm({
      title: '删除确认',
      content: `是否确认删除语种名称为 “${lang?.name ?? local}” 的数据项？`,
      onOk: () => {
        deleteLanguage(id).then(() => {
          Message.success('删除成功')
          success()
        })
      }
    })
  }
</script>

<style lang="less" scoped>
  .language {
    width: 100%;
    height: 100%;
    :deep(.arco-tabs-content) {
      padding-top: 0;
    }
  }
</style>
