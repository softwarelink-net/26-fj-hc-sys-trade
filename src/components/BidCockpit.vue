<template>
  <div class="panel p-5 space-y-5">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-xs text-teal-400 font-medium mb-1">实时竞价交互舱</p>
        <h3 class="text-xl font-bold text-white font-display">当前最高价</h3>
        <p class="text-3xl font-bold text-cyan-300 mt-1 tabular-nums">¥{{ format(bidStore.highest) }}</p>
        <p class="text-xs text-slate-500 mt-1">挂牌价 ¥{{ format(bidStore.asset?.listing_price || 0) }} · 最小加价 ¥100</p>
      </div>
      <div class="text-right">
        <p class="text-[11px] text-slate-400 mb-1">距竞价截止</p>
        <div class="flex gap-2 justify-end">
          <div v-for="u in units" :key="u.label" class="bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1.5 min-w-[52px] text-center">
            <p class="text-lg font-bold text-white tabular-nums leading-none">{{ u.value }}</p>
            <p class="text-[10px] text-slate-500 mt-0.5">{{ u.label }}</p>
          </div>
        </div>
        <p v-if="countdown.expired" class="text-xs text-amber-400 mt-2">竞价已结束（演示时间轴）</p>
      </div>
    </div>

    <div class="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
      <div>
        <label class="block text-xs text-slate-400 mb-1.5">出价金额（元）</label>
        <input v-model.number="amount" type="number" class="input-field" :min="bidStore.nextMinBid" step="100" />
        <p class="text-[11px] text-slate-500 mt-1">建议最低出价 ¥{{ format(bidStore.nextMinBid) }}</p>
      </div>
      <button class="btn-primary h-[42px] px-6" :disabled="bidStore.submitting || !canBid" @click="onSubmit">
        {{ bidStore.submitting ? '提交中…' : '确认出价' }}
      </button>
    </div>

    <div
      v-if="bidStore.lastFeedback"
      class="rounded-lg px-3 py-2 text-xs border"
      :class="bidStore.lastFeedback.ok
        ? 'bg-emerald-900/30 border-emerald-700/40 text-emerald-300'
        : 'bg-red-900/30 border-red-700/40 text-red-300'"
    >
      {{ bidStore.lastFeedback.message }}
    </div>

    <div>
      <p class="text-xs font-medium text-slate-300 mb-2">我的出价历史</p>
      <div v-if="!bidStore.myBids.length" class="text-xs text-slate-500 py-4 text-center border border-dashed border-slate-700 rounded-lg">
        暂无出价记录（仅本人可见）
      </div>
      <ul v-else class="space-y-1.5 max-h-48 overflow-y-auto">
        <li
          v-for="b in bidStore.myBids"
          :key="b.id"
          class="flex justify-between text-xs bg-slate-800/50 rounded-lg px-3 py-2 border border-slate-700/40"
        >
          <span class="text-slate-400">{{ b.bid_time }}</span>
          <span class="text-teal-300 font-semibold tabular-nums">¥{{ format(b.bid_amount) }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useBidding } from '@/composables/useBidding'

const { bidStore, countdown } = useBidding()
const amount = ref(0)

watch(
  () => bidStore.nextMinBid,
  (v) => {
    if (!amount.value || amount.value < v) amount.value = v
  },
  { immediate: true },
)

const canBid = computed(
  () =>
    !!bidStore.myBidder &&
    bidStore.myBidder.qualification_status === 'APPROVED' &&
    !!bidStore.myBidder.margin_paid,
)

const units = computed(() => [
  { label: '天', value: String(countdown.value.d).padStart(2, '0') },
  { label: '时', value: String(countdown.value.h).padStart(2, '0') },
  { label: '分', value: String(countdown.value.m).padStart(2, '0') },
  { label: '秒', value: String(countdown.value.s).padStart(2, '0') },
])

function format(n: number) {
  return Number(n || 0).toLocaleString('zh-CN')
}

async function onSubmit() {
  await bidStore.submitBid(Number(amount.value))
}
</script>
