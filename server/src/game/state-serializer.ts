import type {
  InternalGameState,
  PublicGameState,
  PublicPlayerState,
  ClientPersonalizedState,
  PlayerState,
} from '../types/game.js';

export function serializePlayer(player: PlayerState): PublicPlayerState {
  return {
    id: player.id,
    name: player.name,
    health: player.health,
    maxHealth: player.maxHealth,
    inventory: { ...player.inventory },
    skippedTurnsPending: player.skippedTurnsPending,
    connected: player.connected,
    rematchRequested: player.rematchRequested,
  };
}

export function serializePublicGameState(state: InternalGameState): PublicGameState {
  const shellsRemaining = Math.max(0, state.shellSequence.length - state.currentShellIndex);

  return {
    roomCode: state.roomCode,
    phase: state.phase,
    roundNumber: state.roundNumber,
    hostId: state.hostId,
    players: state.players.map(serializePlayer),
    currentTurn: state.currentTurn,
    shellsRemaining,
    totalRoundShells: state.shellSequence.length,
    sawedOff: state.sawedOff,
    roundLiveCount: state.roundLiveCount,
    roundBlankCount: state.roundBlankCount,
    winnerId: state.winnerId,
    // Return last 25 action log entries for public view
    actionLog: state.actionLog.slice(-25),
  };
}

export function serializePersonalizedGameState(
  state: InternalGameState,
  playerId: string
): ClientPersonalizedState {
  const publicState = serializePublicGameState(state);
  const me = publicState.players.find((p) => p.id === playerId) || null;
  const opponent = publicState.players.find((p) => p.id !== playerId) || null;
  const isMyTurn = state.phase === 'playing' && state.currentTurn === playerId;

  return {
    ...publicState,
    myId: playerId,
    isMyTurn,
    me,
    opponent,
  };
}
