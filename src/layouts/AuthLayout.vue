<template>
  <div class="min-h-screen relative overflow-hidden bg-hc-navy">
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-teal-600/12 blur-3xl" />
      <div class="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-cyan-500/8 blur-3xl" />
      <div class="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-amber-700/8 blur-3xl" />
      <svg class="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#14b8a6" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
    <GlobalStickyBanner />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import GlobalStickyBanner from '@/components/common/GlobalStickyBanner.vue'
</script>
