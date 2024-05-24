<template>
  <a-card class="arco-card-body100 arco-card-body-flex">
    <TableHeader
      v-model:enabled="globalEnabled"
      :style="{ padding: '0 0 16px 0' }"
      has-enabled-select
      :has-search="false"
      add-button-permission="AdminSysMenuCreate"
      @add="addMenu"
      @changeEnabled="changeEnabled"
    >
      <template #control-button>
        <a-button type="primary" size="large" @click="expandTable"> 展开/折叠 </a-button>
      </template>
    </TableHeader>
    <Table
      :key="tableKey"
      :columns="tableHeader"
      :data="tableList"
      :total="total"
      :show-footer="false"
      :query-params="queryParams"
      :default-expand-all-rows="isExpandAll"
    />
  </a-card>
  <MenuForm
    v-model:visible="menuVisible"
    :data="editMenuData"
    :type="editType"
    @success="getList"
  />
</template>

<script setup name="Menu" lang="ts">
  import { getMenuList, deleteMenu } from '@/api/system/menu'
  import { ref, onMounted, getCurrentInstance } from 'vue'
  import { useParams } from '@/hooks/list'
  import MenuForm from './component/menuForm.vue'
  import { UpdateMenu } from '@/types/menu'
  import type { EditType } from '@/types/common'
  import { Message } from '@arco-design/web-vue'
  import { IEnabled } from '@/types/common'

  const queryParams = useParams()
  const total = ref(0)
  const menuVisible = ref(false)
  const editMenuData = ref({})
  const editType = ref<EditType>('isRead')
  const tableKey = ref('')
  const isExpandAll = ref(false)
  const globalEnabled = ref<IEnabled | ''>('')
  const { proxy } = getCurrentInstance() as any

  const tableHeader = ref([
    {
      title: '菜单名称',
      dataIndex: 'name',
      width: 200
    },
    {
      title: '排序',
      dataIndex: 'priority',
      width: 60
    },
    {
      title: '菜单类型',
      dataIndex: 'type',
      dictionaryCode: 'SYS_MENU_TYPE',
      width: 100
    },
    {
      title: '权限标识',
      dataIndex: 'code',
      width: 150
    },
    {
      title: '路由地址',
      dataIndex: 'route',
      width: 130
    },
    {
      title: '路由名称',
      dataIndex: 'routeName',
      width: 130
    },
    {
      title: '组件路径',
      dataIndex: 'componentPath',
      width: 150
    },
    {
      title: '菜单图标',
      dataIndex: 'icon',
      dataType: 'IconFont',
      width: 100
    },
    {
      title: '启用状态',
      dataIndex: 'enabled',
      dictionaryCode: 'ENABLED_OR_NOT',
      width: 90
    },
    {
      title: '是否缓存',
      dataIndex: 'cached',
      dictionaryCode: 'YES_OR_NO',
      width: 90
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 170
    },
    {
      title: '操作',
      slotName: 'operation',
      width: 150,
      buttons: [
        {
          text: '新增',
          type: 'text',
          size: 'mini',
          disabled: (record: any) => record.type && record.type.toLowerCase() === 'button',
          callback: ({ record }: any) => toCreate(record),
          permission: 'AdminSysMenuCreate'
        },
        {
          text: '编辑',
          type: 'text',
          size: 'mini',
          disabled: (record: any) => !record.parentEnabled,
          callback: ({ record }: any) => toEdit(record),
          permission: 'AdminSysMenuUpdate'
        },
        {
          text: '删除',
          type: 'text',
          size: 'mini',
          status: 'danger',
          // disabled: (record: any) => !record.enabled || !record.parentEnabled,
          callback: ({ record }: any) => toDelete(record),
          permission: 'AdminSysMenuDelete'
        }
      ]
    }
  ])
  const tableList = ref([])

  // 获取菜单列表
  function getList() {
    getMenuList({ enabled: globalEnabled.value ?? '' }).then((res: any) => {
      tableList.value = res
    })
  }

  function expandTable() {
    isExpandAll.value = !isExpandAll.value
    // nextTick(() => {
    //   if (!isExpandAll.value) {
    //     // 重新渲染表格，解决表格收缩后滚动条未消失问题
    //     tableKey.value = new Date().getTime() + ''
    //   }
    // })
  }

  function changeEnabled(enabled: IEnabled) {
    globalEnabled.value = enabled
    getList()
  }

  function addMenu() {
    editType.value = 'isAdd'
    editMenuData.value = {}
    menuVisible.value = true
  }

  // 点击菜单列表中的新增按钮
  function toCreate(record: UpdateMenu) {
    editType.value = 'isAdd'
    editMenuData.value = {
      parentCode: record.code,
      enabled: 1
    }
    menuVisible.value = true
  }

  function toEdit(record: UpdateMenu) {
    editType.value = 'isEdit'
    editMenuData.value = record
    menuVisible.value = true
  }

  function toDelete(record: UpdateMenu) {
    proxy.$confirm({
      title: '删除确认',
      content: `是否确认删除菜单名称为“${record.name}”的数据项？若菜单有存在下级菜单，将会被一同删除。`,
      onOk: () => {
        deleteMenu(record.id).then(() => {
          Message.success('删除成功')
          getList()
        })
      }
    })
  }

  onMounted(() => {
    getList()
  })
</script>
<style lang="less" scoped>
  :deep(.arco-table-cell-expand-icon) {
    justify-content: space-around;
  }
</style>
