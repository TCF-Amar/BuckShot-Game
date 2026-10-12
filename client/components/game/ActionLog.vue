<template>
  <div>
    <!-- Compact Bottom Incident Telemetry Ticker (Zero Screen Height Waste) -->
    <div
      class="bg-[#0b0c0d] border-t border-[#252829] px-3 py-1.5 flex items-center justify-between text-xs font-mono cursor-pointer hover:bg-[#121415] transition-colors select-none"
      @click="isExpanded = true"
    >
      <div class="flex items-center gap-2 overflow-hidden flex-1 mr-2">
        <span class="w-2 h-2 rounded-full bg-red-600 animate-ping flex-shrink-0"></span>
        <span class="text-zinc-500 text-[10px] uppercase flex-shrink-0 hidden xs:inline">
          LATEST EVENT:
        </span>
        <span
          v-if="latestEntry"
          :class="[
            'truncate text-[11px] sm:text-xs',
            latestEntry.type === 'shell_fired'
              ? latestEntry.details?.shellType === 'live'
                ? 'text-red-400 font-bold'
                : 'text-cyan-300'
              : latestEntry.type === 'item_used'
              ? 'text-amber-300'
              : 'text-zinc-300',
          ]"
        >
          {{ latestEntry.message }}
        </span>
        <span v-else class="text-zinc-600 italic text-[11px]">
          Chamber telemetry active...
        </span>
      </div>

      <button
        type="button"
        class="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex-shrink-0 flex items-center gap-1"
      >
        <span>LOG</span>
        <span class="text-red-400 font-bold">[{{ actionLog.length }}]</span>
      </button>
    </div>

    <!-- Full Incident Log Terminal Modal Drawer -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-8"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-8"
      >
        <div
          v-if="isExpanded"
          class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm"
          @click.self="isExpanded = false"
        >
          <div class="w-full max-w-lg bg-[#0e1011] border border-zinc-700 shadow-2xl rounded-t-xl sm:rounded-lg overflow-hidden flex flex-col max-h-[70vh]">
            <!-- Terminal Header -->
            <div class="px-4 py-2.5 bg-[#141718] border-b border-zinc-700 flex items-center justify-between font-mono text-xs">
              <div class="flex items-center gap-2 text-zinc-300">
                <span class="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                <span class="font-bold tracking-wider uppercase">INCIDENT TELEMETRY FEED</span>
              </div>
              <button
                type="button"
                class="text-zinc-400 hover:text-white text-xs px-2 py-0.5 rounded bg-zinc-800"
                @click="isExpanded = false"
              >
                [CLOSE]
              </button>
            </div>

            <!-- Scrollable Log Entries -->
            <div
              ref="logContainer"
              class="p-4 overflow-y-auto space-y-2 font-mono text-xs flex-1 max-h-[50vh]"
            >
              <div v-if="!actionLog || actionLog.length === 0" class="text-zinc-600 italic py-4 text-center">
                Awaiting telemetry entries...
              </div>

              <div
                v-for="entry in actionLog"
                :key="entry.id"
                :class="[
                  'py-1 px-2 rounded-[2px] leading-relaxed',
                  entry.type === 'shell_fired'
                    ? entry.details?.shellType === 'live'
                      ? 'bg-red-950/40 text-red-300 border-l-2 border-red-600'
                      : 'bg-cyan-950/30 text-cyan-200 border-l-2 border-cyan-700'
                    : entry.type === 'item_used'
                    ? 'bg-amber-950/30 text-amber-200 border-l-2 border-amber-600'
                    : entry.type === 'turn_skipped'
                    ? 'bg-yellow-950/40 text-yellow-300 border-l-2 border-yellow-500'
                    : entry.type === 'match_finished'
                    ? 'bg-red-900/50 text-red-100 font-bold border-l-2 border-red-500'
                    : 'text-zinc-400',
                ]"
              >
                <span class="text-[10px] text-zinc-500 mr-2">
                  {{ formatTime(entry.timestamp) }}
                </span>
                <span>{{ entry.message }}</span>
              </div>
            </div>

            <!-- Footer Close -->
            <div class="p-2.5 bg-[#121415] border-t border-zinc-800 text-center">
              <button
                type="button"
                class="w-full py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono font-bold uppercase tracking-wider"
                @click="isExpanded = false"
              >
                RETURN TO CHAMBER
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import type { ActionLogEntry } from '../../types/game';

const props = defineProps<{
  actionLog: ActionLogEntry[];
}>();

const isExpanded = ref(false);
const logContainer = ref<HTMLElement | null>(null);

const latestEntry = computed(() => {
  if (!props.actionLog || props.actionLog.length === 0) return null;
  return props.actionLog[props.actionLog.length - 1];
});

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  const min = String(d.getMinutes()).padStart(2, '0');
  const sec = String(d.getSeconds()).padStart(2, '0');
  return `[${min}:${sec}]`;
}

watch(
  () => props.actionLog.length,
  async () => {
    if (isExpanded.value) {
      await nextTick();
      if (logContainer.value) {
        logContainer.value.scrollTop = logContainer.value.scrollHeight;
      }
    }
  }
);
</script>
