<template>
  <div class="flex items-center gap-1.5 font-mono text-xs">
    <span
      :class="[
        'w-2 h-2 rounded-full',
        status === 'connected'
          ? 'bg-emerald-500'
          : status === 'connecting'
          ? 'bg-amber-500 animate-ping'
          : 'bg-red-600',
      ]"
    ></span>
    <span class="text-[#969895] text-[11px] hidden sm:inline uppercase">
      {{ statusText }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
}>();

const statusText = computed(() => {
  switch (props.status) {
    case 'connected':
      return 'ONLINE';
    case 'connecting':
      return 'SYNCING';
    case 'disconnected':
      return 'DISCONNECTED';
    case 'error':
      return 'CONNECTION ERR';
    default:
      return '';
  }
});
</script>

