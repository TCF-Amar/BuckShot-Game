<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
        @click.self="dismissible ? $emit('close') : null"
      >
        <div
          class="relative w-full max-w-md bg-[#121414] border border-[#303333] shadow-2xl shadow-red-950/20 overflow-hidden transform transition-all"
        >
          <!-- Top subtle accent line -->
          <div class="h-1 w-full bg-gradient-to-r from-transparent via-[#A71922] to-transparent"></div>

          <div class="p-6">
            <h3 v-if="title" class="text-xl font-bold uppercase tracking-wider text-[#E9E7E2] mb-3">
              {{ title }}
            </h3>
            <div class="text-[#969895] text-sm mb-6">
              <slot />
            </div>

            <div v-if="$slots.actions" class="flex justify-end gap-3 pt-3 border-t border-[#303333]">
              <slot name="actions" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    isOpen: boolean;
    title?: string;
    dismissible?: boolean;
  }>(),
  {
    isOpen: false,
    dismissible: true,
  }
);

defineEmits<{
  (e: 'close'): void;
}>();
</script>

