/**
 * 本地默认路由
 */

import { LAYOUT } from '@/store/keys'

export const defaultRoutes = [
  {
    path: '/index',
    component: LAYOUT,
    name: 'Index',
    meta: {
      title: 'Dashboard',
      iconPrefix: 'iconfont',
      icon: 'icon-dashboard'
    },
    children: [
      {
        path: '/workPlace/personal',
        name: 'Personal',
        component: (): any => import('@/views/workPlace/personal/index.vue'),
        meta: {
          affix: false,
          badge: undefined,
          cacheable: true,
          hidden: false,
          icon: 'IconUser',
          isRootPath: false,
          isSingle: false,
          title: '工作台'
        }
      }
    ]
  }
]
