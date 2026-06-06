<script setup lang="ts">
import { computed } from 'vue'
import type { ApiMessage } from '@/services/api'
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'

const props = defineProps<{ message: ApiMessage }>()
const isUser = computed(() => props.message.sender === 'user')
const formattedTime = computed(() =>
  new Date(props.message.createdAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
)
</script>

<template>
  <div class="flex items-end gap-2" :class="isUser ? 'justify-end' : 'justify-start'">

    <div v-if="!isUser"
         class="flex-shrink-0 w-7 h-7 rounded-xl overflow-hidden"
         style="background:#0f0520;"
         aria-hidden="true">
      <DotLottieVue
        src="/cosmos.json"
        autoplay
        loop
        style="width:28px;height:28px;pointer-events:none;"
      />
    </div>

    <div class="flex flex-col gap-0.5 max-w-[78%]"
         :class="isUser ? 'items-end' : 'items-start'">
      <div
        class="px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm"
        :class="isUser ? 'rounded-br-sm' : 'rounded-bl-sm'"
        :style="isUser
          ? 'background: linear-gradient(135deg,#7c3aed 0%,#8b5cf6 100%); color:#fff; box-shadow:0 2px 12px rgba(124,58,237,0.25);'
          : 'background: rgba(255,255,255,0.80); border: 1px solid rgba(167,139,250,0.2); color:#374151;'"
      >
        <p class="whitespace-pre-wrap break-words">{{ message.text }}</p>
      </div>
      <span class="text-[10px] text-slate-400 px-1 select-none">{{ formattedTime }}</span>
    </div>

    <div v-if="isUser"
         class="flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center"
         style="background: #ede9fe;"
         aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-violet-500"
           viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
      </svg>
    </div>

  </div>
</template>
