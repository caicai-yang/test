import { PropType } from 'vue'
import type { VxeTablePropTypes } from 'vxe-table'
import type { TableData } from '@arco-design/web-vue'
import type { IColumns } from '@/types/common'
import type { StyleValue } from 'vue'

export const Props = {
  // 表格的列描述信息
  columns: {
    type: Array as PropType<IColumns<any>>,
    default: () => []
  },
  // 表格的数据
  data: {
    type: Array as PropType<TableData[]>,
    default: () => []
  },
  // 是否显示多选按钮
  isSelection: {
    type: Boolean,
    default: false
  },
  // 多选按钮配置
  rowSelection: {
    type: Object,
    default: () => ({
      type: 'checkbox', // 行选择器的类型 'checkbox' | 'radio'
      showCheckedAll: false, // 是否显示全选选择器
      width: 50, // 列宽度
      checkStrictly: false, // 是否开启严格选择模式
      onlyCurrent: true, // 是否仅展示当前页的 keys（切换分页时清空 keys）
      reserve: false, // 是否保留勾选状态
      trigger: 'row' // 复选框触发勾选方式 'defualt | cell | row'
    })
  },
  // 是否展示表格外边框（更正：业务调整，此参数用于设置表格所有边框）
  wrapperBordered: {
    type: Boolean,
    default: true
  },
  // 是否展示主体单元格边框（更正：业务调整，此参数用于设置表格斑马纹）
  bodyBordered: {
    type: Boolean,
    default: false
  },
  // 是否显示底部页码等控制区域
  showFooter: {
    type: Boolean,
    default: true
  },
  // 是否显示底部按钮区域
  showFooterButton: {
    type: Boolean,
    default: true
  },
  // 是否显示底部全选按钮
  showSelectAllButton: {
    type: Boolean,
    default: true
  },
  // 是否显示底部反选按钮
  showInvertButton: {
    type: Boolean,
    default: true
  },
  // 是否显示底部删除按钮
  showFooterDeleteButton: {
    type: Boolean,
    default: true
  },
  // 批量删除按钮权限
  batchDeletePermission: {
    type: [String, Array],
    default: ''
  },
  // 是否显示底部分页
  showPagination: {
    type: Boolean,
    default: true
  },
  // 表头th自定义查询条件
  conditions: {
    type: Array,
    default: () => [] as Array<object>
  },
  queryParams: {
    type: Object,
    default: () => ({
      currentPage: 1,
      pageSize: 10,
      conditions: [] as Array<object>,
      sorts: [] as Array<object>
    })
  },
  // 表格行 key 的取值字段
  rowKey: {
    type: String,
    default: 'id'
  },
  // 分页数据总数
  total: {
    type: Number,
    default: 0
  },
  // 分页当前页码
  page: {
    type: Number,
    default: 1
  },
  // 分页当页条数
  pageSize: {
    type: Number,
    default: 20
  },
  // 分页页码切换选择器
  pageSizes: {
    type: Array,
    default: () => [20, 50, 100, 200]
  },
  // 页面跳转
  jumper: {
    type: Boolean,
    default: true
  },
  // 是否显示数据条数选择器
  showSizePicker: {
    type: Boolean,
    default: true
  },
  // 是否显示刷新按钮
  showRefresh: {
    type: Boolean,
    default: false
  },
  // 表格已选择的行
  selectedKeys: {
    type: Array as PropType<(string | number)[]> | null,
    default: null
  },
  // 表格加载状态
  loading: {
    type: Boolean,
    default: false
  },
  // 是否在子树为空时隐藏展开按钮
  hideExpandButtonOnEmpty: {
    type: Boolean,
    default: true
  },
  // 是否自定义批量删除提示
  isCustomBatchDelete: {
    type: Boolean,
    default: false
  },
  // 是否显示默认索引列(序号)
  showIndex: {
    type: Boolean,
    default: false
  },
  // 索引列宽
  indexWidth: {
    type: Number,
    default: 60
  },
  // 表格高度
  height: {
    type: [String, Number],
    default: 0
  },
  expandedKeys: {
    type: Array as PropType<(string | number)[]>,
    default: () => []
  },
  // 是否展开行（行里的内容）
  defaultExpandAllRows: {
    type: Boolean,
    default: false
  },
  // 是否展开所有树节点
  defaultExpandAllTree: {
    type: Boolean,
    default: false
  },
  /**
   * 是否需要自定义展示表格列（表头左侧显示自定义按钮）
   */
  customHeader: {
    type: Boolean,
    default: false
  },
  style: {
    type: [String, Array, Object] as PropType<StyleValue>,
    default: ''
  },
  class: {
    type: [String, Array, Object] as PropType<any>,
    default: ''
  },
  /**
   * 动态表格序号
   * 同个页面中，若有多个动态表格
   * 索引即为动态表格在页面中展示的序号（序号只需要统计动态表格，非动态表格不列入计算）
   * 索引从 1 开始计算
   * 若同个页面中，有两个动态表格，则动态表格1的 tableIndex=1; 动态表格2的 tableIndex=2
   *
   * 注意：
   * 设置了tableIndex后，界面中相应用到的 useTHeader、useTableWrapperBorder、useTableBodyBorder 也要传对应的tableIndex
   */
  tableIndex: {
    type: Number,
    default: null
  },
  // 树形结构配置项
  treeConfig: {
    type: Object as PropType<VxeTablePropTypes.TreeConfig>,
    default: () => ({})
  },
  // 显示表尾总结行
  summary: {
    type: Boolean,
    default: false
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  summaryText: {
    type: String,
    default: 'Summary'
  },
  // 合计行需要合计列字段数组
  summaryData: {
    type: Array,
    default: null
  },
  footerMethod: {
    type: Function,
    default: null
  },
  rowConfig: {
    type: Object as PropType<VxeTablePropTypes.RowConfig>,
    default: () => ({})
  },
  expandConfig: {
    type: Object as PropType<VxeTablePropTypes.ExpandConfig>,
    default: () => ({})
  },
  // 块粘贴字段集合
  pasteFields: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  // 表头自身排序字段
  selfSortFields: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  // 表头字段是否显示编辑icon
  showEditIcon: {
    type: Boolean,
    default: false
  },
  /**
   * 是否需要自动递增表格行
   * 主要用于块粘贴中，复制文本行数大于表格现有行数，且允许表格根据复制行数增加行的情况
   */
  increaseRow: {
    type: Boolean,
    default: false
  },
  // 是否使用rowKey作为keyField
  rowKeyAsKeyField: {
    type: Boolean,
    default: false
  },
  spanMethod: {
    type: Function,
    default: null
  },
  // tablefooter分页样式
  footerBodyStyle: {
    type: Object,
    default: () => {
      return { padding: '15px 0 0 0', width: '100%' }
    }
  },
  // 标签大小
  tagSize: {
    type: String as PropType<'medium' | 'small' | 'large' | undefined>,
    default: 'medium'
  },
  // 是否可拖拽行
  draggable: {
    type: Boolean,
    default: false
  },
  // 每行拖拽图标是否固定
  draggableFixed: {
    type: String as PropType<'left' | 'right' | ''>,
    default: ''
  },
  // 是否隐藏表格顶部‘停用表头立即查询’复选框
  hideImmediateQueryCheck: {
    type: Boolean,
    default: false
  }
}
