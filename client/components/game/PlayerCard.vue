<template>
  <div
    :class="[
      'bg-[#121414] border p-4 md:p-5 rounded-sm transition-all duration-300 relative overflow-hidden',
      isTurn
        ? 'border-red-600 shadow-lg shadow-red-950/30'
        : 'border-[#303333]',
      isLocal ? 'ring-1 ring-white/10' : '',
    ]"
  >
    <!-- Top status bar -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <span
          :class="[
            'w-2 h-2 rounded-full',
            player.connected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse',
          ]"
        ></span>
        <span class="font-bold tracking-wider uppercase text-sm md:text-base text-[#E9E7E2]">
          {{ player.name }}
        </span>
        <span
          v-if="isLocal"
          class="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 bg-red-950/80 border border-red-700 text-red-200 rounded"
        >
          YOU
        </span>
      </div>

      <!-- Turn badge -->
      <span
        v-if="isTurn"
        class="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-red-600 text-white animate-pulse rounded"
      >
        ACTIVE TURN
      </span>
      <span
        v-else
        class="text-[10px] font-mono text-[#969895]"
      >
        AWAITING
      </span>
    </div>

    <!-- Health display -->
    <HealthBar
      :health="player.health"
      :max-health="player.maxHealth"
      :is-local="isLocal"
      class="mb-4"
    />

    <!-- Status modifiers (Handcuffs, etc.) -->
    <div class="flex items-center justify-between pt-2 border-t border-[#303333]/50 text-xs font-mono">
      <div class="flex items-center gap-2">
        <span v-if="player.skippedTurnsPending > 0" class="text-amber-400 flex items-center gap-1">
          <svg class="w-3.5 h-3.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          CUFFED (NEXT TURN SKIPPED)
        </span>
        <span v-else class="text-[#969895]/60">NO STATUS EFFECTS</span>
      </div>

      <div class="text-[#969895]">
        ITEMS: {{ availableItemsCount }}/3
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PublicPlayerState } from '../../types/game';
import HealthBar from './HealthBar.vue';

const props = defineProps<{
  player: PublicPlayerState;
  isLocal: boolean;
  isTurn: boolean;
}>();

const availableItemsCount = computed(() => {
  return (
    props.player.inventory.magnifier +
    props.player.inventory.cuffs +
    props.player.inventory.medkit
  );
});
</script>

