<template>
  <div
    :class="[
      'h-[100dvh] max-h-[100dvh] w-full bg-[#060707] text-[#E9E7E2] relative flex flex-col justify-between overflow-hidden selection:bg-red-900 selection:text-white',
      shotAnimation === 'firing_live' ? 'animate-screen-shake' : '',
    ]"
  >
    <!-- Atmospheric Visual Overlays -->
    <div class="fixed inset-0 vignette-overlay z-10 pointer-events-none"></div>
    <div class="fixed inset-0 horror-scanlines z-10 pointer-events-none opacity-30"></div>

    <!-- Blood Splatter Vignette on Damage -->
    <div
      v-if="showBloodSplatter"
      class="fixed inset-0 blood-vignette z-30 pointer-events-none"
    ></div>

    <!-- Red ambient pulse when it's player's turn -->
    <div
      v-if="isMyTurn && gameState?.phase === 'playing'"
      class="fixed inset-0 bg-red-950/15 pointer-events-none z-10 animate-pulse transition-opacity duration-500"
    ></div>

    <!-- Header (Fixed Top) -->
    <header class="relative z-20 flex-shrink-0">
      <GameHeader
        :room-code="roomCode"
        :connection-status="connectionStatus"
        :is-muted="sound.isMuted.value"
        @toggle-mute="sound.toggleMute"
        @leave="handleLeaveRoom"
      />
    </header>

    <!-- Main Game Area (Locked to viewport without scrolling) -->
    <main class="relative z-20 flex-1 min-h-0 flex flex-col max-w-5xl mx-auto w-full p-1 sm:p-2 md:p-3 overflow-hidden justify-between">
      <!-- Error Notification Banner if any -->
      <div
        v-if="lastSocketError"
        class="mb-1 p-2 bg-red-950/70 border border-red-700 text-red-200 text-xs font-mono flex items-center justify-between rounded shadow-lg flex-shrink-0"
      >
        <span>[ALERT]: {{ lastSocketError }}</span>
        <button
          type="button"
          class="text-red-400 hover:text-white font-bold ml-2"
          @click="clearError"
        >
          DISMISS
        </button>
      </div>

      <!-- WAITING ROOM STATE (Host created room, waiting for player 2) -->
      <div
        v-if="gameState?.phase === 'waiting'"
        class="max-w-md mx-auto w-full my-auto px-2"
      >
        <RoomCodeDisplay :room-code="roomCode" />
      </div>

      <!-- ACTIVE MATCH STATE: REAL IN-GAME CHAMBER PERSPECTIVE -->
      <div
        v-else-if="gameState && me"
        class="flex-1 min-h-0 flex flex-col justify-between gap-1 sm:gap-2 h-full overflow-hidden"
      >
        <!-- Turn Indicator Bar -->
        <TurnIndicator :is-my-turn="isMyTurn" class="flex-shrink-0" />

        <!-- 3D Chamber Tabletop Scene (Shotgun, Opponent, Shells, CRT Vitals, Tactical Items) -->
        <ChamberScene
          :me="me"
          :opponent="opponent"
          :round-number="gameState.roundNumber"
          :shells-remaining="gameState.shellsRemaining"
          :total-round-shells="gameState.totalRoundShells"
          :sawed-off="gameState.sawedOff"
          :round-live-count="gameState.roundLiveCount"
          :round-blank-count="gameState.roundBlankCount"
          :current-turn="gameState.currentTurn"
          :is-my-turn="isMyTurn"
          :action-pending="actionPending"
          :disabled="isGameOver"
          :revealed-shell="revealedShell"
          :shot-animation="shotAnimation"
          @shoot="handleShoot"
          @use-item="handleItem"
          @dismiss-reveal="dismissRevealedShell"
        />

        <!-- Real-Time Incident Action Log Terminal -->
        <ActionLog :action-log="gameState.actionLog" class="flex-shrink-0" />
      </div>

      <!-- LOADING OR INITIALIZING STATE -->
      <div
        v-else
        class="flex flex-col items-center justify-center my-auto py-16 text-center font-mono"
      >
        <LoadingSpinner size="lg" class="mb-4" />
        <div class="text-sm uppercase tracking-widest text-[#969895]">
          ESTABLISHING SECURE CHAMBER CONNECTION...
        </div>
        <div class="text-xs text-zinc-600 mt-2">
          Room Code: {{ roomCode }}
        </div>
        <button
          type="button"
          class="mt-6 text-xs text-red-500 hover:text-red-400 underline"
          @click="router.push('/')"
        >
          Return to Lobby
        </button>
      </div>
    </main>

    <!-- Game Over Modal -->
    <GameOverModal
      v-if="gameState && me"
      :is-open="isGameOver"
      :is-winner="isWinner"
      :winner-name="winnerName"
      :winner-health="winnerHealth"
      :round-number="gameState.roundNumber"
      :rematch-requested-by-me="rematchRequestedByMe"
      @rematch="handleRematch"
      @leave="handleLeaveRoom"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import GameHeader from '../../components/game/GameHeader.vue';
import RoomCodeDisplay from '../../components/lobby/RoomCodeDisplay.vue';
import TurnIndicator from '../../components/game/TurnIndicator.vue';
import ChamberScene from '../../components/game/ChamberScene.vue';
import ActionLog from '../../components/game/ActionLog.vue';
import GameOverModal from '../../components/game/GameOverModal.vue';
import LoadingSpinner from '../../components/ui/LoadingSpinner.vue';
import { useSocket } from '../../composables/useSocket';
import { useGame } from '../../composables/useGame';
import { useSound } from '../../composables/useSound';

const route = useRoute();
const router = useRouter();
const roomCode = computed(() => (route.params.roomCode as string)?.toUpperCase() || '');

const { connectionStatus } = useSocket();
const sound = useSound();
const {
  gameState,
  actionPending,
  revealedShell,
  shotAnimation,
  isMyTurn,
  me,
  opponent,
  isGameOver,
  isWinner,
  lastSocketError,
  clearError,
  bindEvents,
  handleShoot,
  handleItem,
  handleRematch,
  handleLeave,
  dismissRevealedShell,
  emitRequestState,
} = useGame();

const showBloodSplatter = ref(false);
let previousHealth = 4;

const winnerPlayer = computed(() => {
  return gameState.value?.players.find((p) => p.id === gameState.value?.winnerId) || null;
});

const winnerName = computed(() => winnerPlayer.value?.name || 'Unknown');
const winnerHealth = computed(() => winnerPlayer.value?.health || 0);
const rematchRequestedByMe = computed(() => !!me.value?.rematchRequested);

// Watch for damage taken by local player to trigger blood splatter and heartbeat audio
watch(
  () => me.value?.health,
  (newHealth) => {
    if (newHealth !== undefined) {
      if (newHealth < previousHealth) {
        showBloodSplatter.value = true;
        setTimeout(() => {
          showBloodSplatter.value = false;
        }, 2200);
      }
      previousHealth = newHealth;

      // Heartbeat pulse triggers when on critical HP (1 HP)
      if (newHealth === 1) {
        sound.startHeartbeat(135);
      } else {
        sound.stopHeartbeat();
      }
    }
  }
);

onMounted(() => {
  bindEvents();
  emitRequestState();
  sound.startAmbient();
});

onUnmounted(() => {
  sound.stopAmbient();
  sound.stopHeartbeat();
});

function handleLeaveRoom() {
  handleLeave();
  router.push('/');
}
</script>
