<template>
  <div class="bg-[#121414] border border-[#303333] p-5 rounded-sm flex flex-col items-center justify-center relative overflow-hidden">
    <!-- Round number -->
    <div class="text-[11px] font-mono tracking-widest text-[#969895] uppercase mb-1">
      CHAMBER STATUS • ROUND {{ roundNumber }}
    </div>

    <div class="text-xs font-mono text-[#E9E7E2] mb-4">
      <span class="text-red-500 font-bold text-lg">{{ shellsRemaining }}</span>
      <span class="text-[#969895]"> / {{ totalRoundShells }} SHELLS REMAINING</span>
    </div>

    <!-- 6 Visual Shell Slots on the Table -->
    <div class="flex items-center gap-3 my-2">
      <div
        v-for="index in totalRoundShells"
        :key="index"
        class="flex flex-col items-center"
      >
        <!-- Shell casing graphic -->
        <div
          :class="[
            'w-6 h-12 rounded-t-sm border transition-all duration-300 relative flex items-center justify-center',
            index <= shellsRemaining
              ? 'bg-gradient-to-b from-[#A71922] via-[#85131a] to-[#3a080c] border-red-700 shadow-md shadow-red-950/40'
              : 'bg-[#181a1a] border-[#2c2f2f] opacity-25',
          ]"
        >
          <!-- Brass rim bottom -->
          <div
            :class="[
              'absolute bottom-0 w-full h-3 border-t',
              index <= shellsRemaining
                ? 'bg-amber-700/80 border-amber-600'
                : 'bg-zinc-800 border-zinc-700',
            ]"
          ></div>
        </div>
        <span class="text-[9px] font-mono text-[#969895] mt-1">#{{ index }}</span>
      </div>
    </div>

    <!-- Magnifier Private Reveal Banner -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="revealedShell"
        class="mt-4 w-full p-3 bg-red-950/40 border border-red-600/80 rounded flex items-center justify-between shadow-lg shadow-red-950/50"
      >
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-amber-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <div class="text-left font-mono">
            <div class="text-[10px] text-amber-300 tracking-wider">MAGNIFIER SCAN RESULT</div>
            <div
              :class="[
                'text-sm font-bold tracking-widest uppercase',
                revealedShell === 'live' ? 'text-red-400' : 'text-cyan-300',
              ]"
            >
              NEXT SHELL: {{ revealedShell }}
            </div>
          </div>
        </div>
        <button
          class="text-xs font-mono text-[#969895] hover:text-white px-2 py-1 rounded bg-black/40 hover:bg-black/60"
          @click="$emit('dismiss-reveal')"
        >
          DISMISS
        </button>
      </div>
    </Transition>

    <!-- Shot animation result flash -->
    <div
      v-if="shotAnimation === 'firing_live'"
      class="absolute inset-0 bg-red-600/30 flex items-center justify-center animate-pulse pointer-events-none"
    >
      <span class="text-3xl font-black font-mono tracking-widest text-red-100 drop-shadow-[0_0_20px_rgba(255,0,0,1)]">
        LIVE SHELL HIT!
      </span>
    </div>
    <div
      v-else-if="shotAnimation === 'firing_blank'"
      class="absolute inset-0 bg-cyan-900/30 flex items-center justify-center animate-pulse pointer-events-none"
    >
      <span class="text-2xl font-black font-mono tracking-widest text-cyan-200 drop-shadow-[0_0_20px_rgba(0,200,255,1)]">
        *CLICK* BLANK!
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ShellType } from '../../types/game';

defineProps<{
  roundNumber: number;
  shellsRemaining: number;
  totalRoundShells: number;
  revealedShell: ShellType | null;
  shotAnimation: 'idle' | 'aiming' | 'firing_live' | 'firing_blank';
}>();

defineEmits<{
  (e: 'dismiss-reveal'): void;
}>();
</script>

