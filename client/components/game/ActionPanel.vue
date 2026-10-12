<template>
  <div class="bg-[#121414] border border-[#303333] p-4 md:p-6 rounded-sm shadow-xl">
    <div class="flex items-center justify-between mb-4">
      <div class="text-xs font-mono tracking-widest text-[#969895] uppercase">
        TACTICAL DISCHARGE
      </div>
      <div v-if="isMyTurn" class="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
        AUTHORIZED
      </div>
      <div v-else class="text-xs font-mono text-red-500 flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-red-500"></span>
        LOCKED — OPPONENT'S TURN
      </div>
    </div>

    <!-- Shoot Controls -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Shoot Yourself -->
      <button
        type="button"
        :disabled="!isMyTurn || actionPending || disabled"
        :class="[
          'relative p-4 md:p-5 rounded border text-left transition-all duration-200 select-none group',
          isMyTurn && !actionPending && !disabled
            ? 'bg-[#181a1a] hover:bg-[#202424] border-[#404444] hover:border-amber-600/70 cursor-pointer active:scale-[0.98]'
            : 'bg-[#0f1010] border-[#222424] opacity-50 cursor-not-allowed',
        ]"
        @click="$emit('shoot', 'self')"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-mono px-2 py-0.5 rounded bg-amber-950/70 border border-amber-800 text-amber-200 font-bold">
            HIGH RISK
          </span>
          <svg class="w-5 h-5 text-amber-500/70 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div class="text-base md:text-lg font-bold uppercase tracking-wider text-[#E9E7E2] group-hover:text-amber-100">
          SHOOT YOURSELF
        </div>
        <div class="text-xs text-[#969895] mt-1">
          If <span class="text-cyan-400 font-semibold">BLANK</span>, you keep your turn. If <span class="text-red-400 font-semibold">LIVE</span>, you take 1 DMG.
        </div>
      </button>

      <!-- Shoot Opponent -->
      <button
        type="button"
        :disabled="!isMyTurn || actionPending || disabled"
        :class="[
          'relative p-4 md:p-5 rounded border text-left transition-all duration-200 select-none group',
          isMyTurn && !actionPending && !disabled
            ? 'bg-gradient-to-br from-[#85131a]/30 to-[#181a1a] hover:from-[#A71922]/50 hover:to-[#222626] border-red-900/60 hover:border-red-600 cursor-pointer shadow-lg shadow-red-950/20 active:scale-[0.98]'
            : 'bg-[#0f1010] border-[#222424] opacity-50 cursor-not-allowed',
        ]"
        @click="$emit('shoot', 'opponent')"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-mono px-2 py-0.5 rounded bg-red-950/90 border border-red-700 text-red-100 font-bold">
            OFFENSIVE
          </span>
          <svg class="w-5 h-5 text-red-500/80 group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div class="text-base md:text-lg font-bold uppercase tracking-wider text-[#E9E7E2] group-hover:text-white">
          SHOOT OPPONENT
        </div>
        <div class="text-xs text-[#969895] mt-1">
          If <span class="text-red-400 font-semibold">LIVE</span>, deals 1 DMG and passes turn. If <span class="text-cyan-400 font-semibold">BLANK</span>, passes turn.
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ShootTarget } from '../../types/game';

defineProps<{
  isMyTurn: boolean;
  actionPending: boolean;
  disabled?: boolean;
}>();

defineEmits<{
  (e: 'shoot', target: ShootTarget): void;
}>();
</script>

