<template>
  <Modal
    v-model:visible="visible"
    modal-class="select-person-modal"
    title="选择用户"
    width="700px"
    @cancel="handleCancel"
    @confirm="handleOk"
  >
    <a-form :model="queryParams" auto-label-width>
      <a-row :gutter="30">
        <a-col :span="12">
          <a-form-item label="岗位:">
            <a-select v-model="queryParams.postList" placeholder="请选择岗位" size="large" multiple>
              <a-option
                v-for="item in userPost"
                :key="item.value"
                :value="item.value"
                :label="item.name"
              />
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="用户名称:">
            <a-input
              v-model.trim="queryParams.name"
              placeholder="请输入用户名称"
              size="large"
              :max-length="500"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="用户账号:">
            <a-input
              v-model.trim="queryParams.username"
              placeholder="请输入用户账号"
              size="large"
              :max-length="500"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="权限角色:">
            <a-tree-select
              v-model="queryParams.roleIdList"
              tree-checkable
              tree-check-strictly
              multiple
              allow-search
              placeholder="请选择权限角色"
              size="large"
              :data="roleList"
              :field-names="{ key: 'id', title: 'name', children: 'children' }"
              :filter-tree-node="filterTreeNode"
            />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <div style="width: 100%; text-align: right" class="margin-bottom-15">
      <a-space>
        <!-- 查询按钮 -->
        <SearchButton @search="search" />
        <!-- 重置按钮 -->
        <ResetButton @reset="reset" />
      </a-space>
    </div>

    <Table
      :height="350"
      :columns="tableHeader"
      :data="tableList"
      :total="total"
      :query-params="queryParams"
      is-selection
      :show-footer-delete-button="false"
      :page-sizes="[50, 100, 200, 500]"
      @paginationChange="getList"
      @selection-change="selectionChange"
    />
  </Modal>
</template>

<script lang="ts" setup name="SelectPersonl">
  import { selectPersonList, updatetPersonConfig } from '@/api/system/messageConfig'
  import { useRoute } from 'vue-router'
  import { Message } from '@arco-design/web-vue'
  import { ref, computed, onMounted } from 'vue'
  import { useDictionary, useFindByDictionary } from '@/hooks/useDictionary'
  import Modal from '@/components/Modal.vue'
  import { RoleSettingApi } from '@/api'
  import { filterTreeNode } from '@/utils'

  const props = defineProps({
    isSelectPersonModel: {
      type: Boolean
    }
  })

  const route = useRoute()
  const emit = defineEmits(['update:isSelectPersonModel', 'againSearch'])

  const visible = computed({
    get() {
      return props.isSelectPersonModel
    },
    set(visible: boolean) {
      emit('update:isSelectPersonModel', visible)
    }
  })

  const userPost = useDictionary('SYS_USER_POST')

  const tableList = ref([])

  const tableHeader = ref([
    {
      title: '用户账号',
      dataIndex: 'username',
      width: '150'
    },
    {
      title: '用户名称',
      dataIndex: 'name'
    },
    {
      title: '岗位',
      dataIndex: 'post',
      render({ record }: { record: any }) {
        return useFindByDictionary('SYS_USER_POST', record.post)?.name
      }
    },
    {
      title: '所属单位',
      dataIndex: 'orgName'
    }
  ])

  const queryParams = ref({
    currentPage: 1,
    pageSize: 50,
    username: '',
    name: '',
    postList: [],
    roleIdList: []
  })
  const total = ref(0)
  const selectedRowKeys = ref<Array<number>>([])

  function getList() {
    selectPersonList(queryParams.value).then(({ list, totalCount }) => {
      tableList.value = list
      total.value = totalCount
    })
  }

  // 选择的行数据
  function selectionChange(val: Array<number>) {
    selectedRowKeys.value = val
  }

  const roleList = ref([])
  function getRoleList() {
    RoleSettingApi.getRoleTree({ enabled: 1 }).then((res: any) => {
      roleList.value = res
    })
  }

  const handleCancel = () => {
    selectedRowKeys.value = []
    emit('update:isSelectPersonModel', false)
  }

  function handleOk() {
    if (selectedRowKeys.value.length > 0) {
      updatetPersonConfig({
        userIdList: selectedRowKeys.value,
        configId: route.params.id as string
      }).then(() => {
        emit('againSearch')
        handleCancel()
        Message.success('保存成功')
      })
    } else {
      Message.warning('请选择用户')
    }
  }

  function search() {
    getList()
  }

  function reset() {
    queryParams.value.username = ''
    queryParams.value.name = ''
    queryParams.value.postList = []
    queryParams.value.roleIdList = []
    getList()
  }

  onMounted(() => {
    getList()
    getRoleList()
  })
</script>

<style lang="less">
  .select-person-modal {
    .scrollbar__view {
      height: 100%;
      overflow: hidden;
    }
  }
</style>
