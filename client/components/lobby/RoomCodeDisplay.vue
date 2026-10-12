<template>
  <div class="bg-[#121414] border border-[#303333] p-6 text-center rounded-sm relative overflow-hidden">
    <div class="text-xs uppercase tracking-widest text-[#969895] font-mono mb-2">
      ROOM ACCESS CODE
    </div>

    <div class="text-4xl md:text-5xl font-mono font-bold tracking-[0.25em] text-[#E9E7E2] select-all my-3 text-red-500/90 drop-shadow-[0_0_12px_rgba(167,25,34,0.4)]">
      {{ roomCode }}
    </div>

    <p class="text-xs text-[#969895] mb-4">
      Share this code with your opponent. The match will begin immediately when they enter.
    </p>

    <div class="flex items-center justify-center gap-3">
      <AppButton
        variant="secondary"
        size="sm"
        @click="copyCode"
      >
        <span v-if="copied" class="text-emerald-400 font-mono">COPIED TO CLIPBOARD</span>
        <span v-else class="font-mono">COPY CODE</span>
      </AppButton>
    </div>

    <div class="mt-6 pt-4 border-t border-[#303333]/50 flex items-center justify-center gap-2 text-xs text-[#969895] font-mono">
      <span class="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
      <span>WAITING FOR OPPONENT TO CONNECT...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppButton from '../ui/AppButton.vue';

const props = defineProps<{
  roomCode: string;
}>();

const copied = ref(false);

async function copyCode() {
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

