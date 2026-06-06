<script setup lang="ts">
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'
</script>

<template>
  <div class="flex items-end gap-2 justify-start">
    <div class="flex-shrink-0 w-7 h-7 rounded-xl overflow-hidden"
         style="background:#0f0520;"
         aria-hidden="true">
      <DotLottieVue
        src="/cosmos.json"
        autoplay
        loop
        style="width:28px;height:28px;pointer-events:none;"
      />
    </div>

    <div class="rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm"
         style="background: rgba(255,255,255,0.80); border: 1px solid rgba(167,139,250,0.2);"
         role="status" aria-live="polite" aria-label="Agent is typing">
      <div class="flex items-center gap-2.5">
        <span class="text-xs text-slate-500 select-none">Agent is typing…</span>
        <div class="flex items-center gap-1" aria-hidden="true">
          <span class="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce-dot" style="animation-delay:0ms"/>
          <span class="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce-dot" style="animation-delay:160ms"/>
          <span class="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce-dot" style="animation-delay:320ms"/>
        </div>
      </div>
    </div>
  </div>
</template>
