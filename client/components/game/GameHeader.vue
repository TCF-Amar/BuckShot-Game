<template>
  <header class="w-full bg-[#0d0e0e] border-b border-[#303333] px-2.5 sm:px-6 py-1.5 sm:py-2 flex items-center justify-between select-none flex-shrink-0">
    <!-- Brand Title -->
    <div class="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
      <div class="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#A71922] shadow-[0_0_8px_rgba(167,25,34,0.8)] flex-shrink-0"></div>
      <div class="flex-shrink-0">
        <NuxtLink to="/" class="text-xs sm:text-base md:text-lg font-black tracking-wider uppercase text-[#E9E7E2] hover:text-red-500 transition-colors whitespace-nowrap">
          DEAD SIGNAL
        </NuxtLink>
        <span class="text-[9px] font-mono text-[#969895] block -mt-1 hidden sm:block">
          CHAMBER PROTOCOL v1.0
        </span>
      </div>
    </div>

    <!-- Center Room Code if present -->
    <div v-if="roomCode" class="flex items-center gap-1.5 sm:gap-2">
      <div class="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 bg-[#121414] border border-[#303333] rounded">
        <span class="text-[9px] font-mono text-[#969895] hidden md:inline">ROOM</span>
        <span class="text-xs sm:text-sm font-mono font-bold tracking-widest text-[#E9E7E2]">
          {{ roomCode }}
        </span>
        <button
          type="button"
          class="text-xs text-[#969895] hover:text-white transition-colors ml-0.5"
          title="Copy Room Code"
          @click="copyCode"
        >
          <span v-if="copied" class="text-emerald-400 text-[9px] font-mono">COPIED</span>
          <svg v-else class="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Right Controls -->
    <div class="flex items-center gap-1.5 sm:gap-3">
      <!-- Connection indicator -->
      <ConnectionStatus :status="connectionStatus" />

      <!-- Audio Mute Toggle -->
      <button
        type="button"
        :class="[
          'p-1.5 sm:p-2 rounded border transition-colors',
          isMuted
            ? 'bg-[#181a1a] border-[#303333] text-[#969895]'
            : 'bg-[#1b1e1e] border-red-900/60 text-red-400 hover:text-red-300',
        ]"
        :title="isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'"
        @click="$emit('toggle-mute')"
      >
        <svg v-if="isMuted" class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        </svg>
        <svg v-else class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      </button>

      <!-- Leave Room Button -->
      <button
        v-if="roomCode"
        type="button"
        class="text-[10px] sm:text-xs font-mono text-[#969895] hover:text-red-400 border border-[#303333] hover:border-red-800 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded bg-[#121414] transition-colors"
        @click="$emit('leave')"
      >
        LEAVE
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ConnectionStatus from './ConnectionStatus.vue';

const props = defineProps<{
  roomCode?: string;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  isMuted: boolean;
}>();

defineEmits<{
  (e: 'toggle-mute'): void;
  (e: 'leave'): void;
}>();

const copied = ref(false);

async function copyCode() {
  if (!props.roomCode) return;
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(props.roomCode);
      copied.value = true;
      setTimeout(() => {
        copied.value = false;
      }, 2000);
    } catch {}
  }
}
</script>

