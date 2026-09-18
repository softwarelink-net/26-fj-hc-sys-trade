<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p class="text-xs text-teal-400 font-medium">态势驾驶舱</p>
        <h1 class="text-2xl font-bold text-white font-display mt-1">{{ stats.assetTitle || '汇诚包装关联系统V3.0' }}</h1>
        <p class="text-xs text-slate-500 mt-1">项目编号 {{ stats.projectNumber }} · 状态 {{ stats.assetStatus }}</p>
      </div>
      <router-link to="/bidding" class="btn-primary">进入竞价舱 →</router-link>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div v-for="card in cards" :key="card.label" class="panel p-4">
        <p class="text-[11px] text-slate-400">{{ card.label }}</p>
        <p class="text-xl font-bold text-white mt-1 tabular-nums" :class="card.tone">{{ card.value }}</p>
        <p class="text-[10px] text-slate-500 mt-1">{{ card.hint }}</p>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2 panel p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-slate-200">竞价历史曲线</h3>
          <span class="text-[10px] text-slate-500">本地 sql.js 轮询刷新</span>
        </div>
        <div ref="chartRef" class="h-64 w-full" />
      </div>

      <div class="panel p-4 space-y-3">
        <h3 class="text-sm font-semibold text-slate-200">置顶公告</h3>
        <div v-for="n in stats.notices" :key="n.id" class="rounded-lg border border-slate-700/50 bg-slate-800/40 p-3">
          <div class="flex items-center gap-2 mb-1">
            <span v-if="n.is_pinned" class="badge ring-amber-600/40 bg-amber-900/30 text-amber-300">置顶</span>
            <p class="text-xs font-medium text-slate-200 truncate">{{ n.title }}</p>
          </div>
          <p class="text-[11px] text-slate-500 line-clamp-3">{{ n.content }}</p>
        </div>
        <router-link to="/notices" class="text-xs text-teal-400 hover:underline">查看全部公告 →</router-link>
      </div>
    </div>

    <div class="panel p-4 border-amber-700/30 bg-amber-950/15">
      <p class="text-xs text-amber-300 font-medium mb-1">风险提示区</p>
      <p class="text-xs text-amber-100/70 leading-relaxed">
        标的以现状为准。产权交易机构与转让方对品质和状况不作担保。竞买人须自行尽职调查；交纳保证金即表示接受挂牌条件。
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { getDashboardStats } from '@/utils/sqljs-engine'
import type { DashboardStats } from '@/types/hc'

const stats = ref<DashboardStats>(getDashboardStats())
const chartRef = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null
let poll: ReturnType<typeof setInterval> | null = null

const cards = computed(() => [
  { label: '当前最高出价', value: `¥${stats.value.highestBid.toLocaleString('zh-CN')}`, hint: `挂牌 ¥${stats.value.listingPrice.toLocaleString('zh-CN')}`, tone: 'text-cyan-300' },
  { label: '竞买人数量', value: String(stats.value.bidderCount), hint: `已审核 ${stats.value.approvedCount}`, tone: 'text-teal-300' },
  { label: '出价次数', value: String(stats.value.bidCount), hint: `加价幅度 ¥${stats.value.minIncrement}`, tone: 'text-white' },
  { label: '保证金', value: `¥${stats.value.marginAmount.toLocaleString('zh-CN')}`, hint: `待审 ${stats.value.pendingCount}`, tone: 'text-amber-300' },
])

function refresh() {
  stats.value = getDashboardStats()
  renderChart()
}

function renderChart() {
  if (!chartRef.value) return
  if (!chart) chart = echarts.init(chartRef.value)
  const hist = stats.value.bidHistory
  chart.setOption({
    backgroundColor: 'transparent',
    grid: { left: 48, right: 16, top: 24, bottom: 32 },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: hist.map((h) => h.time.slice(5, 16)),
      axisLabel: { color: '#64748b', fontSize: 10 },
      axisLine: { lineStyle: { color: '#334155' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#64748b', fontSize: 10 },
      splitLine: { lineStyle: { color: '#1e293b' } },
    },
    series: [
      {
        type: 'line',
        smooth: true,
        data: hist.map((h) => h.amount),
        areaStyle: { color: 'rgba(20, 184, 166, 0.15)' },
        lineStyle: { color: '#2dd4bf', width: 2 },
        itemStyle: { color: '#22d3ee' },
      },
    ],
  })
}

onMounted(() => {
  refresh()
  poll = setInterval(refresh, 5000)
  window.addEventListener('resize', () => chart?.resize())
})

onUnmounted(() => {
  if (poll) clearInterval(poll)
  chart?.dispose()
})

watch(() => stats.value.bidHistory.length, renderChart)
</script>
