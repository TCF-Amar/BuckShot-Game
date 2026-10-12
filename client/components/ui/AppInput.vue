<template>
  <div class="flex flex-col space-y-1.5 w-full">
    <label v-if="label" :for="id" class="text-xs uppercase tracking-wider text-[#969895] font-mono">
      {{ label }}
    </label>
    <div class="relative flex items-center">
      <input
        :id="id"
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :maxlength="maxlength"
        :disabled="disabled"
        :class="[
          'w-full bg-[#121414] border px-4 py-2.5 text-sm text-[#E9E7E2] placeholder-[#969895]/50 transition-colors focus:outline-none focus:ring-1 focus:ring-red-600',
          uppercase ? 'uppercase font-mono tracking-widest text-center text-lg' : '',
          error ? 'border-red-600' : 'border-[#303333] hover:border-[#454949] focus:border-red-600',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        ]"
        @input="onInput"
        @keyup.enter="$emit('enter')"
      />
      <div v-if="$slots.suffix" class="absolute right-3 text-[#969895]">
        <slot name="suffix" />
      </div>
    </div>
    <span v-if="error" class="text-xs text-red-500 font-mono tracking-wide">
      {{ error }}
    </span>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: string;
    id?: string;
    label?: string;
    placeholder?: string;
    type?: string;
    maxlength?: number;
    disabled?: boolean;
    uppercase?: boolean;
    error?: string;
  }>(),
  {
    type: 'text',
    disabled: false,
    uppercase: false,
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'enter'): void;
}>();

function onInput(e: Event) {
  const target = e.target as HTMLInputElement;
  const val = props.uppercase ? target.value.toUpperCase() : target.value;
  emit('update:modelValue', val);
}
</script>

