<template>
  <icon-settings :size="20" class="setting-icon" :style="{ left: left }" @click="visible = true" />
  <a-modal
    :visible="visible"
    title="配置列表字段"
    title-align="start"
    width="1000px"
    :mask-closable="false"
    @cancel="handleCancel"
    @ok="handleOk"
  >
    <a-space size="medium" class="flex justify-content-end margin-bottom-10">
      <div>
        表格边框：<a-switch
          v-model="formData.showTableBorder"
          size="small"
          :checked-value="1"
          :unchecked-value="0"
        />
      </div>
      <div>
        斑马纹：<a-switch
          v-model="formData.showZebraStripe"
          size="small"
          :checked-value="1"
          :unchecked-value="0"
        />
      </div>
    </a-space>
    <div class="flex justify-content-between margin-bottom-10">
      <div>
        <a-select
          v-model="formData.configId"
          size="small"
          class="custom-select-wrapper"
          style="width: 200px"
          @change="changeConfig"
        >
          <a-option v-for="item in configList" :key="item.id" :value="item.id">
            {{ item.name }}
          </a-option>
        </a-select>
      </div>
      <a-space>
        <a-button
          type="primary"
          status="danger"
          size="small"
          :disabled="isInitial"
          @click="deleteConfig"
        >
          删除配置
        </a-button>
        <!-- <a-button type="primary" size="small">自定义新增字段</a-button> -->
        <a-button type="primary" class="primary-5" size="small" @click="saveAsNewConfig">
          保存为新配置
        </a-button>
      </a-space>
    </div>
    <a-space>
      <!-- 左侧 -->
      <div class="left-table">
        <a-table
          v-if="visible"
          ref="sourceTable"
          :data="sourceData"
          :scroll="{ y: 300 }"
          :row-selection="rowSelection"
          :pagination="false"
          :bordered="false"
          row-key="id"
          class="table-container"
          @selection-change="sourceSelectionChange"
        >
          <template #columns>
            <a-table-column title="序号" :width="60" align="center">
              <template #cell="{ rowIndex }">
                {{ rowIndex + 1 }}
              </template>
            </a-table-column>
            <a-table-column title="字段名称" data-index="label" :width="100" align="center" />
            <!-- 自定义字段才需要编辑或删除 -->
            <!-- <a-table-column title="操作" align="center" :width="100">
              <template #cell="{ record }">
                <a-space class="operation-button">
                  <a-button type="text" size="mini">编辑</a-button>
                  <a-button type="text" size="mini" status="danger">删除</a-button>
                </a-space>
              </template>
            </a-table-column> -->
          </template>
        </a-table>
        <p class="table-tips">可用字段</p>
      </div>
      <!-- 左右穿梭按钮 -->
      <div class="arco-transfer-operations">
        <a-button type="primary" shape="circle" :disabled="disabledButtonRight" @click="arrowRight">
          <icon-right />
        </a-button>
        <a-button type="primary" shape="circle" :disabled="disabledButtonLeft" @click="arrowLeft">
          <icon-left />
        </a-button>
      </div>
      <!-- 右侧 -->
      <div class="right-table">
        <a-table
          v-if="visible"
          ref="targetTable"
          :data="targetData"
          style="width: 100%"
          :scroll="{ y: 300 }"
          :row-selection="rowSelection"
          :pagination="false"
          :bordered="false"
          row-key="id"
          class="table-container"
          @selection-change="targetSelectionChange"
        >
          <template #columns>
            <a-table-column title="序号" :width="60" align="center">
              <template #cell="{ rowIndex }">
                {{ rowIndex + 1 }}
              </template>
            </a-table-column>
            <a-table-column title="字段名称" data-index="label" :width="100" align="center" />
            <template v-if="!!targetData.length">
              <a-table-column title="显示宽度" data-index="width" :width="100" align="center">
                <template #cell="{ record }">
                  <a-input v-model="record.width" v-enter="integerReg" class="label-width">
                    <template #suffix>px</template>
                  </a-input>
                </template>
              </a-table-column>
              <a-table-column title="冻结" data-index="freeze" :width="105" align="center">
                <template #cell="{ record }">
                  <a-select v-model="record.freeze" allow-clear class="label-freeze">
                    <a-option value="left" label="左冻结" />
                    <a-option value="right" label="右冻结" />
                  </a-select>
                </template>
              </a-table-column>
            </template>
          </template>
        </a-table>
        <p class="table-tips">显示字段</p>
      </div>
      <a-space direction="vertical" class="control">
        <a-button type="outline" :disabled="disabledMoveUp" @click="moveUp">上移</a-button>
        <a-button type="outline" :disabled="disabledMoveDown" @click="moveDown">下移</a-button>
        <div class="change-line">
          调至第
          <a-input-number
            ref="jumpLineRef"
            v-model="jumpLine"
            :min="1"
            :precision="0"
            :disabled="disabledControl"
            hide-button
            @press-enter="enterLines"
            @blur="blurLines"
          />
          行
        </div>
      </a-space>
    </a-space>
    <a-checkbox v-if="!isInitial" v-model="formData.defaultConfig" class="margin-top-15">
      下次默认以此方案进入
    </a-checkbox>
  </a-modal>

  <a-modal
    :visible="addVisible"
    title="保存新配置确认"
    title-align="start"
    width="400px"
    :mask-closable="false"
    @cancel="configCancel"
    @ok="configOk"
  >
    <a-form ref="addFormRef" :model="addForm" :rules="addRules" auto-label-width>
      <a-form-item field="name" label="新配置名称">
        <a-input v-model.trim="addForm.name" :max-length="20" placeholder="请输入新配置名称" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script setup name="HeaderSetting" lang="ts">
  import { ref, reactive, getCurrentInstance, nextTick, computed, watch } from 'vue'
  import { Message, TableRowSelection } from '@arco-design/web-vue'
  import useTHeaderKeysStore from '@/store/modules/theader-keys'
  import useLanguageStore from '@/store/modules/language'
  import { useRoute } from 'vue-router'
  import {
    getSchemeList,
    createScheme,
    updateScheme,
    deleteScheme,
    getPageHeaderByNames
  } from '@/api/tableScheme'
  import { TableFiled, TableItem, Config } from '@/types/table'
  import type { Update } from '@/api/tableScheme'
  import type { HeaderSettingConfig } from '@/types/table'
  import { integerReg } from '@/utils/validate'

  const props = defineProps({
    left: {
      type: [String, Number],
      default: 0
    },
    tableIndex: {
      type: Number,
      default: null
    }
  })

  const { proxy } = getCurrentInstance() as any
  const emits = defineEmits(['update'])
  const route = useRoute()
  const theaderKeysStore = useTHeaderKeysStore()

  const disabledControl = computed(
    () =>
      !targetSelectedKeys.value.length ||
      targetSelectedKeys.value.length > 1 ||
      targetData.value.length <= 1
  )

  const disabledMoveUp = computed(
    () =>
      !targetSelectedKeys.value.length ||
      targetSelectedKeys.value.length > 1 ||
      targetData.value.findIndex((v: TableItem) => v.id === targetSelectedKeys.value[0]) === 0
  )

  const disabledMoveDown = computed(
    () =>
      !targetSelectedKeys.value.length ||
      targetSelectedKeys.value.length > 1 ||
      targetData.value.findIndex((v: TableItem) => v.id === targetSelectedKeys.value[0]) ===
        targetData.value.length - 1
  )

  const disabledButtonLeft = computed(() => !targetSelectedKeys.value.length)
  const disabledButtonRight = computed(() => !sourceSelectedKeys.value.length)
  const isInitial = computed(() => formData.value.initial)

  const rowSelection = ref<TableRowSelection>({
    type: 'checkbox', // 行选择器的类型 'checkbox' | 'radio'
    showCheckedAll: true, // 是否显示全选选择器
    width: 40, // 列宽度
    checkStrictly: true, // 是否开启严格选择模式
    onlyCurrent: true // 是否仅展示当前页的 keys（切换分页时清空 keys）
  })

  const visible = ref(false)
  const sourceData = ref<Array<TableItem>>([]) // 左侧表格数据
  const targetData = ref<Array<TableItem>>([]) // 右侧表格数据
  const sourceSelectedKeys = ref<Array<string | number>>([]) // 左侧表格选中key值
  const targetSelectedKeys = ref<Array<string | number>>([]) // 右侧表格选中key值
  const jumpLine = ref<number | undefined>() // 跳转行数
  const configList = ref<Array<Config>>([])
  const initialConfigId = ref<string | number>('') // 存放初始配置id
  const needUpdateStoreHeader = ref(false) // 是否需要更新store中存储的header
  const formData = ref({
    tableName: '',
    tableId: '',
    configId: '' as string | number,
    name: '',
    showTableBorder: 0 as 0 | 1,
    showZebraStripe: 0 as 0 | 1,
    initial: false,
    defaultConfig: false
  })

  const addVisible = ref(false)
  const isFromConfirm = ref(false)
  const addForm = ref({
    name: ''
  })
  const addRules = reactive({
    name: [{ required: true, message: '请输入新配置名称' }]
  })

  watch(
    () => visible.value,
    val => {
      if (val) {
        const path = route.matched[route.matched.length - 1].path
        const _pathKey = typeof props.tableIndex === 'number' ? path + '' + props.tableIndex : path
        const tableName = theaderKeysStore.getKey(_pathKey)
        formData.value.tableName = tableName
        getHeaderConfig()
      }
    }
  )

  // 获取配置列表
  function getHeaderConfig() {
    getSchemeList({ tableName: formData.value.tableName, id: formData.value.configId }).then(
      (res: any) => {
        const checkedConfig = res.allConfigs.filter((v: Config) => v.checked)
        configList.value = res.allConfigs.filter((v: Config) => v.name !== '初始配置')
        // 初始配置
        if (res.initial && checkedConfig && checkedConfig[0]) {
          initialConfigId.value = checkedConfig[0].id
          formData.value.configId = ''
        } else {
          // 非初始配置
          formData.value.configId = checkedConfig && checkedConfig[0] && checkedConfig[0].id
        }
        formData.value.name = res.name
        formData.value.showTableBorder = res.config.showTableBorder
        formData.value.showZebraStripe = res.config.showZebraStripe
        formData.value.defaultConfig = !!res.defaultConfig
        formData.value.initial = !!res.initial
        formData.value.tableId = res.tableId

        // 初始配置，全部字段都展示在左侧（可用字段）
        if (res.initial) {
          sourceData.value = handleTableData([
            ...res.config.candidateFields,
            ...res.config.displayFields
          ])
          targetData.value = []
        } else {
          sourceData.value = handleTableData(res.config.candidateFields)
          targetData.value = handleTableData(res.config.displayFields)
        }
      }
    )
  }

  // 通过names获取详细字段
  async function getDataByNames(names: string[]) {
    const languageStore = useLanguageStore()
    const requestParams = {
      tableSchemeId: isInitial.value ? initialConfigId.value : formData.value.configId,
      displayFields: names.map(i => ({ name: i })),
      locale: languageStore.localLang
    }
    const returnData = await getPageHeaderByNames(requestParams)
    return returnData
  }

  function changeConfig() {
    getHeaderConfig()
  }

  // 将数据处理成表格所需要展示的格式
  function handleTableData(data: TableFiled[]) {
    // 加上sortKey，用于左侧表格的排序
    return data.map((item: TableFiled, index: number) => ({
      sortKey: index,
      id: item.name,
      label: item.title,
      dataIndex: item.dataIndex,
      width: item.width,
      freeze: item.freeze
    }))
  }

  // 左侧表格选中
  function sourceSelectionChange(rowKeys: (string | number)[]) {
    sourceSelectedKeys.value = rowKeys
  }

  // 右侧表格选中
  function targetSelectionChange(rowKeys: (string | number)[]) {
    targetSelectedKeys.value = rowKeys
  }

  // 上移
  function moveUp() {
    // 获取当前操作项的索引
    const index = targetData.value.findIndex((v: TableItem) => v.id === targetSelectedKeys.value[0])
    if (index === 0) {
      return
    }
    // 当前选中行
    const currentRow = targetData.value[index]
    // 选中行的上一行
    const lastRow = targetData.value[index - 1]
    // 将选中行与上一行位置调换
    targetData.value.splice(index - 1, 2, currentRow, lastRow)
  }

  // 下移
  function moveDown() {
    // 获取当前操作项的索引
    const index = targetData.value.findIndex((v: TableItem) => v.id === targetSelectedKeys.value[0])
    if (index === targetData.value.length - 1) {
      return
    }
    // 当前选中行
    const currentRow = targetData.value[index]
    // 选中行的下一行
    const nextRow = targetData.value[index + 1]
    // 将选中行与下一行位置调换
    targetData.value.splice(index, 2, nextRow, currentRow)
  }

  function enterLines() {
    proxy.$refs.jumpLineRef.blur()
  }

  // 指定移动行数
  function blurLines() {
    if (!jumpLine.value) {
      return
    }
    // 行数最大值为表格数量
    const _max = targetData.value.length
    // 将要跳转到的行数
    const _jumpLine = jumpLine.value > _max ? _max : jumpLine.value
    // 表格的数据
    let _data = JSON.parse(JSON.stringify(targetData.value))
    // 获取当前操作项的索引
    const index = targetData.value.findIndex((v: TableItem) => v.id === targetSelectedKeys.value[0])
    // 跳转行为当前选中行，则无需跳转
    if (index === _jumpLine - 1) {
      return
    }
    // 选中首行或尾行
    if (index === 0 || index === _max - 1) {
      const _currentRow = _data.splice(index, 1)
      _data.splice(_jumpLine - 1, 0, _currentRow[0])
    } else {
      /**
       * 选中的非首行，非尾行
       */
      // 获取选中行之前的所有行数
      const _lastRows = _data.slice(0, index)
      // 获取选中行之后的所有行数
      const _nextRows = _data.slice(index + 1)
      // 当前选中行
      const _currentRow = _data.slice(index, index + 1)
      _data = [..._lastRows, ..._nextRows]
      // 跳转行数超出表格最大数量，则放在表格末尾
      if (_jumpLine > _data.length) {
        _data = [..._data, _currentRow[0]]
      } else {
        // 跳转到表格指定行数
        _data.splice(_jumpLine - 1, 0, _currentRow[0])
      }
    }
    targetData.value = _data
  }

  // 数据右穿梭
  function arrowRight() {
    const _selection: TableItem[] = []
    sourceSelectedKeys.value.forEach(key => {
      const index = sourceData.value.findIndex((v: TableItem) => v.id === key)
      if (index > -1) {
        proxy.$refs.sourceTable.selectAll(false)
        const _currentRow = sourceData.value.splice(index, 1)
        _selection.push(_currentRow[0])
      }
    })

    targetData.value.push(..._selection)

    nextTick(() => {
      proxy.$refs.targetTable.selectAll(false)
      resetKeys()
    })
  }

  // 数据左穿梭
  function arrowLeft() {
    const _selection: TableItem[] = []
    targetSelectedKeys.value.forEach(key => {
      const index = targetData.value.findIndex((v: TableItem) => v.id === key)
      if (index > -1) {
        proxy.$refs.targetTable.selectAll(false)
        const _currentRow = targetData.value.splice(index, 1)
        _selection.push(_currentRow[0])
      }
    })

    const _sourceData = [...sourceData.value, ..._selection].sort(
      (a: TableItem, b: TableItem) => a.sortKey - b.sortKey
    )

    sourceData.value = _sourceData

    nextTick(() => {
      proxy.$refs.sourceTable.selectAll(false)
      resetKeys()
    })
  }

  function resetKeys() {
    targetSelectedKeys.value = []
    sourceSelectedKeys.value = []
    jumpLine.value = undefined
  }

  function reset() {
    formData.value = {
      tableName: '',
      tableId: '',
      configId: '',
      name: '',
      showTableBorder: 0,
      showZebraStripe: 0,
      initial: false,
      defaultConfig: false
    }
    sourceData.value = []
    targetData.value = []
    resetKeys()
  }

  function handleCancel() {
    reset()
    visible.value = false
  }

  function saveAsNewConfig() {
    if (!targetData.value.length) {
      return Message.error('显示字段不能为空！')
    }
    isFromConfirm.value = false
    addVisible.value = true
  }

  function handleOk() {
    // 普通配置
    if (!isInitial.value) {
      // 不允许显示字段为空
      if (!targetData.value.length) {
        return Message.error('显示字段不能为空！')
      }
      saveConfig()
    } else if (isInitial.value && targetData.value.length) {
      // 默认配置且显示字段不为空
      proxy.$confirm({
        title: '提示',
        content: '是否将此配置保存为新配置？',
        onOk: () => {
          isFromConfirm.value = true
          addVisible.value = true
        },
        onCancel: () => {
          proxy.$confirm({
            title: '提示',
            content: '此配置仅在本次操作起效',
            onOk: async () => {
              handleTargetDataForTable()
            }
          })
        }
      })
    } else {
      // 默认字段，且显示字段为空
      const _formData = formData.value
      const requestParams = {
        tableName: _formData.tableName,
        id: isInitial.value ? initialConfigId.value : _formData.configId,
        name: _formData.name,
        config: {
          showTableBorder: _formData.showTableBorder,
          showZebraStripe: _formData.showZebraStripe,
          candidateFields: [],
          displayFields: sourceData.value.map((i: TableItem) => ({
            name: i.id,
            width: i.width,
            freeze: i.freeze
          }))
        },
        defaultConfig: _formData.defaultConfig ? 1 : 0
      }
      needUpdateStoreHeader.value = false // 不需要更新表格显示字段
      toUpdateScheme(requestParams)
    }
  }

  // 更新
  function saveConfig() {
    const _formData = formData.value
    const requestParams = {
      tableName: _formData.tableName,
      id: _formData.configId,
      name: _formData.name,
      config: {
        showTableBorder: _formData.showTableBorder,
        showZebraStripe: _formData.showZebraStripe,
        candidateFields: sourceData.value.map((i: TableItem) => ({
          name: i.id,
          width: i.width,
          freeze: i.freeze
        })),
        displayFields: targetData.value.map((i: TableItem) => ({
          name: i.id,
          width: i.width,
          freeze: i.freeze
        }))
      },
      defaultConfig: _formData.defaultConfig ? 1 : 0
    }
    needUpdateStoreHeader.value = true // 需要更新表格显示字段
    toUpdateScheme(requestParams)
  }

  function configCancel() {
    addVisible.value = false
    proxy.$refs.addFormRef.resetFields()
  }

  // 新增
  function configOk() {
    proxy.$refs.addFormRef.validate((valid: any) => {
      if (!valid) {
        const _formData = formData.value
        const requestParams = {
          tableName: _formData.tableName,
          name: addForm.value.name,
          config: {
            showTableBorder: _formData.showTableBorder,
            showZebraStripe: _formData.showZebraStripe,
            candidateFields: sourceData.value.map((i: TableItem) => ({
              name: i.id,
              width: i.width,
              freeze: i.freeze
            })),
            displayFields: targetData.value.map((i: TableItem) => ({
              name: i.id,
              width: i.width,
              freeze: i.freeze
            }))
          },
          defaultConfig: _formData.defaultConfig ? 1 : 0
        }
        createScheme(requestParams).then(async () => {
          Message.success('新增配置成功')
          if (isFromConfirm.value) {
            // 点击确定之后，弹窗提示新增的，需要处理显示字段并应用于页面表格
            handleTargetDataForTable()
          } else {
            // 直接点击 保存为新配置 的，新增成功后重新获取配置列表
            getHeaderConfig()
          }
          addVisible.value = false
        })
      }
    })
  }

  // 通过names获取字段详细值，再将字段详细值赋值给表格头
  async function handleTargetDataForTable() {
    const names = [] as string[] // 用于接口取回对应字段完整信息
    // 使用dataIndex存放当前表格对应的width、freeze
    const targeIdObject = {} as {
      [dataIndex: string]: { width?: number | string; freeze?: 'left' | 'right' | '' }
    }

    targetData.value.forEach((i: TableItem) => {
      names.push(i.id)
      targeIdObject[i.dataIndex] = {
        width: i.width,
        freeze: i.freeze
      }
    })
    const newTargetData: any = await getDataByNames(names)

    const headerSetting: HeaderSettingConfig = {
      tableColumns: newTargetData.headers.map((item: any) => {
        // 应用表格编辑的width、freeze
        item.width = targeIdObject[item.dataIndex].width
        item.fixed = targeIdObject[item.dataIndex].freeze
        return item
      }),
      wrapperBordered: formData.value.showTableBorder,
      bodyBordered: formData.value.showZebraStripe
    }
    needUpdateStoreHeader.value = true
    emitsUpdate(headerSetting)
  }

  // 执行配置更新操作
  function toUpdateScheme(data: Update) {
    updateScheme(data).then((res: any) => {
      const headerSetting: HeaderSettingConfig = {
        tableColumns: res.headers,
        wrapperBordered: formData.value.showTableBorder,
        bodyBordered: formData.value.showZebraStripe
      }
      // 需要更新字段
      // if (needUpdateStoreHeader.value) {
      //   // 表格展示的新字段
      //   headerSetting.tableColumns = res.headers
      // }
      emitsUpdate(headerSetting)
    })
  }

  function emitsUpdate(headerSetting: HeaderSettingConfig) {
    // 是默认配置，且需要更新表头
    if (needUpdateStoreHeader.value && formData.value.defaultConfig) {
      const path = route.matched[route.matched.length - 1].path
      const _pathKey = typeof props.tableIndex === 'number' ? path + '' + props.tableIndex : path
      // 存储当前THeader
      theaderKeysStore.saveTHeader({
        key: _pathKey,
        value: headerSetting.tableColumns as any[]
      })
      /**
       * 更新表格外边框和斑马纹
       */
      // 更新表格外边框
      theaderKeysStore.saveTableWrapperBorder(_pathKey, headerSetting.wrapperBordered ? 1 : 0)
      // 更新表格body边框(斑马纹)
      theaderKeysStore.saveTableBodyBorder(_pathKey, headerSetting.bodyBordered ? 1 : 0)
    }

    emits('update', headerSetting)
    handleCancel()
  }

  function deleteConfig() {
    proxy.$confirm({
      title: '删除确认',
      content: `是否确认删除配置"${formData.value.name}"，该操作无法撤销，请谨慎操作！`,
      onOk: () => {
        deleteScheme(formData.value.configId).then(() => {
          formData.value.configId = ''
          Message.success('删除成功')
          getHeaderConfig()
        })
      }
    })
  }
</script>

<style lang="less" scoped>
  .setting-icon {
    position: absolute;
    top: 10px;
    cursor: pointer;
    background: #fff;
    border-radius: 50%;
    padding: 2px;
    z-index: 10;
  }

  .table-container {
    width: 100%;
    height: 350px;
    border: 1px solid var(--color-neutral-3);
    border-radius: 4px;
  }

  .table-tips {
    margin-top: 5px;
    color: #999;
  }

  .operation-button {
    :deep(.arco-btn-text) {
      padding: 0 1px;
    }
  }

  .control {
    align-items: center;
    width: 130px;
    .change-line {
      display: flex;
      align-items: center;
      :deep(.arco-input-wrapper) {
        width: 50px;
        margin: 0 5px;
      }
    }
  }

  :deep(.arco-transfer-view-source) {
    width: 300px;
    height: 385px;
  }

  :deep(.arco-transfer-view-target) {
    width: 250px;
    height: 385px;
  }

  .label-width {
    padding: 0 5px;
    :deep(.arco-input-suffix) {
      padding-left: 5px;
    }
  }

  :deep(.label-freeze) {
    padding: 0 5px;
    .arco-select-view-suffix {
      padding-left: 5px;
    }
  }
</style>
