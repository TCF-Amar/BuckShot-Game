<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center font-medium tracking-wide transition-all duration-200 select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#080909]',
      sizeClasses,
      variantClasses,
      disabled || loading ? 'opacity-50 cursor-not-allowed filter grayscale' : 'active:scale-95',
    ]"
    @click="$emit('click', $event)"
  >
    <LoadingSpinner v-if="loading" size="sm" class="mr-2" />
    <slot name="icon-left" />
    <span :class="{ 'ml-2': $slots['icon-left'] }">
      <slot />
    </span>
    <slot name="icon-right" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LoadingSpinner from './LoadingSpinner.vue';

const props = withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
  }>(),
  {
    type: 'button',
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
  }
);

defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-3 py-1.5 text-xs rounded uppercase tracking-wider';
    case 'lg':
      return 'px-8 py-3.5 text-base rounded uppercase font-bold tracking-widest';
    default:
      return 'px-5 py-2.5 text-sm rounded uppercase font-semibold tracking-wider';
  }
});

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-[#A71922] hover:bg-[#D33B42] text-[#E9E7E2] shadow-lg shadow-red-950/40 border border-red-700/50 focus:ring-red-600';
    case 'secondary':
      return 'bg-[#1B1D1D] hover:bg-[#252828] text-[#E9E7E2] border border-[#303333] focus:ring-gray-600';
    case 'danger':
      return 'bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-800 focus:ring-red-500';
    case 'outline':
      return 'bg-transparent hover:bg-[#1B1D1D] text-[#E9E7E2] border border-[#303333] hover:border-[#969895] focus:ring-gray-500';
    case 'ghost':
      return 'bg-transparent hover:bg-white/5 text-[#969895] hover:text-[#E9E7E2] focus:ring-gray-500';
    default:
      return 'bg-[#A71922] text-[#E9E7E2]';
  }
});
</script>

