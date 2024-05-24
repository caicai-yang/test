<template>
  <div class="org-structure">
    <!-- 左侧组织架构树 -->
    <a-row :gutter="10" class="height100">
      <a-col :span="8" class="height100">
        <a-card class="arco-card-body100 arco-card-body-flex">
          <div class="flex1 flex flex-direction-column">
            <TableHeader
              :is-add-button="false"
              :is-reset-button="false"
              :button-list="headerButtonList"
              :style="{ padding: '0 0 16px 0' }"
              @search="handleSearch"
            />

            <Table
              ref="table"
              v-model:expandedKeys="expandedKeys"
              :loading="loading"
              :selected-keys="selectedKeys"
              :columns="orgLeftTableHeader"
              :data="orgTree"
              :show-footer="false"
              :default-expand-all-rows="isExpandAll"
              @cell-click="handleCellClick"
            />
          </div>
        </a-card>
      </a-col>
      <!-- 右侧组织列表 -->
      <a-col :span="16" class="height100">
        <a-card class="arco-card-body100 arco-card-body-flex">
          <div class="flex1 flex flex-direction-column">
            <TableHeader
              v-model:queryParams="queryParams"
              :add-button-permission="CREATE_PERMISSION"
              :disabled-add-button="isDisabledAddButton"
              :style="{ padding: '0 0 16px 0' }"
              @add="handleOpenCreateOrEditModal"
              @search="handleRightSearch"
            />
            <Table
              is-selection
              is-custom-batch-delete
              show-index
              custom-header
              :loading="loading"
              :columns="orgRightTableHeader"
              :data="orgList"
              :total="total"
              :wrapper-bordered="tableWrapperBorder"
              :body-bordered="tableBodyBorder"
              :query-params="queryParams"
              batch-delete-permission="AdminSysOrgBatchDelete"
              @paginationChange="getOrgList"
              @header-filter="getOrgList"
              @delete-all="handleOpenBatchDeleteModal"
            />
          </div>
        </a-card>
      </a-col>
    </a-row>
    <AddOrEditOrgModal
      v-model:visible="createOrEditModalVisible"
      :is-create="isCreate"
      :is-operate-tree="isOperateTree"
      :current-operate-org="currentOperateOrg"
      @confirm="
        getOrgTree({
          isChangeSelected: false,
          isUpdateSelected: currentOperateOrg!.id === currentSelectedOrg!.id
        })
      "
    />
  </div>
</template>
<script setup lang="ts" name="OrgStructure">
  import type { IOrgTreeItem, IOrgTree, IOrgListItem, IOrgList } from '@/types'
  import { ref, onMounted, computed, getCurrentInstance } from 'vue'
  // import Table from '@/components/Table.vue'
  // import TableHeader from '@/components/TableHeader.vue'
  import AddOrEditOrgModal from './components/AddOrEditOrgModal.vue'
  import { OrgStructureApi } from '@/api'
  import { useParams } from '@/hooks/list'
  import { useTHeader } from '@/hooks/useTHeader'
  import { Message } from '@arco-design/web-vue'
  // import { getExpandAndSelectKeysByTree } from '@/utils/plainTree'
  import { useTableWrapperBorder, useTableBodyBorder } from '@/hooks/useTHeader'

  const { proxy } = getCurrentInstance() as any
  const table = ref()
  // 是否显示表格
  // const isRefreshedTable = ref(true)
  const isExpandAll = ref(false)
  const expandedKeys = ref<(string | number)[]>([])
  // 所有能展开的节点
  // const allExpandedKeys = computed(() => {
  //   return getExpandAndSelectKeysByTree(orgTree.value).expandKeys
  // })
  const headerButtonList = ref([
    {
      text: '折叠/展开',
      callback: () => {
        // isRefreshedTable.value = false
        isExpandAll.value = !isExpandAll.value
        // nextTick(() => {
        //   expandedKeys.value = isExpandAll.value ? allExpandedKeys.value : []
        //   isRefreshedTable.value = true
        // })
      }
    }
  ])
  // 是否显示新建弹窗
  const createOrEditModalVisible = ref(false)
  const isCreate = ref(false)
  const isBatchDelete = ref(false)
  const loading = ref(false)
  const selectedKeys = ref<number[]>([])
  const isOperateTree = ref(false)
  const tableWrapperBorder = useTableWrapperBorder() // 表格外边框
  const tableBodyBorder = useTableBodyBorder() // 表格body边框

  const currentOperateOrg = ref<IOrgTreeItem | IOrgListItem | null>()
  const CREATE_PERMISSION = 'AdminSysOrgCreate'
  const EDIT_PERMISSION = 'AdminSysOrgUpdate'
  const DELETE_PERMISSION = 'AdminSysOrgDelete'
  const orgLeftTableHeader = ref([
    {
      title: '组织名称',
      dataIndex: 'name',
      cellStyle: { cursor: 'pointer' },
      width: 180,
      align: 'left'
    },
    { title: '组织代码', dataIndex: 'code', width: 80 },
    {
      title: '启用状态',
      dataIndex: 'enabled',
      dictionaryCode: 'ENABLED_OR_NOT',
      width: 80
    },
    {
      title: '操作',
      dataIndex: 'operation',
      slotName: 'operation',
      width: 120,
      buttons: [
        {
          text: '新增',
          callback: ({ record }: { record: IOrgTreeItem }) =>
            handleOpenCreateOrEditModal(record, true, true),
          disabled: (record: IOrgTreeItem) => !record.enabled,
          permission: CREATE_PERMISSION
        },
        {
          text: '编辑',
          callback: ({ record }: { record: IOrgTreeItem }) =>
            handleOpenCreateOrEditModal(record, true, false),
          permission: EDIT_PERMISSION
        },
        {
          text: '删除',
          status: 'danger',
          callback: ({ record }: { record: IOrgTreeItem }) => {
            currentOperateOrg.value = record
            isOperateTree.value = true
            isBatchDelete.value = false
            handleConfirmDelete()
          },
          disabled: (record: IOrgTreeItem) => !!record.children?.length,
          permission: DELETE_PERMISSION
        }
      ]
    }
  ])

  // 确定删除弹窗
  function handleConfirmDelete() {
    proxy.$confirm({
      title: '删除确认',
      content: isBatchDelete.value
        ? '是否确认批量删除所选中的所有数据，该操作无法撤销，请谨慎操作！'
        : `是否确认删除组织名称为“${currentOperateOrg.value?.name}”的数据项？`,
      onOk: () => {
        if (!isBatchDelete.value && !currentOperateOrg.value) {
          return
        }

        const api = isBatchDelete.value ? OrgStructureApi.batchDeleteOrg : OrgStructureApi.deleteOrg
        const params = isBatchDelete.value
          ? batchDeleteIds.value
          : { id: currentOperateOrg.value!.id }
        api(params as any).then(() => {
          Message.success('删除成功')
          getOrgTree({
            isChangeSelected: false,
            isDeleteCurrentSelected: currentOperateOrg.value!.id === currentSelectedOrg.value!.id
          })
        })
      }
    })
  }

  const orgTree = ref<IOrgTree>([])
  // 当前操作表格行
  const currentSelectedOrg = ref<IOrgTreeItem | null>(null)

  // 根据关键字获取组织架构树
  async function getOrgTree({
    isChangeSelected = true,
    isUpdateSelected = false,
    isDeleteCurrentSelected = false
  } = {}) {
    loading.value = true
    OrgStructureApi.getOrgTree()
      .then(async (res: any) => {
        orgTree.value = res
        const [firstOrg] = res
        if (!firstOrg) {
          return
        }
        if (isChangeSelected) {
          selectedKeys.value = [firstOrg.id]
          currentSelectedOrg.value = firstOrg
          expandedKeys.value = [firstOrg.id]
          getOrgList(firstOrg.id)
        } else {
          !isDeleteCurrentSelected && getOrgList(currentSelectedOrg.value!.id)
        }

        // 更新当前选中组织信息
        if (isUpdateSelected) {
          currentSelectedOrg.value = (await OrgStructureApi.findOrg({
            id: currentSelectedOrg.value!.id
          })) as any
        }

        if (isDeleteCurrentSelected) {
          // 删除当前选中的组织, 向上升级
          const { parentId } = currentSelectedOrg.value || { parentId: 0 }
          if (parentId !== 0) {
            currentSelectedOrg.value = (await OrgStructureApi.findOrg({
              id: parentId
            })) as any
            selectedKeys.value = [currentSelectedOrg.value!.id]
            const { parentIds, id } = currentSelectedOrg.value!
            expandedKeys.value = parentIds.length ? [...parentIds, id] : [id]
            getOrgList(currentSelectedOrg.value!.id)
          } else {
            currentSelectedOrg.value = null
            selectedKeys.value = []
            expandedKeys.value = []
          }
        }
      })
      .finally(() => {
        loading.value = false
      })
  }

  // 搜索左侧树
  function handleSearch(keyword: string) {
    loading.value = true
    OrgStructureApi.getOrgTree({ keyword })
      .then((res: any) => {
        const [firstOrg] = res
        if (!firstOrg) {
          return
        }
        selectedKeys.value = [firstOrg.id]
        currentSelectedOrg.value = firstOrg
        expandedKeys.value = [...firstOrg.parentIds, firstOrg.id]
        getOrgList(firstOrg.id)
      })
      .finally(() => {
        loading.value = false
      })
  }

  const isDisabledAddButton = computed(() => {
    if (!orgTree.value.length) {
      return false
    }
    return !currentSelectedOrg.value || currentSelectedOrg.value!.enabled === 0
  })
  const orgRightTableHeader = ref()
  async function getOrgRightTableHeader() {
    const headers = await useTHeader()
    if (headers && headers.length) {
      orgRightTableHeader.value = [
        ...headers,
        {
          title: '操作',
          dataIndex: 'operation',
          slotName: 'operation',
          width: 80,
          buttons: [
            {
              text: '编辑',
              callback: ({ record }: { record: IOrgListItem }) =>
                handleOpenCreateOrEditModal(record, false, false),
              permission: EDIT_PERMISSION
            },
            {
              text: '删除',
              status: 'danger',
              callback: ({ record }: { record: IOrgListItem }) => {
                currentOperateOrg.value = record
                isOperateTree.value = false
                isBatchDelete.value = false
                handleConfirmDelete()
              },
              permission: DELETE_PERMISSION
            }
          ]
        }
      ]
    }
  }

  const orgList = ref<IOrgList[]>()
  const total = ref(0)
  const queryParams = useParams()
  const rightKeyword = ref('')

  // 搜索组织分页列表
  function handleRightSearch(keyword: string) {
    rightKeyword.value = keyword
    getOrgList()
  }

  // 查询组织分页页表
  function getOrgList(parentId: number = currentSelectedOrg.value!.id) {
    OrgStructureApi.getOrgList({
      ...queryParams.value,
      parentId,
      keyword: rightKeyword.value
    }).then((res: any) => {
      orgList.value = res.list
      total.value = res.totalCount
    })
  }

  // 点击行
  function handleCellClick(record: IOrgTreeItem, column: any) {
    if (column.dataIndex !== 'name') {
      return
    }
    if (currentSelectedOrg.value?.id === record.id) {
      return
    }
    selectedKeys.value = [record.id]
    currentSelectedOrg.value = record
    getOrgList(record.id)
    rightKeyword.value = ''
  }

  /**
   * 打开新建组织弹窗
   * @param org 新建组织父级, 不传就是 currentSelectedOrg
   * @param isTree 是否是树的新增
   */
  function handleOpenCreateOrEditModal(
    org?: IOrgTreeItem | IOrgListItem,
    isTree = false,
    isCreateOrg = true
  ) {
    currentOperateOrg.value = org || currentSelectedOrg.value
    isOperateTree.value = isTree
    isCreate.value = isCreateOrg
    createOrEditModalVisible.value = true
  }

  const batchDeleteIds = ref<number[]>()
  function handleOpenBatchDeleteModal(ids: number[]) {
    isBatchDelete.value = true
    batchDeleteIds.value = ids
    handleConfirmDelete()
  }

  onMounted(() => {
    getOrgRightTableHeader()
    getOrgTree()
  })
</script>

<style lang="less" scoped>
  .org-structure {
    width: 100%;
    height: 100%;
  }
</style>
