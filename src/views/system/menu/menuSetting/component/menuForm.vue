<template>
  <a-modal
    :visible="visible"
    :title="title"
    title-align="start"
    width="700px"
    :mask-closable="false"
    @cancel="handleCancel"
    @ok="handleOk"
  >
    <a-form
      ref="formRef"
      :model="formData"
      class="flex-form-2"
      :rules="type === 'isRead' ? {} : rules"
      :disabled="type === 'isRead'"
    >
      <a-form-item field="parentCode" label="上级菜单">
        <a-tree-select
          v-model="formData.parentCode"
          style="width: 100%"
          :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
          placeholder="请选择上级菜单"
          allow-search
          :field-names="fieldNames"
          :data="menuList"
          :filter-tree-node="filterTreeNode"
        />
      </a-form-item>
      <!-- PLATFORM 平台 -->
      <!-- NAVIGATION 导航 -->
      <!-- DIRECTORY 目录 -->
      <!-- MENU 菜单 -->
      <!-- BUTTON 按钮 -->
      <a-form-item field="type" label="菜单类型">
        <a-select v-model="formData.type" placeholder="请选择菜单类型">
          <a-option
            v-for="item in typeList"
            :key="item.value"
            :value="item.value"
            :label="item.name"
          />
        </a-select>
      </a-form-item>
      <a-form-item field="name" label="菜单名称">
        <a-input v-model.trim="formData.name" :max-length="20" placeholder="请输入菜单名称" />
      </a-form-item>
      <FormItemWithTooltip field="priority" label="显示排序" tooltip="数字越大显示优先级越高">
        <a-input-number
          v-model="formData.priority"
          :min="0"
          :precision="0"
          :max="9999999999"
          placeholder="请输入显示排序"
        />
      </FormItemWithTooltip>
      <!-- 导航，目录， 菜单 -->
      <template v-if="['NAVIGATION', 'DIRECTORY', 'MENU'].includes(formData.type)">
        <FormItemWithTooltip field="route" label="路由地址" tooltip="访问的路由地址，如‘user’">
          <a-input v-model.trim="formData.route" :max-length="100" placeholder="请输入路由地址" />
        </FormItemWithTooltip>
        <FormItemWithTooltip
          field="routeName"
          label="路由名称"
          tooltip="路由名称需唯一且与前端页面name一致，缓存机制才有效"
        >
          <a-input
            v-model.trim="formData.routeName"
            :max-length="100"
            placeholder="请输入路由名称"
          />
        </FormItemWithTooltip>
      </template>
      <!-- MENU 菜单 -->
      <template v-if="formData.type === 'MENU'">
        <FormItemWithTooltip field="componentPath" label="组件路径" tooltip="访问的组件路径">
          <a-input
            v-model.trim="formData.componentPath"
            :max-length="100"
            placeholder="请输入组件路径"
          />
        </FormItemWithTooltip>
      </template>
      <FormItemWithTooltip
        field="code"
        label="权限标识"
        :disabled="type !== 'isAdd'"
        tooltip="控制器中定义的权限字符"
      >
        <a-input v-model.trim="formData.code" :max-length="100" placeholder="请输入权限标识" />
      </FormItemWithTooltip>
      <!-- 非平台 或 非按钮 -->
      <template v-if="!['PLATFORM', 'BUTTON'].includes(formData.type)">
        <FormItemWithTooltip
          field="icon"
          label="菜单图标"
          tooltip="选择图标后，会在对应菜单前面显示图标"
        >
          <IconSelector v-model:value="formData.icon" @onSelect="iconSelect" />
        </FormItemWithTooltip>
      </template>
      <!-- MENU 菜单 -->
      <template v-if="formData.type === 'MENU'">
        <FormItemWithTooltip
          field="externalLink"
          label="外链地址"
          tooltip="需以’https://‘开头”已维护外链地址的菜单点击跳转至对应链接界面"
        >
          <a-input
            v-model.trim="formData.externalLink"
            :max-length="100"
            placeholder="请输入外链地址"
          />
        </FormItemWithTooltip>
      </template>
      <!-- 菜单，按钮 -->
      <template v-if="['MENU', 'BUTTON'].includes(formData.type)">
        <a-form-item field="api" label="后端接口api">
          <a-input
            v-model.trim="formData.api"
            :max-length="100"
            placeholder="请输入后端接口api地址"
          />
        </a-form-item>
      </template>
      <FormItemWithTooltip
        field="enabled"
        label="启用状态"
        tooltip="选择禁用时，菜单将不会出现在导航栏、菜单栏、页面按钮中，也不能被访问"
      >
        <a-radio-group v-model="formData.enabled" type="button">
          <a-radio :value="1">启用</a-radio>
          <a-radio :value="0">禁用</a-radio>
        </a-radio-group>
      </FormItemWithTooltip>
      <!-- MENU 菜单 -->
      <template v-if="formData.type === 'MENU'">
        <FormItemWithTooltip
          field="cached"
          label="是否缓存"
          tooltip="选择是，则会被缓存，需要匹配组件的’name‘和地址保持一致"
        >
          <a-switch v-model="formData.cached" :checked-value="1" :unchecked-value="0" />
        </FormItemWithTooltip>
      </template>
    </a-form>
  </a-modal>
</template>
<script setup name="MenuForm" lang="ts">
  import { ref, reactive, onMounted, getCurrentInstance, watch, PropType } from 'vue'
  import { Message } from '@arco-design/web-vue'
  import { createMenu, updateMenu } from '@/api/system/menu'
  import { useDictionary } from '@/hooks/useDictionary'
  import { getMenuTree } from '@/api/system/menu'
  import { CreateMenu, UpdateMenu } from '@/types/menu'
  import type { EditType } from '@/types/common'
  import FormItemWithTooltip from '@/components/FormItemWithTooltip/index.vue'

  const { proxy } = getCurrentInstance() as any

  type TreeData = {
    name: string
    code: string
    children: TreeData[]
    [key: string]: any
  }

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '新增菜单'
    },
    data: {
      type: Object,
      default: () => {}
    },
    type: {
      type: String as PropType<EditType>,
      default: 'isRead'
    }
  })

  watch(
    () => props.visible,
    val => {
      if (val && (props.data.id || props.data.parentCode)) {
        formData.value = JSON.parse(JSON.stringify(props.data))
        // 没有 parentCode，则是根目录，默认设置parentCode为自定义主目录localSourceMenu
        if (!formData.value.parentCode) {
          formData.value.parentCode = 'localSourceMenu'
        }
      }
    }
  )

  const menuList = ref<Array<TreeData>>([])

  const formData = ref({
    code: '',
    name: '',
    parentCode: 'localSourceMenu',
    type: '',
    icon: '',
    route: '',
    enabled: 1,
    priority: 0,
    tableName: '',
    routeName: '',
    componentPath: '',
    externalLink: '',
    cached: 0,
    api: ''
  })

  const rules = reactive({
    parentCode: [{ required: true, message: '请选择上级目录' }],
    type: [{ required: true, message: '请选择菜单类型' }],
    name: [{ required: true, message: '请输入菜单名称' }],
    priority: [{ required: true, message: '请输入显示排序' }],
    route: [{ required: true, message: '请输入路由地址' }],
    routeName: [{ required: true, message: '请输入路由名称' }],
    componentPath: [{ required: true, message: '请输入组件路径' }],
    code: [{ required: true, message: '请输入权限标识' }],
    enabled: [{ required: true, message: '请选择启用状态' }]
    // icon: [{ required: true, message: '请选择菜单图标' }]
  })

  const emits = defineEmits(['update:visible', 'success'])

  const typeList = useDictionary('SYS_MENU_TYPE')
  const fieldNames = { key: 'code', title: 'name', children: 'children' }

  function getMenuData() {
    getMenuTree({ enabled: 1 }).then((res: any) => {
      // const _menuData = plainTree(res)
      // 为菜单选项添加一层根目录，用于选择当前操作的菜单位于菜单根节点中
      const _menu: Array<TreeData> = [
        {
          name: '主目录',
          code: 'localSourceMenu',
          children: res as Array<TreeData>
        }
      ]
      menuList.value = _menu
    })
  }

  function filterTreeNode(searchValue: string, nodeData: any) {
    return nodeData.name.toLowerCase().indexOf(searchValue.toLowerCase()) > -1
  }

  // 选择菜单图标
  function iconSelect() {
    proxy.$refs.formRef.clearValidate('icon')
  }

  function handleCancel() {
    formData.value = {
      code: '',
      name: '',
      parentCode: '',
      type: '',
      icon: '',
      route: '',
      enabled: 1,
      priority: 1,
      tableName: '',
      routeName: '',
      componentPath: '',
      externalLink: '',
      cached: 0,
      api: ''
    }
    proxy.$refs.formRef.resetFields()
    emits('update:visible', false)
  }

  function handleOk() {
    proxy.$refs.formRef.validate((valid: undefined | object) => {
      if (!valid) {
        const {
          parentCode,
          type,
          name,
          priority,
          route,
          routeName,
          componentPath,
          code,
          icon,
          externalLink,
          enabled,
          cached,
          api
        } = formData.value

        let _form = {} as { [key: string]: any }
        /**
         * PLATFORM 平台
         * NAVIGATION 导航
         * DIRECTORY 目录
         * MENU 菜单
         * BUTTON 按钮
         */
        switch (formData.value.type) {
          case 'PLATFORM':
            _form = { parentCode, type, name, priority, code, enabled }
            break
          case 'NAVIGATION':
            _form = { parentCode, type, name, priority, route, routeName, code, icon, enabled }
            break
          case 'DIRECTORY':
            _form = { parentCode, type, name, priority, route, routeName, code, icon, enabled }
            break
          case 'MENU':
            _form = {
              parentCode,
              type,
              name,
              priority,
              route,
              routeName,
              componentPath,
              code,
              icon,
              externalLink,
              enabled,
              cached,
              api
            }
            break
          default:
            _form = { parentCode, type, name, priority, code, enabled, api }
        }

        // parentCode 为 localSourceMenu，说明改目录为根目录，去除自定义parentCode localSourceMenu
        if (_form.parentCode === 'localSourceMenu') {
          _form.parentCode = ''
        }
        if (props.data.id) {
          _form = { ..._form, id: props.data.id }
          // 修改
          updateMenu(_form as UpdateMenu).then(_ => {
            Message.success('修改成功')
            handleCancel()
            getMenuData()
            emits('success')
          })
        } else {
          // 新增
          createMenu(_form as CreateMenu).then(_ => {
            Message.success('新增成功')
            handleCancel()
            getMenuData()
            emits('success')
          })
        }
      }
    })
  }

  onMounted(() => {
    getMenuData()
  })
</script>

<style lang="less" scoped></style>
