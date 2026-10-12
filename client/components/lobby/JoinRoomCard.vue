<template>
  <div class="bg-[#0e1011] border border-[#2b2f30] p-6 rounded-md shadow-2xl flex flex-col justify-between relative overflow-hidden group hover:border-[#404648] transition-colors">
    <!-- Corner Tech Decals -->
    <div class="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-zinc-600"></div>
    <div class="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-zinc-600"></div>
    <div class="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-zinc-600"></div>
    <div class="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-zinc-600"></div>

    <div>
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 bg-zinc-400 rounded-full"></span>
          <h2 class="text-base font-black uppercase tracking-wider text-[#E9E7E2]">
            ENTER CHAMBER
          </h2>
        </div>
        <span class="text-[9px] font-mono text-zinc-500 uppercase">SYS://ACCESS_02</span>
      </div>

      <p class="text-xs text-[#8b8e8b] mb-5 font-mono leading-relaxed">
        Enter the 6-character encrypted clearance code provided by the chamber host to join the match.
      </p>

      <form @submit.prevent="handleJoin" class="space-y-4">
        <AppInput
          v-model="playerName"
          label="OPERATIVE IDENTIFIER"
          placeholder="e.g. INFILTRATOR"
          maxlength="20"
          :error="nameError"
        />

        <AppInput
          v-model="roomCode"
          label="6-DIGIT CLEARANCE CODE"
          placeholder="XXXXXX"
          maxlength="6"
          uppercase
          :error="codeError"
          @enter="handleJoin"
        />

        <div v-if="error" class="text-xs text-red-400 font-mono p-2.5 bg-red-950/40 border border-red-800 rounded">
          ⚠️ {{ error }}
        </div>

        <AppButton
          type="submit"
          variant="secondary"
          class="w-full mt-2"
          :loading="loading"
          :disabled="!playerName.trim() || roomCode.trim().length !== 6"
        >
          ENTER MATCH
        </AppButton>
      </form>
    </div>

    <div class="mt-6 pt-3 border-t border-[#222526] text-[10px] text-zinc-500 font-mono flex items-center justify-between">
      <span>1v1 SYNCHRONIZED DUEL</span>
      <span class="text-amber-500/80">AUTHENTICATING</span>
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
  (e: 'join', payload: { name: string; roomCode: string }): void;
}>();

const playerName = ref('');
const roomCode = ref('');
const nameError = ref('');
const codeError = ref('');

function handleJoin() {
  const trimmedName = playerName.value.trim();
  const trimmedCode = roomCode.value.trim().toUpperCase();

  let hasError = false;

  if (!trimmedName) {
    nameError.value = 'Call-sign cannot be empty';
    hasError = true;
  } else {
    nameError.value = '';
  }

  if (trimmedCode.length !== 6) {
    codeError.value = 'Code must be exactly 6 characters';
    hasError = true;
  } else if (!/^[A-Z0-9]{6}$/.test(trimmedCode)) {
    codeError.value = 'Code contains invalid characters';
    hasError = true;
  } else {
    codeError.value = '';
  }

  if (hasError) return;

  emit('join', { name: trimmedName, roomCode: trimmedCode });
}
</script>
