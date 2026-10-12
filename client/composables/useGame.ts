import { ref, computed, onMounted, onUnmounted } from 'vue';
import type {
  ClientPersonalizedState,
  ShootActionResult,
  ShellType,
  ItemType,
  PublicPlayerState,
} from '../types/game';
import { SERVER_EVENTS } from '../types/game';
import { useSocket } from './useSocket';
import { useSound } from './useSound';

export function useGame() {
  const {
    getSocket,
    emitShoot,
    emitItem,
    emitRematch,
    emitLeaveRoom,
    emitRequestState,
    lastSocketError,
    clearError,
  } = useSocket();
  const sound = useSound();

  const gameState = ref<ClientPersonalizedState | null>(null);
  const actionPending = ref(false);
  const revealedShell = ref<ShellType | null>(null);
  const lastShotResult = ref<ShootActionResult | null>(null);
  const shotAnimation = ref<'idle' | 'aiming' | 'firing_live' | 'firing_blank'>('idle');

  const isMyTurn = computed(() => !!gameState.value?.isMyTurn);
  const me = computed<PublicPlayerState | null>(() => gameState.value?.me || null);
  const opponent = computed<PublicPlayerState | null>(() => gameState.value?.opponent || null);
  const isHost = computed(() => gameState.value?.hostId === gameState.value?.myId);
  const shellsRemaining = computed(() => gameState.value?.shellsRemaining || 0);
  const isGameOver = computed(() => gameState.value?.phase === 'finished');
  const isWinner = computed(() => gameState.value?.winnerId === gameState.value?.myId);

  let socketHandlersBound = false;

  function bindEvents() {
    if (socketHandlersBound) return;
    const socket = getSocket();

    socket.on(SERVER_EVENTS.GAME_STATE, (state: ClientPersonalizedState) => {
      const prevTurn = gameState.value?.currentTurn;
      gameState.value = state;

      // Sound trigger on turn change
      if (state.phase === 'playing' && state.currentTurn !== prevTurn) {
        sound.playTurnAlert(state.isMyTurn);
      }
    });

    socket.on(SERVER_EVENTS.GAME_PRIVATE, (data: { type: string; revealedShell?: ShellType }) => {
      if (data.type === 'magnifier_reveal' && data.revealedShell) {
        revealedShell.value = data.revealedShell;
        sound.playItem('magnifier');
      }
    });

    socket.on(SERVER_EVENTS.GAME_ACTION_RESULT, (result: ShootActionResult) => {
      lastShotResult.value = result;

      // Trigger shot visual and audio sequence
      sound.playPump();
      setTimeout(() => {
        if (result.shellType === 'live') {
          shotAnimation.value = 'firing_live';
          sound.playLiveShot();
        } else {
          shotAnimation.value = 'firing_blank';
          sound.playBlank();
        }

        // Reset animation state
        setTimeout(() => {
          shotAnimation.value = 'idle';
        }, 1200);
      }, 400);

      // If user had inspected shell, clear it once that shell is fired
      revealedShell.value = null;
    });

    socket.on(SERVER_EVENTS.GAME_FINISHED, (data: { winnerId: string }) => {
      const myId = gameState.value?.myId;
      if (data.winnerId === myId) {
        sound.playWin();
      } else {
        sound.playLoss();
      }
    });

    socket.on(SERVER_EVENTS.GAME_STARTED, () => {
      sound.playPump();
    });

    socketHandlersBound = true;
  }

  async function handleShoot(target: 'self' | 'opponent') {
    if (actionPending.value || !isMyTurn.value || isGameOver.value) return;
    actionPending.value = true;
    try {
      shotAnimation.value = 'aiming';
      await emitShoot(target);
    } finally {
      actionPending.value = false;
    }
  }

  async function handleItem(item: ItemType) {
    if (actionPending.value || !isMyTurn.value || isGameOver.value) return;
    actionPending.value = true;
    try {
      sound.playItem(item);
      await emitItem(item);
    } finally {
      actionPending.value = false;
    }
  }

  function handleRematch() {
    emitRematch();
  }

  function handleLeave() {
    emitLeaveRoom();
  }

  function dismissRevealedShell() {
    revealedShell.value = null;
  }

  return {
    gameState,
    actionPending,
    revealedShell,
    lastShotResult,
    shotAnimation,
    isMyTurn,
    me,
    opponent,
    isHost,
    shellsRemaining,
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
  };
}

