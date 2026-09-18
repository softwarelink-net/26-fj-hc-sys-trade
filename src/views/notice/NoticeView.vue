<template>
  <div class="space-y-5 max-w-3xl mx-auto px-4 py-8" :class="{ 'pt-4': isMain }">
    <div>
      <p class="text-xs text-teal-400 font-medium">动态公告与消息</p>
      <h1 class="text-2xl font-bold text-white font-display mt-1">公告与站内信</h1>
    </div>

    <div v-if="banner" class="rounded-xl border border-teal-700/40 bg-teal-950/30 px-4 py-3 text-sm text-teal-100">
      {{ banner }}
    </div>

    <div class="space-y-3">
      <h2 class="text-sm font-semibold text-slate-200">公告列表</h2>
      <article v-for="n in notices" :key="n.id" class="panel p-4">
        <div class="flex items-center gap-2 mb-2">
          <span v-if="n.is_pinned" class="badge ring-amber-600/40 bg-amber-900/30 text-amber-300">置顶</span>
          <h3 class="text-sm font-semibold text-white">{{ n.title }}</h3>
        </div>
        <p class="text-xs text-slate-400 leading-relaxed">{{ n.content }}</p>
        <p class="text-[10px] text-slate-600 mt-2">{{ n.published_at }}</p>
      </article>
    </div>

    <div v-if="userStore.isAuthenticated" class="space-y-3">
      <h2 class="text-sm font-semibold text-slate-200">我的站内信</h2>
      <div v-if="!messages.length" class="text-xs text-slate-500">暂无消息</div>
      <div
        v-for="m in messages"
        :key="m.id"
        class="panel p-4 cursor-pointer hover:border-teal-700/40"
        @click="read(m.id)"
      >
        <div class="flex items-center justify-between gap-2">
          <p class="text-sm text-slate-100 font-medium">{{ m.title }}</p>
          <span v-if="!m.is_read" class="badge ring-cyan-600/40 bg-cyan-900/30 text-cyan-300">未读</span>
        </div>
        <p class="text-xs text-slate-400 mt-1">{{ m.body }}</p>
        <p class="text-[10px] text-slate-600 mt-2">{{ m.created_at }}</p>
      </div>
    </div>

    <div v-if="!isMain" class="text-center pt-4">
      <router-link to="/login" class="text-xs text-teal-400 underline">登录后查看更多 →</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import type { HcMessage, HcNotice } from '@/types/hc'
import { getConfig, listMessages, listNotices, markMessageRead } from '@/utils/sqljs-engine'

const userStore = useUserStore()
const route = useRoute()
const isMain = computed(() => route.meta.layout === 'main')

const notices = ref<HcNotice[]>([])
const messages = ref<HcMessage[]>([])
const banner = ref('')

function load() {
  notices.value = listNotices()
  banner.value = getConfig('site_banner') || ''
  if (userStore.user) messages.value = listMessages(userStore.user.id)
}

function read(id: number) {
  markMessageRead(id)
  load()
}

onMounted(load)
</script>
