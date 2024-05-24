import { LAYOUT } from '@/store/keys'

/**
 * 固定路由
 */
export const constantRoutes = [
  // 登录
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      hidden: true
    }
  },
  // 重定向
  {
    path: '/redirect',
    component: LAYOUT,
    meta: {
      hidden: true,
      noShowTabBar: true
    },
    children: [
      {
        path: '/redirect/:path(.*)*',
        component: (): any => import('@/views/redirect/index.vue')
      }
    ]
  },
  // 首页
  {
    path: '',
    component: LAYOUT,
    redirect: '/index',
    children: [
      {
        path: '/index',
        component: () => import('@/views/index/index.vue'),
        name: 'Index',
        meta: { title: '首页', icon: 'icon-home', affix: true }
      }
    ]
  },
  // 全局重置密码
  {
    path: '/resetPassword',
    name: 'ResetPassword',
    component: () => import('@/views/resetPassword/index.vue'),
    meta: {
      noShowTabBar: true
    }
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/exception/404.vue'),
    meta: {
      hidden: true,
      noShowTabBar: true
    }
  },
  {
    path: '/500',
    name: '500',
    component: () => import('@/views/exception/500.vue'),
    meta: {
      hidden: true,
      noShowTabBar: true
    }
  },
  {
    path: '/403',
    name: '403',
    component: () => import('@/views/exception/403.vue'),
    meta: {
      hidden: true,
      noShowTabBar: true
    }
  }
]

/**
 * 这个路由是为了防止vue-router在一开始匹配不到路由的时候报：
 * No match found for location with xxx 的警告
 */
export const defaultPathRoute = {
  path: window.location.hash.replace('#', '') || window.location.pathname,
  name: 'defaultRouteName',
  component: () => import('@/views/redirect/default-route.vue'),
  meta: {
    hidden: true,
    noShowTabBar: true
  }
}
