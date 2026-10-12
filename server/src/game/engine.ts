import type {
  InternalGameState,
  PlayerState,
  ShootTarget,
  ShootActionResult,
  ItemType,
  ItemActionResult,
  ShellType,
} from '../types/game.js';
import { generateShellSequence, generateSecureToken } from '../utils/random.js';
import { executeShoot, startNewRound, ActionError } from './actions.js';
import { applyItem, ItemError } from './items.js';

export { ActionError, ItemError };

export class GameEngine {
  /**
   * Creates a new game in 'waiting' phase with the host player.
   */
  static createGame(
    roomCode: string,
    hostSocketId: string,
    hostName: string
  ): { state: InternalGameState; hostPlayer: PlayerState } {
    const hostPlayer: PlayerState = {
      id: `p_${Date.now()}_1`,
      socketId: hostSocketId,
      resumeToken: generateSecureToken(),
      name: hostName.trim() || 'Player 1',
      health: 4,
      maxHealth: 4,
      inventory: { magnifier: 1, cuffs: 1, medkit: 1, blade: 1 },
      skippedTurnsPending: 0,
      connected: true,
      rematchRequested: false,
    };

    const state: InternalGameState = {
      roomCode,
      phase: 'waiting',
      roundNumber: 1,
      hostId: hostPlayer.id,
      players: [hostPlayer],
      currentTurn: null,
      shellSequence: [],
      currentShellIndex: 0,
      sawedOff: false,
      roundLiveCount: 0,
      roundBlankCount: 0,
      winnerId: null,
      actionLog: [
        {
          id: `log_${Date.now()}_init`,
          timestamp: Date.now(),
          type: 'player_joined',
          actorId: hostPlayer.id,
          message: `${hostPlayer.name} created the room and is waiting for an opponent.`,
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    return { state, hostPlayer };
  }

  /**
   * Adds the second player to the room and starts the match.
   */
  static joinGame(
    state: InternalGameState,
    socketId: string,
    playerName: string,
    initialShellsOverride?: ShellType[]
  ): PlayerState {
    if (state.phase !== 'waiting') {
      throw new ActionError('Room is already full or match in progress');
    }

    if (state.players.length >= 2) {
      throw new ActionError('Room is already full (maximum 2 players)');
    }

    const player2: PlayerState = {
      id: `p_${Date.now()}_2`,
      socketId,
      resumeToken: generateSecureToken(),
      name: playerName.trim() || 'Player 2',
      health: 4,
      maxHealth: 4,
      inventory: { magnifier: 1, cuffs: 1, medkit: 1, blade: 1 },
      skippedTurnsPending: 0,
      connected: true,
      rematchRequested: false,
    };

    // Add player to players tuple
    state.players = [state.players[0], player2];

    // Start match
    state.phase = 'playing';
    state.roundNumber = 1;
    state.sawedOff = false;

    if (initialShellsOverride) {
      state.shellSequence = initialShellsOverride;
      state.roundLiveCount = initialShellsOverride.filter((s) => s === 'live').length;
      state.roundBlankCount = initialShellsOverride.filter((s) => s === 'blank').length;
    } else {
      const shellData = generateShellSequence();
      state.shellSequence = shellData.sequence;
      state.roundLiveCount = shellData.liveCount;
      state.roundBlankCount = shellData.blankCount;
    }

    state.currentShellIndex = 0;
    // Host takes first turn initially
    state.currentTurn = state.players[0].id;
    state.winnerId = null;

    state.actionLog.push({
      id: `log_${Date.now()}_join`,
      timestamp: Date.now(),
      type: 'player_joined',
      actorId: player2.id,
      message: `${player2.name} joined the chamber. Match started!`,
    });

    state.actionLog.push({
      id: `log_${Date.now()}_start`,
      timestamp: Date.now(),
      type: 'match_started',
      message: `The shotgun is loaded: ${state.roundLiveCount} LIVE, ${state.roundBlankCount} BLANK (${state.shellSequence.length} total). It is ${state.players[0].name}'s turn.`,
    });

    state.updatedAt = Date.now();

    return player2;
  }

  /**
   * Authoritative shoot action.
   */
  static shoot(
    state: InternalGameState,
    playerId: string,
    target: ShootTarget
  ): ShootActionResult {
    return executeShoot(state, playerId, target);
  }

  /**
   * Authoritative item usage.
   */
  static useItem(
    state: InternalGameState,
    playerId: string,
    item: ItemType
  ): ItemActionResult {
    return applyItem(state, playerId, item);
  }

  /**
   * Handles rematch requests. Requires BOTH players to agree.
   */
  static requestRematch(
    state: InternalGameState,
    playerId: string,
    newShellsOverride?: ShellType[]
  ): { rematchStarted: boolean; waitingForOther: boolean } {
    if (state.phase !== 'finished') {
      throw new ActionError('Rematch can only be requested after match has finished');
    }

    const player = state.players.find((p) => p.id === playerId);
    if (!player) {
      throw new ActionError('Player not found in match');
    }

    player.rematchRequested = true;

    // Check if both players requested rematch
    const bothAgreed =
      state.players.length === 2 && state.players.every((p) => p.rematchRequested);

    if (bothAgreed) {
      // Reset match for new game
      state.phase = 'playing';
      state.roundNumber = 1;
      state.sawedOff = false;

      if (newShellsOverride) {
        state.shellSequence = newShellsOverride;
        state.roundLiveCount = newShellsOverride.filter((s) => s === 'live').length;
        state.roundBlankCount = newShellsOverride.filter((s) => s === 'blank').length;
      } else {
        const shellData = generateShellSequence();
        state.shellSequence = shellData.sequence;
        state.roundLiveCount = shellData.liveCount;
        state.roundBlankCount = shellData.blankCount;
      }

      state.currentShellIndex = 0;
      state.winnerId = null;
      // Alternate starting turn or host starts
      state.currentTurn = state.players[0].id;

      for (const p of state.players) {
        p.health = 4;
        p.maxHealth = 4;
        p.inventory = { magnifier: 1, cuffs: 1, medkit: 1, blade: 1 };
        p.skippedTurnsPending = 0;
        p.rematchRequested = false;
      }

      state.actionLog.push({
        id: `log_${Date.now()}_rematch`,
        timestamp: Date.now(),
        type: 'match_started',
        message: `Both players agreed to a rematch! Loaded: ${state.roundLiveCount} LIVE, ${state.roundBlankCount} BLANK (${state.shellSequence.length} total).`,
      });

      state.updatedAt = Date.now();
      return { rematchStarted: true, waitingForOther: false };
    }

    state.updatedAt = Date.now();
    return { rematchStarted: false, waitingForOther: true };
  }

  /**
   * Disconnection handling.
   */
  static setPlayerConnection(
    state: InternalGameState,
    playerId: string,
    connected: boolean
  ): void {
    const player = state.players.find((p) => p.id === playerId);
    if (player) {
      player.connected = connected;
      state.actionLog.push({
        id: `log_${Date.now()}_conn`,
        timestamp: Date.now(),
        type: connected ? 'player_reconnected' : 'player_disconnected',
        actorId: playerId,
        message: `${player.name} has ${connected ? 'reconnected' : 'disconnected'}.`,
      });
      state.updatedAt = Date.now();
    }
  }
}
