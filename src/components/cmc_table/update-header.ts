// http://api.infra.dev.cctc.local/sys/table-scheme/update 动态表头字段
export default {
  headers: [
    {
      title: '组织名称',
      dataIndex: 'name',
      dataType: 'STRING',
      comparators: ['EQ', 'RIGHT_LIKE', 'LIKE', 'NOT_LIKE'],
      dictionaryCode: '',
      searchable: 1,
      minWidth: 0,
      freeze: 'right',
      slotName: '',
      hasEditIcon: 0,
      sortable: 0 // 是否支持列排序
    },
    {
      title: '组织类型',
      dataIndex: 'type',
      dataType: 'STRING',
      comparators: ['EQ', 'NOT_EQ'],
      dictionaryCode: 'SYS_ORG_TYPE',
      searchable: 1,
      minWidth: 0,
      freeze: '',
      slotName: '',
      hasEditIcon: 0
    },
    {
      title: '组织属性',
      dataIndex: 'attribute',
      dataType: 'STRING',
      comparators: ['EQ', 'NOT_EQ'],
      dictionaryCode: 'SYS_ORG_ATTRIBUTE',
      searchable: 1,
      minWidth: 0,
      freeze: '',
      slotName: '',
      hasEditIcon: 0
    },
    {
      title: '组织负责人',
      dataIndex: 'director',
      dataType: 'STRING',
      comparators: ['EQ', 'RIGHT_LIKE', 'LIKE', 'NOT_LIKE'],
      dictionaryCode: '',
      searchable: 1,
      minWidth: 0,
      freeze: '',
      slotName: '',
      hasEditIcon: 0
    },
    {
      title: '备注',
      dataIndex: 'comment',
      dataType: 'STRING',
      comparators: ['EQ', 'RIGHT_LIKE', 'LIKE', 'NOT_LIKE'],
      dictionaryCode: '',
      searchable: 1,
      width: 0,
      minWidth: 0,
      freeze: '',
      slotName: '',
      hasEditIcon: 0
    },
    {
      title: '创建人',
      dataIndex: 'createByUser',
      dataType: 'STRING',
      comparators: ['EQ', 'RIGHT_LIKE', 'LIKE', 'NOT_LIKE'],
      dictionaryCode: '',
      searchable: 1,
      width: 0,
      minWidth: 0,
      freeze: '',
      slotName: '',
      hasEditIcon: 0
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      dataType: 'DATETIME',
      comparators: ['BETWEEN'],
      dictionaryCode: '',
      searchable: 1,
      width: 0,
      minWidth: 0,
      freeze: '',
      slotName: '',
      hasEditIcon: 0
    },
    {
      title: '启用状态',
      dataIndex: 'enabled',
      dataType: 'INTEGER',
      comparators: ['EQ', 'NOT_EQ'],
      dictionaryCode: 'ENABLED_OR_NOT',
      searchable: 1,
      width: 0,
      minWidth: 0,
      freeze: '',
      slotName: '',
      hasEditIcon: 0
    }
  ],
  showTableBorder: 1,
  showZebraStripe: 1
}

// 用户字段表配置
// {
//   createBy: "admin",
//   createTime: "2023-04-18 09:28:30",
//   updateBy: "admin",
//   updateTime: "2024-05-23 10:19:52",
//   id: 11,
//   tableName: "sys_user",
//   fieldName: "username",
//   name: "username",
//   dataType: "STRING",
//   comment: "用户名",
//   type: "INNER",
//   dictionaryCode: "", // 字典
//   foreignTableName: "",
//   foreignFieldName: "",
//   label: "用户账号", // 表头标题
//   enabled: 1,
//   display: 1, // 字典是否展示
//   priority: 0, // 显示排序
//   searchable: 1, // 表头是否支持搜索
//   sortable: 1 // 表头是否支持排序
//   width: 100,
//   minWidth: 0,
//   freeze: "left", // 冻结 fixed: left right ''
//   slotName: "username", // 插槽名称
//   hasEditIcon: 1 // 是否显示编辑按钮
// }
