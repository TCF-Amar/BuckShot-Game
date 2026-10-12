<template>
  <AppModal
    :is-open="isOpen"
    :dismissible="false"
  >
    <div class="text-center py-4">
      <!-- Outcome Banner -->
      <div
        :class="[
          'text-4xl md:text-5xl font-black uppercase tracking-[0.2em] mb-2 drop-shadow-lg',
          isWinner ? 'text-red-500 shadow-red-500/50' : 'text-zinc-500',
        ]"
      >
        {{ isWinner ? 'VICTORY' : 'TERMINATED' }}
      </div>

      <div class="text-xs font-mono text-[#969895] uppercase tracking-widest mb-6">
        {{ isWinner ? 'YOU SURVIVED THE CHAMBER' : 'YOUR SIGNAL HAS FLATLINED' }}
      </div>

      <!-- Match Winner Details -->
      <div class="bg-[#0b0c0c] border border-[#252828] p-4 rounded mb-6 text-left font-mono text-xs">
        <div class="flex justify-between py-1 border-b border-[#1f2222]">
          <span class="text-[#969895]">WINNER:</span>
          <span class="text-[#E9E7E2] font-bold">{{ winnerName }}</span>
        </div>
        <div class="flex justify-between py-1 border-b border-[#1f2222]">
          <span class="text-[#969895]">SURVIVING HEALTH:</span>
          <span class="text-red-400 font-bold">{{ winnerHealth }}/4 HP</span>
        </div>
        <div class="flex justify-between py-1">
          <span class="text-[#969895]">ROUNDS SURVIVED:</span>
          <span class="text-[#E9E7E2]">{{ roundNumber }}</span>
        </div>
      </div>

      <!-- Rematch status -->
      <div v-if="rematchRequestedByMe" class="mb-4 text-xs font-mono text-amber-400 flex items-center justify-center gap-2">
        <span class="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
        REMATCH REQUESTED. AWAITING OPPONENT'S CONFIRMATION...
      </div>
    </div>

    <template #actions>
      <AppButton
        variant="ghost"
        size="md"
        @click="$emit('leave')"
      >
        EXIT TO LOBBY
      </AppButton>

      <AppButton
        variant="primary"
        size="md"
        :loading="rematchRequestedByMe"
        :disabled="rematchRequestedByMe"
        @click="$emit('rematch')"
      >
        {{ rematchRequestedByMe ? 'WAITING FOR OPPONENT' : 'REQUEST REMATCH' }}
      </AppButton>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import AppModal from '../ui/AppModal.vue';
import AppButton from '../ui/AppButton.vue';

defineProps<{
  isOpen: boolean;
  isWinner: boolean;
  winnerName: string;
  winnerHealth: number;
  roundNumber: number;
  rematchRequestedByMe: boolean;
}>();

defineEmits<{
  (e: 'rematch'): void;
  (e: 'leave'): void;
}>();
</script>

