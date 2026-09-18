<template>
  <div class="space-y-5" v-if="asset">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p class="text-xs text-teal-400 font-medium">标的全景展示引擎</p>
        <h1 class="text-2xl font-bold text-white font-display mt-1">{{ asset.title }}</h1>
        <p class="text-xs text-slate-500 mt-1">{{ asset.project_number }} · {{ asset.seller_name }}</p>
      </div>
      <div class="flex gap-2">
        <span class="badge ring-teal-600/40 bg-teal-900/30 text-teal-300">{{ asset.status }}</span>
        <span class="badge ring-cyan-600/40 bg-cyan-900/30 text-cyan-300">挂牌 ¥{{ format(asset.listing_price) }}</span>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2 space-y-4">
        <div class="panel p-5">
          <h3 class="text-sm font-semibold text-slate-200 mb-3">标的概况（以现状为准）</h3>
          <p class="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{{ asset.description }}</p>
          <dl class="grid sm:grid-cols-2 gap-3 mt-5 text-xs">
            <div class="rounded-lg bg-slate-800/50 border border-slate-700/40 p-3">
              <dt class="text-slate-500">存放地点</dt>
              <dd class="text-slate-200 mt-1">{{ asset.location }}</dd>
            </div>
            <div class="rounded-lg bg-slate-800/50 border border-slate-700/40 p-3">
              <dt class="text-slate-500">挂牌期间</dt>
              <dd class="text-slate-200 mt-1">{{ asset.listing_date }} ~ {{ asset.end_date }}</dd>
            </div>
            <div class="rounded-lg bg-slate-800/50 border border-slate-700/40 p-3">
              <dt class="text-slate-500">交易方式</dt>
              <dd class="text-slate-200 mt-1">网络竞价（福建省产权交易中心）</dd>
            </div>
            <div class="rounded-lg bg-slate-800/50 border border-slate-700/40 p-3">
              <dt class="text-slate-500">官方交易系统</dt>
              <dd class="text-teal-300 mt-1 break-all">{{ officialUrl }}</dd>
            </div>
          </dl>
        </div>

        <div class="panel p-5">
          <h3 class="text-sm font-semibold text-slate-200 mb-3">系统说明书 / 运行环境摘要</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left">
              <tbody class="divide-y divide-slate-800">
                <tr v-for="row in techRows" :key="row.k">
                  <th class="py-2 pr-4 text-slate-500 font-medium w-36">{{ row.k }}</th>
                  <td class="py-2 text-slate-300">{{ row.v }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div class="panel p-4 border-amber-700/40 bg-amber-950/20">
          <h3 class="text-sm font-bold text-amber-300 mb-3">风险提示区</h3>
          <div class="space-y-2">
            <div v-for="card in riskCards" :key="card.title" class="rounded-lg border border-amber-800/40 bg-slate-900/40 p-3">
              <p class="text-xs font-semibold text-amber-200">{{ card.title }}</p>
              <p class="text-[11px] text-amber-100/70 mt-1 leading-relaxed">{{ card.body }}</p>
            </div>
          </div>
        </div>

        <div class="panel p-4">
          <h3 class="text-sm font-semibold text-slate-200 mb-2">快捷操作</h3>
          <div class="flex flex-col gap-2">
            <router-link to="/compliance" class="btn-ghost text-center">合规指引</router-link>
            <router-link to="/registration" class="btn-ghost text-center">在线报名</router-link>
            <router-link to="/bidding" class="btn-primary text-center">参与竞价</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { HcAsset } from '@/types/hc'
import { getConfig, getPrimaryAsset } from '@/utils/sqljs-engine'

const asset = ref<HcAsset | null>(null)
const officialUrl = ref('')

const risk = computed(() => {
  try {
    return asset.value?.risk_factors ? JSON.parse(asset.value.risk_factors) : {}
  } catch {
    return {}
  }
})

const techRows = computed(() => [
  { k: '系统版本', v: '汇诚包装关联系统 V3.0' },
  { k: '技术债务', v: String(risk.value.tech_debt || 'medium') },
  { k: '许可到期', v: String(risk.value.license_expiry || '—') },
  { k: '是否含硬件', v: risk.value.hardware_included ? '是' : '否（软件资产现状转让）' },
  { k: '交付原则', v: '按现状转让，现场看样为准' },
])

const riskCards = computed(() => [
  { title: '现状交付', body: risk.value.disclaimer || '对转让标的品质和状况不作担保，以现状为准。' },
  { title: '许可与债务', body: `许可到期 ${risk.value.license_expiry || '未知'}，技术债务等级 ${risk.value.tech_debt || '未知'}。` },
  { title: '知情权', body: '放弃尽职调查均视为已全面行使知情权，并认可标的品质与现状。' },
])

function format(n: number) {
  return n.toLocaleString('zh-CN')
}

onMounted(() => {
  asset.value = getPrimaryAsset()
  officialUrl.value = getConfig('official_system_url') || ''
})
</script>
