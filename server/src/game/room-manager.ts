import type {
  InternalGameState,
  PlayerState,
  ClientPersonalizedState,
} from '../types/game.js';
import { generateRoomCode, normalizeRoomCode, isValidRoomCode } from '../utils/room-code.js';
import { GameEngine, ActionError } from './engine.js';
import { serializePersonalizedGameState } from './state-serializer.js';

export interface SocketMapping {
  roomCode: string;
  playerId: string;
}

export class RoomManager {
  private rooms: Map<string, InternalGameState> = new Map();
  private socketToPlayer: Map<string, SocketMapping> = new Map();

  /**
   * Creates a new private room.
   */
  createRoom(
    socketId: string,
    hostName: string
  ): { roomCode: string; state: InternalGameState; hostPlayer: PlayerState } {
    let attempts = 0;
    let roomCode = generateRoomCode();

    // Ensure unique room code
    while (this.rooms.has(roomCode) && attempts < 10) {
      roomCode = generateRoomCode();
      attempts++;
    }

    const { state, hostPlayer } = GameEngine.createGame(roomCode, socketId, hostName);
    this.rooms.set(roomCode, state);
    this.socketToPlayer.set(socketId, { roomCode, playerId: hostPlayer.id });

    return { roomCode, state, hostPlayer };
  }

  /**
   * Joins an existing room.
   */
  joinRoom(
    rawRoomCode: string,
    socketId: string,
    playerName: string
  ): { state: InternalGameState; player: PlayerState } {
    const roomCode = normalizeRoomCode(rawRoomCode);

    if (!isValidRoomCode(roomCode)) {
      throw new ActionError('Invalid room code format. Must be 6 alphanumeric characters.');
    }

    const state = this.rooms.get(roomCode);
    if (!state) {
      throw new ActionError(`Room ${roomCode} not found.`);
    }

    if (state.phase !== 'waiting') {
      throw new ActionError('Room is already in progress or completed.');
    }

    // Check if socket is already in a room
    const existing = this.socketToPlayer.get(socketId);
    if (existing && existing.roomCode === roomCode) {
      throw new ActionError('You are already connected to this room.');
    }

    const player = GameEngine.joinGame(state, socketId, playerName);
    this.socketToPlayer.set(socketId, { roomCode, playerId: player.id });

    return { state, player };
  }

  /**
   * Gets room state by room code.
   */
  getRoom(rawRoomCode: string): InternalGameState | undefined {
    return this.rooms.get(normalizeRoomCode(rawRoomCode));
  }

  /**
   * Gets socket mapping.
   */
  getSocketMapping(socketId: string): SocketMapping | undefined {
    return this.socketToPlayer.get(socketId);
  }

  /**
   * Gets room and player for a socket.
   */
  getContextBySocket(socketId: string): { state: InternalGameState; player: PlayerState } | null {
    const mapping = this.socketToPlayer.get(socketId);
    if (!mapping) return null;

    const state = this.rooms.get(mapping.roomCode);
    if (!state) return null;

    const player = state.players.find((p) => p.id === mapping.playerId);
    if (!player) return null;

    return { state, player };
  }

  /**
   * Handles player disconnection.
   */
  handleDisconnect(socketId: string): {
    state: InternalGameState;
    player: PlayerState;
    isEmpty: boolean;
  } | null {
    const context = this.getContextBySocket(socketId);
    if (!context) return null;

    const { state, player } = context;
    GameEngine.setPlayerConnection(state, player.id, false);
    this.socketToPlayer.delete(socketId);

    // Check if all players are disconnected
    const allDisconnected = state.players.every((p) => !p.connected);

    // If waiting room host left or all disconnected in finished state, clean up
    if (state.phase === 'waiting' || (allDisconnected && state.phase === 'finished')) {
      this.rooms.delete(state.roomCode);
      return { state, player, isEmpty: true };
    }

    return { state, player, isEmpty: false };
  }

  /**
   * Handles player leaving explicitly.
   */
  leaveRoom(socketId: string): { roomCode: string; destroyed: boolean } | null {
    const mapping = this.socketToPlayer.get(socketId);
    if (!mapping) return null;

    const state = this.rooms.get(mapping.roomCode);
    this.socketToPlayer.delete(socketId);

    if (!state) return null;

    // If room is in waiting phase or only 1 player remains, remove the room
    if (state.phase === 'waiting') {
      this.rooms.delete(mapping.roomCode);
      return { roomCode: mapping.roomCode, destroyed: true };
    }

    // Mark as abandoned if active match
    state.phase = 'abandoned';
    GameEngine.setPlayerConnection(state, mapping.playerId, false);
    return { roomCode: mapping.roomCode, destroyed: false };
  }

  /**
   * Clean up abandoned rooms older than maxAgeMs (default 30 mins)
   */
  cleanupOldRooms(maxAgeMs: number = 30 * 60 * 1000): number {
    const now = Date.now();
    let cleaned = 0;
    for (const [code, room] of this.rooms.entries()) {
      if (now - room.updatedAt > maxAgeMs) {
        this.rooms.delete(code);
        cleaned++;
      }
    }
    return cleaned;
  }

  /**
   * Get personalized state for a player
   */
  getPersonalizedState(roomCode: string, playerId: string): ClientPersonalizedState | null {
    const room = this.rooms.get(normalizeRoomCode(roomCode));
    if (!room) return null;
    return serializePersonalizedGameState(room, playerId);
  }

  /**
   * Clear all rooms (for testing)
   */
  reset(): void {
    this.rooms.clear();
    this.socketToPlayer.clear();
  }
}
