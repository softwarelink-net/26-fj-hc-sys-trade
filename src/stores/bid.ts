import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { HcAsset, HcBidRecord, HcBidder } from '@/types/hc'
import {
  getBidderByUser,
  getHighestBid,
  getPrimaryAsset,
  listBidRecords,
  placeBid,
} from '@/utils/sqljs-engine'
import { useUserStore } from './user'

export const useBidStore = defineStore('bid', () => {
  const asset = ref<HcAsset | null>(null)
  const highest = ref(0)
  const myBids = ref<HcBidRecord[]>([])
  const myBidder = ref<HcBidder | null>(null)
  const lastFeedback = ref<{ ok: boolean; message: string } | null>(null)
  const submitting = ref(false)

  const nextMinBid = computed(() => {
    if (!asset.value) return 0
    const inc = 100
    if (highest.value <= 0 || highest.value < asset.value.listing_price) {
      return asset.value.listing_price
    }
    return highest.value + inc
  })

  function refresh() {
    asset.value = getPrimaryAsset()
    if (!asset.value) return
    highest.value = getHighestBid(asset.value.id) || asset.value.listing_price
    const userStore = useUserStore()
    if (userStore.user) {
      myBidder.value = getBidderByUser(asset.value.id, userStore.user.id)
      myBids.value = myBidder.value
        ? listBidRecords(asset.value.id, myBidder.value.id)
        : []
    } else {
      myBidder.value = null
      myBids.value = []
    }
  }

  async function submitBid(amount: number) {
    if (!asset.value || !myBidder.value) {
      lastFeedback.value = { ok: false, message: '请先完成报名并通过资格审核' }
      return lastFeedback.value
    }
    if (myBidder.value.qualification_status !== 'APPROVED' || !myBidder.value.margin_paid) {
      lastFeedback.value = { ok: false, message: '资格未通过或保证金未确认，无法出价' }
      return lastFeedback.value
    }
    submitting.value = true
    try {
      const result = placeBid(asset.value.id, myBidder.value.id, amount)
      lastFeedback.value = result
      refresh()
      return result
    } finally {
      submitting.value = false
    }
  }

  return {
    asset,
    highest,
    myBids,
    myBidder,
    lastFeedback,
    submitting,
    nextMinBid,
    refresh,
    submitBid,
  }
})
