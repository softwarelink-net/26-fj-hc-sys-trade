import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import type { UserRole } from '@/types/hc'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    roles?: UserRole[]
    layout?: 'auth' | 'main'
  }
}

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/dashboard' },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { title: '用户登录', requiresAuth: false, layout: 'auth' },
  },
  {
    path: '/tender',
    name: 'tender',
    component: () => import('@/views/tender/TenderView.vue'),
    meta: { title: '挂牌公告', requiresAuth: false, layout: 'auth' },
  },
  {
    path: '/notice',
    name: 'notice-public',
    component: () => import('@/views/notice/NoticeView.vue'),
    meta: { title: '动态公告', requiresAuth: false, layout: 'auth' },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/dashboard/DashboardView.vue'),
    meta: { title: '竞价驾驶舱', requiresAuth: true, layout: 'main' },
  },
  {
    path: '/asset-detail',
    name: 'asset-detail',
    component: () => import('@/views/asset/AssetDetailView.vue'),
    meta: { title: '标的详情', requiresAuth: true, layout: 'main' },
  },
  {
    path: '/bidding',
    name: 'bidding',
    component: () => import('@/views/bidding/BiddingView.vue'),
    meta: { title: '实时竞价', requiresAuth: true, layout: 'main' },
  },
  {
    path: '/compliance',
    name: 'compliance',
    component: () => import('@/views/compliance/ComplianceView.vue'),
    meta: { title: '合规指引', requiresAuth: true, layout: 'main' },
  },
  {
    path: '/registration',
    name: 'registration',
    component: () => import('@/views/registration/RegistrationView.vue'),
    meta: { title: '在线报名', requiresAuth: true, layout: 'main' },
  },
  {
    path: '/notices',
    name: 'notices',
    component: () => import('@/views/notice/NoticeView.vue'),
    meta: { title: '公告消息', requiresAuth: true, layout: 'main' },
  },
  {
    path: '/403',
    name: 'forbidden',
    component: () => import('@/views/error/ForbiddenView.vue'),
    meta: { title: '无权访问', requiresAuth: false, layout: 'auth' },
  },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore()
  document.title = `${to.meta.title || '汇诚竞价'} · 汇诚包装关联系统V3.0`

  const publicPages = ['/login', '/tender', '/notice', '/403']
  const isPublic = publicPages.includes(to.path) || to.meta.requiresAuth === false

  if (!userStore.engineReady && !userStore.booting) {
    try {
      await userStore.bootstrap()
    } catch {
      /* continue */
    }
  }

  if (!isPublic && !userStore.isAuthenticated) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  if (to.path === '/login' && userStore.isAuthenticated) {
    next('/dashboard')
    return
  }

  if (to.meta.roles && !userStore.hasRole(to.meta.roles as UserRole[])) {
    next('/403')
    return
  }

  next()
})

export default router
