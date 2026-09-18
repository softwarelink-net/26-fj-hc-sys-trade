import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useBidStore } from '@/stores/bid'
import { getConfig } from '@/utils/sqljs-engine'

export function useBidding() {
  const bidStore = useBidStore()
  const now = ref(Date.now())
  const endTime = ref<number>(0)
  let timer: ReturnType<typeof setInterval> | null = null

  const remainingMs = computed(() => Math.max(0, endTime.value - now.value))
  const countdown = computed(() => {
    const ms = remainingMs.value
    const totalSec = Math.floor(ms / 1000)
    const d = Math.floor(totalSec / 86400)
    const h = Math.floor((totalSec % 86400) / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = totalSec % 60
    return { d, h, m, s, expired: ms <= 0 }
  })

  function tick() {
    now.value = Date.now()
  }

  onMounted(() => {
    bidStore.refresh()
    const end = getConfig('bidding_end_time')
    if (end) {
      endTime.value = new Date(end.replace(' ', 'T') + '+08:00').getTime()
    }
    timer = setInterval(() => {
      tick()
      bidStore.refresh()
    }, 1000)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  return {
    bidStore,
    countdown,
    remainingMs,
  }
}
