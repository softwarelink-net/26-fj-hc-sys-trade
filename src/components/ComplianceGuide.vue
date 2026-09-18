<template>
  <div class="space-y-6">
    <div class="panel p-5">
      <p class="text-xs text-teal-400 font-medium mb-1">智能合规指引中心</p>
      <h3 class="text-lg font-bold text-white font-display mb-2">竞买人须知（四步流程）</h3>
      <p class="text-sm text-slate-400 mb-5">将公告说明结构化为可执行步骤，降低决策成本。</p>

      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          v-for="(step, i) in steps"
          :key="step.title"
          class="relative rounded-xl border border-slate-700/60 bg-slate-800/40 p-4"
        >
          <div class="w-8 h-8 rounded-full bg-teal-600/20 text-teal-300 flex items-center justify-center text-sm font-bold mb-3">
            {{ i + 1 }}
          </div>
          <p class="text-sm font-semibold text-slate-100 mb-1">{{ step.title }}</p>
          <p class="text-xs text-slate-400 leading-relaxed">{{ step.desc }}</p>
        </div>
      </div>
    </div>

    <div class="panel p-5">
      <h4 class="text-sm font-bold text-white mb-3">尽职调查清单（下载指引）</h4>
      <ul class="space-y-2">
        <li v-for="item in checklist" :key="item" class="flex items-start gap-2 text-xs text-slate-300">
          <span class="mt-0.5 text-teal-400">☑</span>
          <span>{{ item }}</span>
        </li>
      </ul>
      <button class="btn-ghost mt-4" type="button" @click="downloadChecklist">下载尽职调查清单（TXT）</button>
    </div>

    <div class="panel p-5 border-amber-700/40 bg-amber-950/20">
      <h4 class="text-sm font-bold text-amber-300 mb-2">风险与免责提示</h4>
      <ul class="space-y-2 text-xs text-amber-100/80 leading-relaxed">
        <li v-for="r in risks" :key="r">· {{ r }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
const steps = [
  { title: '报名', desc: '截止日当日 17:00 前通过交易系统或微信小程序完成线上报名。' },
  { title: '看样', desc: '赴福州市仓山区建新镇高宅路142号现场尽职调查，以现状为准。' },
  { title: '缴保', desc: '交纳交易保证金至指定账户，逾期未缴不具备竞买资格。' },
  { title: '竞价', desc: '资格审核通过后参与网络竞价，以不低于挂牌价确定受让方。' },
]

const checklist = [
  '核对挂牌价、保证金金额与加价幅度',
  '核查系统版本、运行环境与许可到期情况',
  '确认是否含硬件配套及技术债务等级',
  '阅读资产转让合同附件与税费承担条款',
  '确认报名截止时间与缴保账户信息',
]

const risks = [
  '转让标的品质和状况以现状为准，产权交易机构与转让方不作担保。',
  '放弃尽职调查视为已全面行使知情权，并认可标的品质与现状。',
  '交纳保证金即表示愿以不低于挂牌价受让，并接受公告全部要求。',
  '交易咨询仅供参考，竞买人应自行把握交易风险并审慎决策。',
]

function downloadChecklist() {
  const text = ['汇诚包装关联系统V3.0 尽职调查清单', '', ...checklist.map((c, i) => `${i + 1}. ${c}`)].join('\n')
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '汇诚包装V3.0-尽职调查清单.txt'
  a.click()
  URL.revokeObjectURL(url)
}
</script>
