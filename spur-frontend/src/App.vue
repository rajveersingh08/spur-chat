<script setup lang="ts">
import { ref, nextTick, watch, onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useAutoAnimate } from '@formkit/auto-animate/vue'
import MessageBubble from '@/components/MessageBubble.vue'
import TypingIndicator from '@/components/TypingIndicator.vue'
import gsap from 'gsap'
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'

const store = useChatStore()
const [messageListRef] = useAutoAnimate({ duration: 220, easing: 'ease-out' })

const welcomeRef     = ref<HTMLElement | null>(null)
const chatRef        = ref<HTMLElement | null>(null)
const cardRef        = ref<HTMLElement | null>(null)
const messagesContainer = ref<HTMLElement | null>(null)
const inputRef       = ref<HTMLTextAreaElement | null>(null)

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value)
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  })
}

async function startChat() {
  if (!welcomeRef.value || !cardRef.value) { store.enterChat(); return }

  await gsap.to(welcomeRef.value, {
    opacity: 0, scale: 0.95, y: -10, duration: 0.3, ease: 'power2.in',
  })

  store.enterChat()
  await nextTick()

  gsap.fromTo(cardRef.value,
    { scaleY: 0.98 },
    { scaleY: 1, duration: 0.35, ease: 'power2.out' }
  )

  if (chatRef.value) {
    gsap.fromTo(chatRef.value,
      { opacity: 0, y: 14, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power3.out', delay: 0.04 }
    )
  }

  scrollToBottom()
  await nextTick()
  inputRef.value?.focus()
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    if (store.canSubmit) store.submit().then(scrollToBottom)
  }
}

watch(() => store.messages.length, scrollToBottom)
watch(() => store.isTyping, scrollToBottom)

onMounted(async () => {
  await store.hydrateHistory()
  if (store.mode === 'chat') {
    scrollToBottom()
    await nextTick()
    inputRef.value?.focus()
  }
})
</script>

<template>
  <div class="relative w-screen h-screen overflow-hidden flex items-center justify-center"
       style="background: linear-gradient(135deg, #f3f0ff 0%, #ede9fe 30%, #e0e7ff 60%, #f0f9ff 100%)">

    <div class="absolute inset-0 pointer-events-none" style="
      background:
        radial-gradient(ellipse 70% 60% at 10% 15%,  rgba(167,139,250,0.28) 0%, transparent 65%),
        radial-gradient(ellipse 55% 50% at 90% 25%,  rgba(147,197,253,0.25) 0%, transparent 60%),
        radial-gradient(ellipse 50% 55% at 25% 90%,  rgba(216,180,254,0.22) 0%, transparent 60%),
        radial-gradient(ellipse 55% 45% at 50% 50%,  rgba(255,255,255,0.50) 0%, transparent 70%);
    " />

    <div
      ref="cardRef"
      class="relative z-10 flex flex-col overflow-hidden transition-all duration-500"
      :class="store.mode === 'welcome'
        ? 'w-[460px] max-w-[92vw] rounded-[2.5rem]'
        : 'w-[500px] max-w-[95vw] h-[660px] max-h-[90vh] rounded-[1.75rem]'"
      style="
        background: rgba(255,255,255,0.68);
        backdrop-filter: blur(12px) saturate(1.5);
        -webkit-backdrop-filter: blur(12px) saturate(1.5);
        border: 1px solid rgba(255,255,255,0.80);
        box-shadow:
          0 2px 0 0 rgba(255,255,255,0.9) inset,
          0 8px 32px rgba(139,92,246,0.12),
          0 24px 64px rgba(109,40,217,0.10),
          0 1px 0 rgba(167,139,250,0.25);
      "
    >

      <div v-if="store.mode === 'welcome'"
           ref="welcomeRef"
           class="flex flex-col items-center px-10 py-12 gap-6">

        <DotLottieVue
          src="/cosmos.json"
          autoplay
          loop
          class="w-[140px] h-[140px]"
          style="margin-bottom: -8px"
        />

        <div class="text-center space-y-1.5">
          <h1 class="text-[1.85rem] font-bold text-slate-800 leading-tight tracking-tight">
            Welcome to Spur.
          </h1>
          <p class="text-base text-slate-500 font-normal">
            Your all-in-one automation partner.
          </p>
        </div>

        <div class="w-12 h-0.5 rounded-full bg-gradient-to-r from-violet-300 via-purple-400 to-indigo-300 opacity-60" />

        <div class="flex flex-wrap gap-2 justify-center">
          <span
            v-for="label in ['AI-Powered', 'Always Online', 'Instant Help', 'OpenAI']"
            :key="label"
            class="px-3.5 py-1 rounded-full text-xs font-medium text-violet-700 border border-violet-200 bg-violet-50"
          >{{ label }}</span>
        </div>

        <button
          @click="startChat"
          class="group relative mt-1 px-10 py-3.5 rounded-2xl font-semibold text-white text-[0.95rem] tracking-wide overflow-hidden
                 transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none"
          style="background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%);
                 box-shadow: 0 4px 24px rgba(124,58,237,0.38), 0 1px 0 rgba(255,255,255,0.2) inset;"
        >
          <span class="relative z-10 flex items-center gap-2">
            Start Chatting
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                 viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </span>
          <span class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                style="background: rgba(255,255,255,0.12)" />
        </button>

        <p class="text-[11px] text-slate-400 -mt-2">No sign-up needed · Powered by OpenAI</p>
      </div>

      <div v-else ref="chatRef" class="flex flex-col h-full" style="opacity:1">

        <header class="flex items-center justify-between px-5 py-3.5 flex-shrink-0 bg-white/40"
                style="border-bottom: 1px solid rgba(167,139,250,0.2)">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0"
                 style="background:#0f0520;">
              <DotLottieVue
                src="/cosmos.json"
                autoplay
                loop
                style="width:36px;height:36px;pointer-events:none;"
              />
            </div>
            <div>
              <p class="font-semibold text-slate-800 text-sm leading-none">Spur AI Assistant</p>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p class="text-[11px] text-slate-400">Always online</p>
              </div>
            </div>
          </div>
          <button
            @click="store.startNewChat"
            class="p-2 rounded-xl text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-all"
            title="New conversation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
        </header>

        <div ref="messagesContainer"
             class="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-white/20"
             role="log" aria-live="polite">

          <div v-if="store.isLoadingHistory" class="flex items-center justify-center h-full">
            <div class="flex flex-col items-center gap-2 text-slate-400">
              <svg class="w-6 h-6 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <span class="text-xs">Loading conversation…</span>
            </div>
          </div>

          <div v-else-if="!store.hasMessages"
               class="flex flex-col items-center justify-center h-full text-center gap-4 px-6">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center"
                 style="background: linear-gradient(135deg,#ede9fe,#ddd6fe);">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-violet-500"
                   viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
              </svg>
            </div>
            <div>
              <p class="font-semibold text-slate-700 text-sm">Hi there! I'm Aria 👋</p>
              <p class="text-slate-400 text-xs mt-1 leading-relaxed max-w-xs mx-auto">
                Your Spur Shop support assistant. Ask me anything!
              </p>
            </div>
            <div class="flex flex-wrap gap-2 justify-center">
              <button
                v-for="chip in ['Shipping times?', 'Return policy?', 'Track my order', 'Payment methods']"
                :key="chip"
                @click="() => { store.inputText = chip; store.submit().then(scrollToBottom) }"
                class="px-3 py-1.5 rounded-full text-xs font-medium text-violet-700
                       border border-violet-200 bg-white hover:bg-violet-50
                       hover:border-violet-400 transition-all shadow-sm"
              >{{ chip }}</button>
            </div>
          </div>

          <div v-else ref="messageListRef" class="space-y-3">
            <MessageBubble v-for="msg in store.messages" :key="msg.id" :message="msg"/>
          </div>

          <TypingIndicator v-if="store.isTyping"/>
        </div>

        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div v-if="store.errorMessage"
               class="flex items-center gap-2 px-4 py-2.5 text-xs text-red-600 flex-shrink-0 bg-red-50"
               style="border-top: 1px solid rgba(252,165,165,0.4)" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 flex-shrink-0"
                 viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 11a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
            </svg>
            <span class="flex-1">{{ store.errorMessage }}</span>
            <button @click="store.errorMessage = ''"
                    class="text-red-300 hover:text-red-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </Transition>

        <div class="flex-shrink-0 px-4 pb-4 pt-3 bg-white/30"
             style="border-top: 1px solid rgba(167,139,250,0.15)">
          <div
            class="flex items-end gap-2 px-4 py-3 rounded-2xl transition-all duration-200
                   focus-within:ring-2 focus-within:ring-violet-300/60"
            style="background: rgba(255,255,255,0.75);
                   border: 1px solid rgba(167,139,250,0.25);
                   box-shadow: 0 2px 12px rgba(139,92,246,0.08);"
          >
            <button class="flex-shrink-0 mb-0.5 text-slate-300 hover:text-violet-400 transition-colors" title="Attach file">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
            </button>

            <textarea
              ref="inputRef"
              v-model="store.inputText"
              @keydown="handleKeydown"
              :disabled="store.isTyping"
              rows="1"
              :maxlength="store.MAX_INPUT"
              placeholder="Hello Spur! What can I help you automate today?"
              class="flex-1 resize-none bg-transparent text-sm text-slate-700
                     placeholder-slate-300 border-none outline-none
                     leading-relaxed max-h-28 disabled:opacity-40 disabled:cursor-not-allowed"
              style="field-sizing: content"
              aria-label="Message input"
            />

            <button class="flex-shrink-0 mb-0.5 text-slate-300 hover:text-violet-400 transition-colors" title="Search">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>

            <button
              @click="store.submit().then(scrollToBottom)"
              :disabled="!store.canSubmit"
              class="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center
                     transition-all duration-200"
              :class="store.canSubmit
                ? 'text-white hover:scale-105 active:scale-95'
                : 'text-slate-300 cursor-not-allowed'"
              :style="store.canSubmit
                ? 'background: linear-gradient(135deg,#7c3aed,#8b5cf6); box-shadow: 0 2px 12px rgba(124,58,237,0.35);'
                : 'background: #f1f5f9;'"
              aria-label="Send message"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5"
                   viewBox="0 0 24 24" fill="currentColor">
                <path d="m2 21 21-9L2 3v7l15 2-15 2v7z"/>
              </svg>
            </button>
          </div>

          <div class="flex justify-between items-center mt-1.5 px-1">
            <p class="text-[10px] text-slate-400">
              Press <kbd class="font-mono">Enter</kbd> to send ·
              <kbd class="font-mono">Shift+Enter</kbd> for newline
            </p>
            <span class="text-[10px] transition-colors"
                  :class="store.inputTooLong ? 'text-red-400 font-medium' : 'text-slate-300'">
              {{ store.inputLength }}/{{ store.MAX_INPUT }}
            </span>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
