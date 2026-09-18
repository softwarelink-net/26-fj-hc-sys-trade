<template>
  <div class="min-h-screen flex flex-col bg-hc-navy">
    <GlobalStickyBanner />

    <header class="fixed top-10 left-0 right-0 z-50 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-md">
      <div class="flex items-center gap-4 px-4 h-14">
        <div class="flex items-center gap-2.5 shrink-0">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 7l9-4 9 4-9 4-9-4z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l9 4 9-4M3 17l9 4 9-4" />
            </svg>
          </div>
          <div class="hidden sm:block">
            <p class="text-sm font-bold text-white leading-tight font-display">汇诚竞价</p>
            <p class="text-[10px] text-teal-400 leading-tight">包装关联系统V3.0</p>
          </div>
        </div>

        <nav class="flex items-center gap-1 flex-1 overflow-x-auto">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors"
            :class="isActive(item.path)
              ? 'bg-teal-600/20 text-teal-300 border border-teal-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'"
          >
            <span>{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </router-link>
        </nav>

        <div class="hidden lg:flex items-center gap-2 shrink-0">
          <span class="badge ring-teal-600/40 bg-teal-900/30 text-teal-300">最高 ¥{{ format(stats.highestBid) }}</span>
          <span class="badge ring-cyan-600/40 bg-cyan-900/30 text-cyan-300">竞买人 {{ stats.bidderCount }}</span>
          <span class="badge ring-amber-600/40 bg-amber-900/30 text-amber-300">{{ stats.assetStatus }}</span>
        </div>

        <div class="flex items-center gap-2 shrink-0 ml-2">
          <div class="text-right hidden sm:block">
            <p class="text-xs font-semibold text-slate-200">{{ userStore.user?.full_name }}</p>
            <p class="text-[10px] text-teal-400">{{ userStore.roleLabel }}</p>
          </div>
          <button class="btn-ghost text-xs py-1 px-2" @click="logout">退出</button>
        </div>
      </div>
    </header>

    <main class="flex-1 pt-[6.5rem] px-4 pb-6 max-w-[1600px] mx-auto w-full">
      <router-view />
    </main>

    <footer class="border-t border-slate-800 py-2 px-4 text-center">
      <p class="text-[10px] text-slate-600">汇诚包装关联系统V3.0 · GR2026FJ1000153-24 · R2 26-fj-hc-sys-trade-assets</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getDashboardStats } from '@/utils/sqljs-engine'
import GlobalStickyBanner from '@/components/common/GlobalStickyBanner.vue'

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const navItems = [
  { path: '/dashboard', label: '驾驶舱', icon: '📊' },
  { path: '/asset-detail', label: '标的详情', icon: '📦' },
  { path: '/bidding', label: '实时竞价', icon: '⚡' },
  { path: '/compliance', label: '合规指引', icon: '📋' },
  { path: '/registration', label: '在线报名', icon: '📝' },
  { path: '/notices', label: '公告消息', icon: '📢' },
  { path: '/tender', label: '挂牌公告', icon: '🏛️' },
]

function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + '/')
}

function format(n: number) {
  return n.toLocaleString('zh-CN')
}

const stats = ref({ highestBid: 0, bidderCount: 0, assetStatus: '—' })

onMounted(async () => {
  try {
    await userStore.bootstrap()
    const s = getDashboardStats()
    stats.value = {
      highestBid: s.highestBid,
      bidderCount: s.bidderCount,
      assetStatus: s.assetStatus,
    }
  } catch { /* silent */ }
})

function logout() {
  userStore.logout()
  router.push('/login')
}
</script>
