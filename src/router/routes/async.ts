/**
 * 该路由菜单为本地调试路由
 * 接口菜单调试成功后，以下从接口中获取
 */
export const asyncRoutes = [
  {
    id: 1,
    parentCode: '',
    name: '工作台',
    code: 'Admin',
    route: '/workPlace',
    routeName: 'WorkPlace',
    componentPath: 'Layout',
    hidden: false,
    icon: '',
    type: 1,
    children: [
      {
        id: 2,
        parentCode: 'Admin',
        name: '个人中心',
        code: '',
        type: 1,
        route: 'personal',
        routeName: 'Personal',
        componentPath: 'workPlace/personal/index',
        hidden: false,
        icon: ''
      }
    ]
  },
  {
    id: 1,
    parentCode: '',
    name: '系统管理',
    code: '',
    route: 'system',
    routeName: 'System',
    componentPath: 'Layout',
    hidden: false,
    icon: '',
    type: 1,
    children: [
      // {
      //   id: 2,
      //   type: 1,
      //   parentCode: 'system',
      //   name: '组织管理',
      //   code: '',
      //   route: 'organization',
      //   routeName: 'Organization',
      //   componentPath: 'Layout',
      //   hidden: false,
      //   icon: '',
      //   children: [
      //     {
      //       id: 3,
      //       type: 1,
      //       parentCode: 'organization',
      //       name: '组织架构',
      //       code: '',
      //       route: 'orgStructure',
      //       routeName: 'OrgStructure',
      //       componentPath: 'system/organization/orgStructure/index',
      //       hidden: false,
      //       icon: ''
      //     }
      //   ]
      // },
      // {
      //   id: 2,
      //   type: 1,
      //   parentCode: 'system',
      //   name: '菜单管理',
      //   code: '',
      //   route: 'menu',
      //   routeName: 'Menu',
      //   componentPath: 'Layout',
      //   hidden: false,
      //   icon: '',
      //   children: [
      //     {
      //       id: 2,
      //       type: 1,
      //       parentCode: 'menu',
      //       name: '菜单设置',
      //       code: '',
      //       route: 'menuConfig',
      //       routeName: 'MenuConfig',
      //       componentPath: 'system/menu/menuConfig/index',
      //       hidden: false,
      //       icon: ''
      //     }
      //   ]
      // },
      // {
      //   id: 2,
      //   type: 1,
      //   parentCode: 'system',
      //   name: '用户权限',
      //   code: '',
      //   route: 'userAuth',
      //   routeName: 'userAuth',
      //   componentPath: 'Layout',
      //   hidden: false,
      //   icon: '',
      //   children: [
      //     {
      //       id: 2,
      //       type: 1,
      //       parentCode: 'userAuth',
      //       name: '角色设置',
      //       code: '',
      //       route: 'roleConfig',
      //       routeName: 'RoleConfig',
      //       componentPath: 'system/userAuth/roleConfig/index',
      //       hidden: false,
      //       icon: ''
      //     },
      //     {
      //       id: 2,
      //       type: 1,
      //       parentCode: 'userAuth',
      //       name: '用户设置',
      //       code: '',
      //       route: 'userConfig',
      //       routeName: 'UserConfig',
      //       componentPath: 'system/userAuth/userConfig/index',
      //       hidden: false,
      //       icon: ''
      //     }
      //   ]
      // },
      {
        id: 2,
        type: 1,
        parentCode: 'system',
        name: '参数字典',
        code: '',
        route: 'paramsDictionary',
        routeName: 'ParamsDictionary',
        componentPath: 'Layout',
        hidden: false,
        icon: '',
        children: [
          {
            id: 2,
            type: 1,
            parentCode: 'paramsDictionary',
            name: '字段设置',
            code: '',
            route: 'field',
            routeName: 'Field',
            componentPath: 'system/paramsDictionary/field/index',
            hidden: false,
            icon: ''
          }
        ]
      },
      {
        id: 2,
        type: 1,
        parentCode: 'system',
        name: '日志管理',
        code: '',
        route: 'logManagement',
        routeName: 'LogManagement',
        componentPath: 'Layout',
        hidden: false,
        icon: '',
        children: [
          {
            id: 3,
            type: 1,
            parentCode: 'logManagement',
            name: '操作日志列表',
            code: '',
            route: 'operateLog',
            routeName: 'operateLog',
            componentPath: 'system/logManagement/operateLog/index',
            hidden: false,
            icon: ''
          },
          {
            id: 3,
            type: 1,
            parentCode: 'logManagement',
            name: '登录日志列表',
            code: '',
            route: 'loginLog',
            routeName: 'loginLog',
            componentPath: 'system/logManagement/loginLog/index',
            hidden: false,
            icon: ''
          }
        ]
      },
      {
        id: 2,
        type: 1,
        parentCode: 'system',
        name: '消息管理',
        code: '',
        route: 'messageCenter',
        routeName: 'messageCenter',
        componentPath: 'Layout',
        hidden: false,
        icon: '',
        children: [
          {
            id: 3,
            type: 1,
            parentCode: 'messageCenter',
            name: '消息配置',
            code: '',
            route: 'messageConfig',
            routeName: 'messageConfig',
            componentPath: 'system/messageCenter/messageConfig/index',
            hidden: false,
            icon: ''
          },
          {
            id: 3,
            type: 1,
            parentCode: 'messageCenter',
            name: '消息列表',
            code: '',
            route: 'messageList',
            routeName: 'messageList',
            componentPath: 'system/messageCenter/messageList/index',
            hidden: false,
            icon: ''
          }
        ]
      }
    ]
  }
]
