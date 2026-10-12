<template>
  <div class="flex flex-col gap-1">
    <div class="flex items-center justify-between text-xs font-mono text-[#969895]">
      <span>VITAL INTEGRITY</span>
      <span class="text-[#E9E7E2] font-bold">{{ health }}/{{ maxHealth }} HP</span>
    </div>

    <!-- 4 health segments -->
    <div class="grid grid-cols-4 gap-1.5 h-3">
      <div
        v-for="index in maxHealth"
        :key="index"
        :class="[
          'rounded-[2px] transition-all duration-300 border',
          index <= health
            ? isLocal
              ? 'bg-[#A71922] border-red-500 shadow-[0_0_8px_rgba(167,25,34,0.6)]'
              : 'bg-[#D33B42] border-red-400'
            : 'bg-[#121414] border-[#303333] opacity-30',
        ]"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    health: number;
    maxHealth?: number;
    isLocal?: boolean;
  }>(),
  {
    maxHealth: 4,
    isLocal: false,
  }
);
</script>

