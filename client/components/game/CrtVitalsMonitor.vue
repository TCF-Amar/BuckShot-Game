<template>
  <div class="crt-screen border border-[#272a2a] p-1.5 sm:p-2.5 rounded shadow-2xl relative select-none">
    <!-- CRT Top Header -->
    <div class="flex items-center justify-between pb-1 mb-1 border-b border-emerald-950/70 text-[9px] sm:text-[10px] font-mono">
      <div class="flex items-center gap-1 truncate max-w-[120px] sm:max-w-none">
        <span
          :class="[
            'w-1.5 h-1.5 rounded-full animate-ping flex-shrink-0',
            player.connected ? (isLocal ? 'bg-emerald-400' : 'bg-red-400') : 'bg-amber-400',
          ]"
        ></span>
        <span :class="isLocal ? 'phosphor-green' : 'phosphor-red'" class="font-bold tracking-wider uppercase truncate">
          {{ player.name }} {{ isLocal ? '[YOU]' : '' }}
        </span>
      </div>

      <!-- Turn status -->
      <span
        v-if="isTurn"
        class="text-[8px] sm:text-[9px] font-bold px-1 py-0.2 rounded bg-red-950/80 border border-red-700/80 text-red-300 animate-pulse flex-shrink-0"
      >
        ACTIVE
      </span>
      <span v-else class="text-[8px] sm:text-[9px] text-zinc-500 font-mono flex-shrink-0">
        STANDBY
      </span>
    </div>

    <!-- ECG Waveform & Heart Rate Display -->
    <div class="flex items-center justify-between my-0.5">
      <div class="flex items-baseline gap-0.5 sm:gap-1">
        <span
          :class="[
            'text-lg sm:text-2xl font-black font-mono tracking-tight',
            player.health <= 1 ? 'phosphor-red animate-pulse' : isLocal ? 'phosphor-green' : 'phosphor-red',
          ]"
        >
          {{ currentBpm }}
        </span>
        <span class="text-[8px] sm:text-[9px] font-mono text-zinc-500 uppercase">BPM</span>
      </div>

      <!-- 4 Battery Defibrillator Health Cells -->
      <div class="flex items-center gap-1">
        <div
          v-for="index in 4"
          :key="index"
          :class="[
            'w-3 sm:w-4 h-4 sm:h-5 rounded-[2px] border transition-all duration-300 flex flex-col justify-end p-0.5',
            index <= player.health
              ? player.health <= 1
                ? 'bg-red-600/90 border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                : isLocal
                ? 'bg-emerald-500/90 border-emerald-300 shadow-[0_0_6px_rgba(52,211,153,0.6)]'
                : 'bg-red-700/90 border-red-400 shadow-[0_0_6px_rgba(239,68,68,0.5)]'
              : 'bg-[#08120c] border-[#182a20] opacity-30',
          ]"
        >
          <div
            v-if="index <= player.health"
            class="w-full h-0.5 bg-white/70 rounded-[1px] mb-0.5"
          ></div>
        </div>
      </div>
    </div>

    <!-- Animated ECG Pulse Line Canvas / SVG -->
    <div class="w-full h-4 sm:h-6 overflow-hidden relative opacity-85 my-0.5">
      <svg class="w-full h-full" viewBox="0 0 300 40" preserveAspectRatio="none">
        <line x1="0" y1="20" x2="300" y2="20" stroke="#0e2a1d" stroke-width="0.5" stroke-dasharray="2,2" />
        <path
          d="M0,20 L40,20 L48,10 L54,30 L60,5 L66,28 L72,20 L140,20 L148,10 L154,30 L160,5 L166,28 L172,20 L240,20 L248,10 L254,30 L260,5 L266,28 L272,20 L300,20"
          fill="none"
          :stroke="player.health <= 1 ? '#ef4444' : isLocal ? '#34d399' : '#f87171'"
          stroke-width="1.8"
          stroke-linecap="round"
          class="animate-ecg"
        />
      </svg>
    </div>

    <!-- Bottom Status -->
    <div class="flex items-center justify-between pt-0.5 border-t border-emerald-950/50 text-[8px] sm:text-[9px] font-mono">
      <div v-if="player.skippedTurnsPending > 0" class="text-amber-400 font-bold animate-pulse truncate">
        ⛓️ CUFFED
      </div>
      <div v-else class="text-zinc-600 truncate">
        STABLE
      </div>

      <div class="text-zinc-500 flex-shrink-0">
        ITEMS: {{ availableItemsCount }}/4
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PublicPlayerState } from '../../types/game';

const props = defineProps<{
  player: PublicPlayerState;
  isLocal: boolean;
  isTurn: boolean;
}>();

const currentBpm = computed(() => {
  if (props.player.health <= 0) return 0;
  if (props.player.health === 1) return 142;
  if (props.player.health === 2) return 108;
  if (props.player.health === 3) return 86;
  return 72;
});

const availableItemsCount = computed(() => {
  return (
    (props.player.inventory.magnifier || 0) +
    (props.player.inventory.cuffs || 0) +
    (props.player.inventory.medkit || 0) +
    (props.player.inventory.blade || 0)
  );
});
</script>

<style scoped>
@keyframes ecgScroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-100px); }
}

.animate-ecg {
  animation: ecgScroll 1.6s linear infinite;
}
</style>
