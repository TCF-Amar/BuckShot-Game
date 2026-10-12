<template>
  <div class="w-full text-center py-0.5 sm:py-1 px-2 flex-shrink-0">
    <div
      :class="[
        'inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:py-1.5 rounded-full border text-[10px] sm:text-xs font-mono tracking-wider uppercase transition-all duration-300',
        isMyTurn
          ? 'bg-red-950/70 border-red-600 text-red-200 shadow-[0_0_12px_rgba(167,25,34,0.4)] animate-pulse'
          : 'bg-[#121414] border-[#303333] text-[#969895]',
      ]"
    >
      <span
        :class="[
          'w-1.5 h-1.5 rounded-full flex-shrink-0',
          isMyTurn ? 'bg-red-500 animate-ping' : 'bg-gray-600',
        ]"
      ></span>
      <span>
        {{ isMyTurn ? 'YOUR TURN — MAKE YOUR MOVE' : "OPPONENT'S TURN — AWAITING ACTION" }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isMyTurn: boolean;
}>();
</script>

