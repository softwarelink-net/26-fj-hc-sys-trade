<template>
  <div class="min-h-screen flex">
    <div class="hidden lg:flex flex-col justify-between w-[45%] p-12 border-r border-slate-800/60">
      <div>
        <div class="flex items-center gap-3 mb-12">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 7l9-4 9 4-9 4-9-4zM3 12l9 4 9-4M3 17l9 4 9-4" />
            </svg>
          </div>
          <div>
            <p class="text-lg font-bold text-white font-display">汇诚包装关联系统V3.0</p>
            <p class="text-xs text-teal-400">国有产权转让 · 网络竞价辅助平台</p>
          </div>
        </div>

        <h2 class="text-3xl font-bold text-white mb-4 leading-tight font-display">
          挂牌价 ¥18,954<br />
          <span class="text-teal-400">透明竞价 · 合规指引</span>
        </h2>
        <p class="text-slate-400 text-sm leading-relaxed mb-8">
          福建省龙华药业有限责任公司持有标的转让展示与交易辅助。支持报名缴保、看样预约、实时出价与公告推送。
        </p>

        <div class="space-y-4">
          <div v-for="feat in features" :key="feat.title" class="flex items-start gap-3">
            <span class="text-xl mt-0.5">{{ feat.icon }}</span>
            <div>
              <p class="text-sm font-semibold text-slate-200">{{ feat.title }}</p>
              <p class="text-xs text-slate-500">{{ feat.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="text-xs text-slate-600 space-y-1">
        <p>项目编号：GR2026FJ1000153-24</p>
        <p>转让方：福建省龙华药业有限责任公司</p>
        <router-link to="/tender" class="text-teal-500 hover:text-teal-400 underline">查看挂牌公告全文 →</router-link>
      </div>
    </div>

    <div class="flex-1 flex items-center justify-center p-8">
      <div class="w-full max-w-sm">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-white mb-1">登录系统</h1>
          <p class="text-slate-500 text-sm">演示账号见下方矩阵</p>
        </div>

        <form class="space-y-4" @submit.prevent="handleLogin">
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1.5">账号</label>
            <input v-model="form.account" type="text" placeholder="用户名" autocomplete="username" class="input-field" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1.5">密码</label>
            <input v-model="form.password" type="password" placeholder="••••••••" autocomplete="current-password" class="input-field" />
          </div>

          <div v-if="error" class="rounded-lg bg-red-900/30 border border-red-700/40 px-3 py-2 text-xs text-red-300">
            {{ error }}
          </div>

          <button type="submit" :disabled="loading" class="btn-primary w-full justify-center flex items-center gap-2 py-2.5">
            {{ loading ? '登录中…' : '登录' }}
          </button>
        </form>

        <div class="mt-6 panel p-3">
          <p class="text-[11px] text-slate-400 mb-2">演示账号</p>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="a in accounts"
              :key="a.user"
              type="button"
              class="text-left rounded-lg border border-slate-700/80 bg-slate-800/50 px-2 py-1.5 hover:border-teal-500/40"
              @click="fill(a)"
            >
              <p class="text-[11px] text-slate-200 font-medium">{{ a.role }}</p>
              <p class="text-[10px] text-slate-500">{{ a.user }} / {{ a.pass }}</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const form = reactive({ account: 'admin', password: 'admin123' })
const loading = ref(false)
const error = ref('')

const features = [
  { icon: '📦', title: '标的全景展示', desc: '现状披露、风险卡片与说明书预览' },
  { icon: '⚡', title: '实时竞价交互舱', desc: '倒计时、阶梯出价与个人出价历史' },
  { icon: '📋', title: '智能合规指引', desc: '报名→看样→缴保→竞价四步流程' },
]

const accounts = [
  { role: '超管', user: 'admin', pass: 'admin123' },
  { role: '业务主管', user: 'manager', pass: 'manager123' },
  { role: '基层经办', user: 'operator', pass: 'operator123' },
  { role: '竞买人', user: 'bidder', pass: 'bidder123' },
]

function fill(a: { user: string; pass: string }) {
  form.account = a.user
  form.password = a.pass
}

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    const res = await userStore.login(form.account, form.password)
    if (!res.ok) {
      error.value = res.message
      return
    }
    const redirect = (route.query.redirect as string) || '/dashboard'
    await router.push(redirect)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '登录失败'
  } finally {
    loading.value = false
  }
}
</script>
