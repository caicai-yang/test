import { mapTwoLevelRouter } from '@/store/help'
import { App } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { constantRoutes, defaultPathRoute } from './routes/constants'

const Layout = () => import('@/layouts/Layout.vue')

// 详情页面等路由
export const extraRoutes = [
  {
    path: '/system',
    component: Layout,
    name: 'system',
    children: [
      // {
      //   path: 'test/detail/:id',
      //   name: 'testDetail',
      //   component: () => import('@/views/system/test/detail.vue'),
      //   meta: {
      //     title: '详情'
      //   }
      // },
      {
        path: 'messageCenter/messageConfig/messageDetailConfig',
        name: 'msgCigDetail',
        component: () => import('@/views/system/messageCenter/messageConfig/messageDetail.vue'),
        meta: {
          title: '消息配置'
        }
      },
      {
        path: 'messageCenter/messageConfig/configPerson/:id',
        name: 'msgCigPerson',
        component: () => import('@/views/system/messageCenter/messageConfig/configPerson.vue'),
        meta: {
          title: '用户配置'
        }
      },
      {
        path: 'messageCenter/messageConfig/detail/:id/:type',
        name: 'MessageConfigDetail',
        // component: () =>
        //   import('@/views/system/messageCenter/messageConfig/component/checkConfig.vue'),
        component: () => import('@/views/system/messageCenter/messageConfig/messageDetail.vue'),
        meta: {
          title: '消息配置详情'
        }
      },
      {
        path: '/messageList/detail/:id',
        name: 'MessageListDetail',
        component: () => import('@/views/system/messageCenter/messageList/detail.vue'),
        meta: {
          title: '消息详情'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: mapTwoLevelRouter([...constantRoutes, ...extraRoutes, defaultPathRoute])
})

export default router

export function setupRouter(app: App) {
  app.use(router)
}
