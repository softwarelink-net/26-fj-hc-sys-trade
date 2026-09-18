<template>
  <div class="space-y-5 max-w-2xl">
    <div>
      <p class="text-xs text-teal-400 font-medium">报名与保证金通道</p>
      <h1 class="text-2xl font-bold text-white font-display mt-1">在线报名</h1>
      <p class="text-xs text-slate-500 mt-1">保证金金额 ¥{{ margin.toLocaleString('zh-CN') }} · 截止日当日 17:00 前完成</p>
    </div>

    <div v-if="existing" class="panel p-5 space-y-3">
      <p class="text-sm font-semibold text-emerald-300">您已提交报名</p>
      <dl class="grid sm:grid-cols-2 gap-3 text-xs">
        <div><dt class="text-slate-500">企业名称</dt><dd class="text-slate-200 mt-1">{{ existing.company_name }}</dd></div>
        <div><dt class="text-slate-500">信用代码</dt><dd class="text-slate-200 mt-1">{{ existing.credit_code || '—' }}</dd></div>
        <div><dt class="text-slate-500">联系人</dt><dd class="text-slate-200 mt-1">{{ existing.contact_person }}</dd></div>
        <div><dt class="text-slate-500">审核状态</dt><dd class="text-teal-300 mt-1">{{ existing.qualification_status }}</dd></div>
      </dl>
      <router-link to="/bidding" class="btn-primary inline-flex mt-2">前往竞价</router-link>
    </div>

    <form v-else class="panel p-5 space-y-4" @submit.prevent="submit">
      <div>
        <label class="block text-xs text-slate-400 mb-1.5">企业名称</label>
        <input v-model="form.company_name" required class="input-field" placeholder="请输入企业全称" />
      </div>
      <div>
        <label class="block text-xs text-slate-400 mb-1.5">统一社会信用代码</label>
        <input v-model="form.credit_code" required class="input-field" placeholder="18位信用代码" />
      </div>
      <div class="grid sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs text-slate-400 mb-1.5">联系人 / 法人</label>
          <input v-model="form.contact_person" required class="input-field" />
        </div>
        <div>
          <label class="block text-xs text-slate-400 mb-1.5">联系电话</label>
          <input v-model="form.contact_phone" required class="input-field" />
        </div>
      </div>
      <div>
        <label class="block text-xs text-slate-400 mb-1.5">转账凭证说明（模拟上传）</label>
        <input v-model="form.margin_payment_proof" class="input-field" placeholder="例如：已转账截图编号 #20260909-001" />
        <p class="text-[11px] text-slate-500 mt-1">正式缴保请前往福建省产权交易中心指定账户；本页仅做演示存证。</p>
      </div>

      <div v-if="feedback" class="rounded-lg px-3 py-2 text-xs border" :class="feedback.ok ? 'bg-emerald-900/30 border-emerald-700/40 text-emerald-300' : 'bg-red-900/30 border-red-700/40 text-red-300'">
        {{ feedback.message }}
      </div>

      <button type="submit" class="btn-primary" :disabled="loading">{{ loading ? '提交中…' : '提交报名申请' }}</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import type { HcBidder } from '@/types/hc'
import { getBidderByUser, getConfig, getPrimaryAsset, registerBidder } from '@/utils/sqljs-engine'

const userStore = useUserStore()
const existing = ref<HcBidder | null>(null)
const margin = ref(18954)
const loading = ref(false)
const feedback = ref<{ ok: boolean; message: string } | null>(null)

const form = reactive({
  company_name: '',
  credit_code: '',
  contact_person: '',
  contact_phone: '',
  margin_payment_proof: '',
})

onMounted(() => {
  margin.value = Number(getConfig('margin_amount') || 18954)
  const asset = getPrimaryAsset()
  if (asset && userStore.user) {
    existing.value = getBidderByUser(asset.id, userStore.user.id)
    form.company_name = userStore.user.company_name || ''
    form.contact_person = userStore.user.full_name || ''
  }
})

function submit() {
  const asset = getPrimaryAsset()
  if (!asset || !userStore.user) return
  loading.value = true
  try {
    const res = registerBidder({
      asset_id: asset.id,
      user_id: userStore.user.id,
      ...form,
    })
    feedback.value = res
    if (res.ok) existing.value = getBidderByUser(asset.id, userStore.user.id)
  } finally {
    loading.value = false
  }
}
</script>
