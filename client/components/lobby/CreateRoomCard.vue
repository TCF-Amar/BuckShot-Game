<template>
  <div class="bg-[#0e1011] border border-[#2b2f30] p-6 rounded-md shadow-2xl flex flex-col justify-between relative overflow-hidden group hover:border-[#404648] transition-colors">
    <!-- Corner Tech Decals -->
    <div class="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-red-600"></div>
    <div class="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-red-600"></div>
    <div class="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-red-600"></div>
    <div class="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-red-600"></div>

    <div>
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 bg-[#A71922] rounded-full shadow-[0_0_8px_rgba(167,25,34,0.8)]"></span>
          <h2 class="text-base font-black uppercase tracking-wider text-[#E9E7E2]">
            HOST CHAMBER
          </h2>
        </div>
        <span class="text-[9px] font-mono text-zinc-500 uppercase">SYS://LOBBY_01</span>
      </div>

      <p class="text-xs text-[#8b8e8b] mb-5 font-mono leading-relaxed">
        Initialize an authoritative private chamber and generate a secure 6-digit access code for an opponent.
      </p>

      <form @submit.prevent="handleCreate" class="space-y-4">
        <AppInput
          v-model="playerName"
          label="OPERATIVE IDENTIFIER"
          placeholder="e.g. SURVIVOR_01"
          maxlength="20"
          :error="nameError"
          @enter="handleCreate"
        />

        <div v-if="error" class="text-xs text-red-400 font-mono p-2.5 bg-red-950/40 border border-red-800 rounded">
          ⚠️ {{ error }}
        </div>

        <AppButton
          type="submit"
          variant="primary"
          class="w-full mt-2"
          :loading="loading"
          :disabled="!playerName.trim()"
        >
          INITIALIZE PRIVATE CHAMBER
        </AppButton>
      </form>
    </div>

    <div class="mt-6 pt-3 border-t border-[#222526] text-[10px] text-zinc-500 font-mono flex items-center justify-between">
      <span>6 SHELLS • 4 HP • 3 ITEMS</span>
      <span class="text-emerald-500/80">READY</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppInput from '../ui/AppInput.vue';
import AppButton from '../ui/AppButton.vue';

const props = defineProps<{
  loading?: boolean;
  error?: string | null;
}>();

const emit = defineEmits<{
  (e: 'create', name: string): void;
}>();

const playerName = ref('');
const nameError = ref('');

function handleCreate() {
  const trimmed = playerName.value.trim();
  if (!trimmed) {
    nameError.value = 'Call-sign cannot be empty';
    return;
  }
  if (trimmed.length > 20) {
    nameError.value = 'Call-sign must be 20 characters or fewer';
    return;
  }
  nameError.value = '';
  emit('create', trimmed);
}
</script>
