<template>
  <div class="space-y-5">
    <div>
      <p class="text-xs text-teal-400 font-medium">实时竞价</p>
      <h1 class="text-2xl font-bold text-white font-display mt-1">竞价交互舱</h1>
      <p class="text-xs text-slate-500 mt-1">防抖动提交 · 个人出价历史 · 阶梯校验</p>
    </div>

    <div class="grid lg:grid-cols-5 gap-4">
      <div class="lg:col-span-3">
        <BidCockpit />
      </div>
      <div class="lg:col-span-2 space-y-4">
        <div class="panel p-4">
          <h3 class="text-sm font-semibold text-slate-200 mb-3">资格状态</h3>
          <dl class="space-y-2 text-xs">
            <div class="flex justify-between">
              <dt class="text-slate-500">报名状态</dt>
              <dd class="text-slate-200">{{ bidStore.myBidder ? '已报名' : '未报名' }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-slate-500">资格审核</dt>
              <dd :class="statusTone">{{ bidStore.myBidder?.qualification_status || '—' }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-slate-500">保证金</dt>
              <dd class="text-slate-200">{{ bidStore.myBidder?.margin_paid ? '已确认' : '未确认' }}</dd>
            </div>
          </dl>
          <router-link v-if="!bidStore.myBidder" to="/registration" class="btn-primary mt-4 inline-flex">去报名</router-link>
        </div>

        <div class="panel p-4">
          <h3 class="text-sm font-semibold text-slate-200 mb-2">竞价规则摘要</h3>
          <ul class="text-xs text-slate-400 space-y-1.5 leading-relaxed">
            <li>· 出价不得低于挂牌价，且须满足最小加价幅度。</li>
            <li>· 网络波动时保留最后一次有效出价反馈。</li>
            <li>· 正式成交以福建省产权交易中心交易系统为准。</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import BidCockpit from '@/components/BidCockpit.vue'
import { useBidStore } from '@/stores/bid'

const bidStore = useBidStore()

const statusTone = computed(() => {
  const s = bidStore.myBidder?.qualification_status
  if (s === 'APPROVED') return 'text-emerald-300'
  if (s === 'REJECTED') return 'text-red-300'
  return 'text-amber-300'
})

onMounted(() => bidStore.refresh())
</script>
