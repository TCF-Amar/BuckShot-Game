<template>
  <div class="min-h-screen w-full bg-[#080909] text-[#E9E7E2] relative flex flex-col justify-between overflow-x-hidden selection:bg-red-900 selection:text-white">
    <!-- Atmospheric Background Effects -->
    <div class="fixed inset-0 vignette-overlay z-10 pointer-events-none"></div>
    <div class="fixed inset-0 horror-scanlines z-10 pointer-events-none opacity-40"></div>
    <div class="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-950/20 rounded-full blur-[120px] ambient-glow pointer-events-none"></div>

    <!-- Header Bar -->
    <header class="relative z-20 w-full px-4 sm:px-6 py-2.5 sm:py-4 flex items-center justify-between border-b border-[#252828]/60 flex-shrink-0">
      <div class="flex items-center gap-2">
        <div class="w-2.5 h-2.5 bg-[#A71922] shadow-[0_0_8px_rgba(167,25,34,0.8)]"></div>
        <span class="text-xs font-mono tracking-widest text-[#969895] uppercase">
          PROJECT DEAD SIGNAL
        </span>
      </div>

      <div class="flex items-center gap-4">
        <ConnectionStatus :status="connectionStatus" />
        <button
          type="button"
          class="text-xs font-mono text-[#969895] hover:text-[#E9E7E2] transition-colors"
          @click="showRulesModal = true"
        >
          [ PROTOCOL RULES ]
        </button>
      </div>
    </header>

    <!-- Main Content Hero & Cards -->
    <main class="relative z-20 flex-1 flex flex-col items-center justify-start sm:justify-center px-3 sm:px-4 py-4 sm:py-8 max-w-4xl mx-auto w-full">
      <!-- Title & Wordmark -->
      <div class="text-center mb-3 sm:mb-6">
        <h1 class="text-3xl sm:text-5xl md:text-7xl font-black tracking-[0.2em] text-[#E9E7E2] uppercase drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
          DEAD <span class="text-[#A71922]">SIGNAL</span>
        </h1>
        <p class="mt-1 sm:mt-2 text-[10px] sm:text-xs md:text-sm font-mono tracking-widest text-[#969895] uppercase max-w-lg mx-auto">
          Tactical Turn-Based Multiplayer Chamber Roulette
        </p>
      </div>

      <!-- Lobby Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 w-full max-w-2xl">
        <!-- Host Card -->
        <CreateRoomCard
          :loading="isCreating"
          :error="createError"
          @create="handleCreateRoom"
        />

        <!-- Join Card -->
        <JoinRoomCard
          :loading="isJoining"
          :error="joinError"
          @join="handleJoinRoom"
        />
      </div>

      <!-- Quick Rules Drawer Summary -->
      <div class="mt-3 sm:mt-6 text-center">
        <button
          type="button"
          class="text-[11px] sm:text-xs font-mono text-[#969895] hover:text-red-400 transition-colors underline underline-offset-4"
          @click="showRulesModal = true"
        >
          How does DEAD SIGNAL work? View Combat Rules & Items
        </button>
      </div>
    </main>

    <!-- Footer -->
    <footer class="relative z-20 w-full py-4 text-center border-t border-[#252828]/40 text-[11px] font-mono text-zinc-600">
      DEAD SIGNAL • Authoritative Real-Time Multiplayer • Two Players Per Match
    </footer>

    <!-- Rules Modal -->
    <AppModal
      :is-open="showRulesModal"
      title="DEAD SIGNAL — COMBAT PROTOCOL"
      @close="showRulesModal = false"
    >
      <div class="space-y-4 font-mono text-xs text-[#969895] max-h-[60vh] overflow-y-auto pr-1">
        <div>
          <h4 class="text-red-400 font-bold uppercase mb-1">1. CHAMBER RULES</h4>
          <p>
            Each round, exactly 6 shells are loaded into the chamber (2 to 4 Live shells, remainder are Blanks). The sequence is generated server-side and kept strictly secret.
          </p>
        </div>

        <div>
          <h4 class="text-red-400 font-bold uppercase mb-1">2. TURN ACTIONS</h4>
          <p class="mb-1">
            <strong class="text-[#E9E7E2]">Shoot Opponent:</strong> If Live, deals 1 damage and passes turn. If Blank, deals no damage and passes turn.
          </p>
          <p>
            <strong class="text-[#E9E7E2]">Shoot Yourself:</strong> If Live, deals 1 damage to yourself and passes turn. If Blank, <span class="text-amber-300">YOU RETAIN YOUR TURN</span> to take another action!
          </p>
        </div>

        <div>
          <h4 class="text-red-400 font-bold uppercase mb-1">3. STRATEGIC ITEMS (1 USE EACH PER ROUND)</h4>
          <ul class="space-y-1 list-disc list-inside">
            <li>
              <strong class="text-amber-400">Magnifier:</strong> Secretly inspects the next shell in the chamber. Result is revealed only to you.
            </li>
            <li>
              <strong class="text-cyan-400">Handcuffs:</strong> Locks opponent. Their next turn is skipped when turn passes to them.
            </li>
            <li>
              <strong class="text-emerald-400">Medkit:</strong> Restores 1 health segment (up to 4 maximum HP). Cannot be used if health is full.
            </li>
          </ul>
        </div>

        <div>
          <h4 class="text-red-400 font-bold uppercase mb-1">4. VICTORY CONDITIONS</h4>
          <p>
            Both players start with 4 HP. Reduce your opponent's HP to 0 to win the match. When 6 shells are exhausted, a new round begins with refreshed items while preserving existing HP.
          </p>
        </div>
      </div>

      <template #actions>
        <AppButton variant="secondary" size="sm" @click="showRulesModal = false">
          CLOSE PROTOCOL
        </AppButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import CreateRoomCard from '../components/lobby/CreateRoomCard.vue';
import JoinRoomCard from '../components/lobby/JoinRoomCard.vue';
import ConnectionStatus from '../components/game/ConnectionStatus.vue';
import AppModal from '../components/ui/AppModal.vue';
import AppButton from '../components/ui/AppButton.vue';
import { useSocket } from '../composables/useSocket';

const router = useRouter();
const { emitCreateRoom, emitJoinRoom, connectionStatus } = useSocket();

const isCreating = ref(false);
const isJoining = ref(false);
const createError = ref<string | null>(null);
const joinError = ref<string | null>(null);
const showRulesModal = ref(false);

async function handleCreateRoom(name: string) {
  isCreating.value = true;
  createError.value = null;
  try {
    const res = await emitCreateRoom(name);
    if (res.success && res.roomCode) {
      router.push(`/game/${res.roomCode}`);
    } else {
      createError.value = res.error || 'Failed to create room';
    }
  } catch (err: any) {
    createError.value = err.message || 'Network error';
  } finally {
    isCreating.value = false;
  }
}

async function handleJoinRoom(payload: { name: string; roomCode: string }) {
  isJoining.value = true;
  joinError.value = null;
  try {
    const res = await emitJoinRoom(payload.roomCode, payload.name);
    if (res.success && res.roomCode) {
      router.push(`/game/${res.roomCode}`);
    } else {
      joinError.value = res.error || 'Failed to join room';
    }
  } catch (err: any) {
    joinError.value = err.message || 'Network error';
  } finally {
    isJoining.value = false;
  }
}
</script>

