// http://api.infra.dev.cctc.local/sys/table-scheme/find?tableName=sys_org
export default {
  id: 73,
  tableId: 1,
  tableName: 'sys_org',
  name: 'test',
  config: {
    showTableBorder: 1,
    showZebraStripe: 1,
    // 当前配置可用字段
    candidateFields: [
      {
        name: 'type',
        title: '组织类型',
        dataIndex: 'type',
        width: 0,
        freeze: '',
        customized: 0
      },
      {
        name: 'attribute',
        title: '组织属性',
        dataIndex: 'attribute',
        width: 0,
        freeze: '',
        customized: 0
      },
      {
        name: 'director',
        title: '组织负责人',
        dataIndex: 'director',
        width: 0,
        freeze: '',
        customized: 0
      },
      {
        name: 'comment',
        title: '备注',
        dataIndex: 'comment',
        width: 0,
        freeze: '',
        customized: 0
      },
      {
        name: 'create_by_user',
        title: '创建人',
        dataIndex: 'createByUser',
        width: 0,
        freeze: '',
        customized: 0
      },
      {
        name: 'create_time',
        title: '创建时间',
        dataIndex: 'createTime',
        width: 0,
        freeze: '',
        customized: 0
      },
      {
        name: 'enabled',
        title: '启用状态',
        dataIndex: 'enabled',
        width: 0,
        freeze: '',
        customized: 0
      }
    ],
    // 当前字段显示字段
    displayFields: [
      {
        name: 'code',
        title: '组织代码',
        dataIndex: 'code',
        freeze: '',
        customized: 0
      },
      {
        name: 'name',
        title: '组织名称',
        dataIndex: 'name',
        freeze: '',
        customized: 0
      },
      {
        name: 'priority',
        title: '显示排序',
        dataIndex: 'priority',
        freeze: '',
        customized: 0
      }
    ]
  },
  initial: 0,
  defaultConfig: 0,
  allConfigs: [
    {
      id: 7,
      name: '初始配置',
      checked: 0
    },
    {
      id: 73,
      name: 'test',
      checked: 1
    },
    {
      id: 74,
      name: 'test2',
      checked: 0
    }
  ]
}
