<template>
  <div class="bg-[#121414] border border-[#303333] p-4 md:p-6 rounded-sm shadow-xl">
    <div class="flex items-center justify-between mb-4">
      <div class="text-xs font-mono tracking-widest text-[#969895] uppercase">
        TACTICAL INVENTORY (REFRESHES EACH ROUND)
      </div>
      <div class="text-[11px] font-mono text-[#969895]">
        1 USE PER ROUND EACH
      </div>
    </div>

    <!-- 4 Strategic Items Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <!-- Item 1: Magnifier -->
      <button
        type="button"
        :disabled="!canUseMagnifier"
        :class="[
          'p-3.5 rounded border text-left transition-all duration-200 select-none flex flex-col justify-between',
          canUseMagnifier
            ? 'bg-[#181a1a] hover:bg-[#222626] border-[#404444] hover:border-amber-500/70 cursor-pointer active:scale-95'
            : 'bg-[#0f1010] border-[#222424] opacity-40 cursor-not-allowed',
        ]"
        @click="$emit('use-item', 'magnifier')"
      >
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-xs font-bold uppercase tracking-wider text-[#E9E7E2]">
              MAGNIFIER
            </span>
            <span
              :class="[
                'text-[10px] font-mono px-1.5 py-0.2 rounded border',
                inventory.magnifier > 0
                  ? 'bg-amber-950/60 border-amber-700 text-amber-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500',
              ]"
            >
              {{ inventory.magnifier > 0 ? 'READY' : 'EXHAUSTED' }}
            </span>
          </div>
          <p class="text-xs text-[#969895] leading-relaxed">
            Inspect the current chamber. Reveals the next shell type secretly to you.
          </p>
        </div>
        <div v-if="!canUseMagnifier" class="text-[10px] font-mono text-zinc-500 mt-2">
          {{ magnifierDisabledReason }}
        </div>
      </button>

      <!-- Item 2: Handcuffs -->
      <button
        type="button"
        :disabled="!canUseCuffs"
        :class="[
          'p-3.5 rounded border text-left transition-all duration-200 select-none flex flex-col justify-between',
          canUseCuffs
            ? 'bg-[#181a1a] hover:bg-[#222626] border-[#404444] hover:border-cyan-500/70 cursor-pointer active:scale-95'
            : 'bg-[#0f1010] border-[#222424] opacity-40 cursor-not-allowed',
        ]"
        @click="$emit('use-item', 'cuffs')"
      >
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-xs font-bold uppercase tracking-wider text-[#E9E7E2]">
              HANDCUFFS
            </span>
            <span
              :class="[
                'text-[10px] font-mono px-1.5 py-0.2 rounded border',
                inventory.cuffs > 0
                  ? 'bg-cyan-950/60 border-cyan-700 text-cyan-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500',
              ]"
            >
              {{ inventory.cuffs > 0 ? 'READY' : 'EXHAUSTED' }}
            </span>
          </div>
          <p class="text-xs text-[#969895] leading-relaxed">
            Restrain opponent. Skips their next turn when turn passes to them.
          </p>
        </div>
        <div v-if="!canUseCuffs" class="text-[10px] font-mono text-zinc-500 mt-2">
          {{ cuffsDisabledReason }}
        </div>
      </button>

      <!-- Item 3: Medkit -->
      <button
        type="button"
        :disabled="!canUseMedkit"
        :class="[
          'p-3.5 rounded border text-left transition-all duration-200 select-none flex flex-col justify-between',
          canUseMedkit
            ? 'bg-[#181a1a] hover:bg-[#222626] border-[#404444] hover:border-emerald-500/70 cursor-pointer active:scale-95'
            : 'bg-[#0f1010] border-[#222424] opacity-40 cursor-not-allowed',
        ]"
        @click="$emit('use-item', 'medkit')"
      >
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-xs font-bold uppercase tracking-wider text-[#E9E7E2]">
              MEDKIT
            </span>
            <span
              :class="[
                'text-[10px] font-mono px-1.5 py-0.2 rounded border',
                inventory.medkit > 0
                  ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500',
              ]"
            >
              {{ inventory.medkit > 0 ? 'READY' : 'EXHAUSTED' }}
            </span>
          </div>
          <p class="text-xs text-[#969895] leading-relaxed">
            Emergency injection. Restores 1 health (capped at 4 maximum HP).
          </p>
        </div>
        <div v-if="!canUseMedkit" class="text-[10px] font-mono text-zinc-500 mt-2">
          {{ medkitDisabledReason }}
        </div>
      </button>

      <!-- Item 4: Blade (Handsaw) -->
      <button
        type="button"
        :disabled="!canUseBlade"
        :class="[
          'p-3.5 rounded border text-left transition-all duration-200 select-none flex flex-col justify-between',
          canUseBlade
            ? 'bg-[#1a0f12] hover:bg-[#281318] border-red-900/60 hover:border-red-500/80 cursor-pointer active:scale-95'
            : 'bg-[#0f1010] border-[#222424] opacity-40 cursor-not-allowed',
        ]"
        @click="$emit('use-item', 'blade')"
      >
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-xs font-bold uppercase tracking-wider text-red-200">
              BLADE (SAW)
            </span>
            <span
              :class="[
                'text-[10px] font-mono px-1.5 py-0.2 rounded border',
                inventory.blade > 0
                  ? 'bg-red-950/80 border-red-600 text-red-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500',
              ]"
            >
              {{ inventory.blade > 0 ? 'READY' : 'EXHAUSTED' }}
            </span>
          </div>
          <p class="text-xs text-[#969895] leading-relaxed">
            Saw off the shotgun barrel! Deals <strong class="text-red-400">DOUBLE DAMAGE (2 HP)</strong> on the next live shot!
          </p>
        </div>
        <div v-if="!canUseBlade" class="text-[10px] font-mono text-zinc-500 mt-2">
          {{ bladeDisabledReason }}
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PlayerInventory, ItemType } from '../../types/game';

const props = defineProps<{
  inventory: PlayerInventory;
  health: number;
  maxHealth: number;
  isMyTurn: boolean;
  actionPending: boolean;
  disabled?: boolean;
}>();

defineEmits<{
  (e: 'use-item', item: ItemType): void;
}>();

const canUseMagnifier = computed(() => {
  return (
    props.isMyTurn &&
    !props.actionPending &&
    !props.disabled &&
    props.inventory.magnifier > 0
  );
});

const magnifierDisabledReason = computed(() => {
  if (props.inventory.magnifier <= 0) return 'Already used this round';
  if (!props.isMyTurn) return 'Available only on your turn';
  return 'Unavailable';
});

const canUseCuffs = computed(() => {
  return (
    props.isMyTurn &&
    !props.actionPending &&
    !props.disabled &&
    props.inventory.cuffs > 0
  );
});

const cuffsDisabledReason = computed(() => {
  if (props.inventory.cuffs <= 0) return 'Already used this round';
  if (!props.isMyTurn) return 'Available only on your turn';
  return 'Unavailable';
});

const canUseMedkit = computed(() => {
  return (
    props.isMyTurn &&
    !props.actionPending &&
    !props.disabled &&
    props.inventory.medkit > 0 &&
    props.health < props.maxHealth
  );
});

const medkitDisabledReason = computed(() => {
  if (props.health >= props.maxHealth) return 'Health is already full (4/4)';
  if (props.inventory.medkit <= 0) return 'Already used this round';
  if (!props.isMyTurn) return 'Available only on your turn';
  return 'Unavailable';
});

const canUseBlade = computed(() => {
  return (
    props.isMyTurn &&
    !props.actionPending &&
    !props.disabled &&
    props.inventory.blade > 0
  );
});

const bladeDisabledReason = computed(() => {
  if (props.inventory.blade <= 0) return 'Already used this round';
  if (!props.isMyTurn) return 'Available only on your turn';
  return 'Unavailable';
});
</script>
