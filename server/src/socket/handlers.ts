import type { Server, Socket } from 'socket.io';
import { RoomManager } from '../game/room-manager.js';
import { GameEngine, ActionError, ItemError } from '../game/engine.js';
import { serializePersonalizedGameState } from '../game/state-serializer.js';
import { CLIENT_EVENTS, SERVER_EVENTS } from './events.js';
import { SocketRateLimiter } from './middleware.js';
import {
  createRoomSchema,
  joinRoomSchema,
  shootActionSchema,
  itemActionSchema,
} from '../validation/schemas.js';
import type { InternalGameState } from '../types/game.js';

export function setupSocketHandlers(io: Server, roomManager: RoomManager): void {
  const rateLimiter = new SocketRateLimiter(250);

  /**
   * Broadcasts personalized game state to all connected players in the room.
   */
  function broadcastPersonalizedState(state: InternalGameState): void {
    for (const player of state.players) {
      if (player.connected && player.socketId) {
        const personalized = serializePersonalizedGameState(state, player.id);
        io.to(player.socketId).emit(SERVER_EVENTS.GAME_STATE, personalized);
      }
    }
  }

  io.on('connection', (socket: Socket) => {
    socket.emit(SERVER_EVENTS.CONNECTION_STATUS, { status: 'connected', socketId: socket.id });

    // CREATE ROOM
    socket.on(CLIENT_EVENTS.ROOM_CREATE, (data: unknown, callback?: (res: unknown) => void) => {
      try {
        const parsed = createRoomSchema.safeParse(data);
        if (!parsed.success) {
          const errMsg = parsed.error.issues[0]?.message || 'Invalid payload';
          socket.emit(SERVER_EVENTS.GAME_ERROR, { message: errMsg });
          if (callback) callback({ success: false, error: errMsg });
          return;
        }

        const { roomCode, state, hostPlayer } = roomManager.createRoom(
          socket.id,
          parsed.data.name
        );
        socket.join(roomCode);

        const personalized = serializePersonalizedGameState(state, hostPlayer.id);

        socket.emit(SERVER_EVENTS.ROOM_CREATED, { roomCode, playerId: hostPlayer.id });
        socket.emit(SERVER_EVENTS.GAME_STATE, personalized);

        if (callback) callback({ success: true, roomCode, playerId: hostPlayer.id });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to create room';
        socket.emit(SERVER_EVENTS.GAME_ERROR, { message });
        if (callback) callback({ success: false, error: message });
      }
    });

    // JOIN ROOM
    socket.on(CLIENT_EVENTS.ROOM_JOIN, (data: unknown, callback?: (res: unknown) => void) => {
      try {
        const parsed = joinRoomSchema.safeParse(data);
        if (!parsed.success) {
          const errMsg = parsed.error.issues[0]?.message || 'Invalid payload';
          socket.emit(SERVER_EVENTS.GAME_ERROR, { message: errMsg });
          if (callback) callback({ success: false, error: errMsg });
          return;
        }

        const { state, player } = roomManager.joinRoom(
          parsed.data.roomCode,
          socket.id,
          parsed.data.name
        );
        socket.join(state.roomCode);

        socket.emit(SERVER_EVENTS.ROOM_JOINED, {
          roomCode: state.roomCode,
          playerId: player.id,
        });

        // Notify both players that game started
        io.to(state.roomCode).emit(SERVER_EVENTS.GAME_STARTED, {
          roomCode: state.roomCode,
        });

        // Broadcast personalized states
        broadcastPersonalizedState(state);

        if (callback) callback({ success: true, roomCode: state.roomCode, playerId: player.id });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to join room';
        socket.emit(SERVER_EVENTS.GAME_ERROR, { message });
        if (callback) callback({ success: false, error: message });
      }
    });

    // REQUEST STATE (e.g. on client refresh or mount)
    socket.on(CLIENT_EVENTS.GAME_REQUEST_STATE, () => {
      const context = roomManager.getContextBySocket(socket.id);
      if (!context) {
        socket.emit(SERVER_EVENTS.GAME_ERROR, { message: 'Not currently in an active room' });
        return;
      }
      const personalized = serializePersonalizedGameState(context.state, context.player.id);
      socket.emit(SERVER_EVENTS.GAME_STATE, personalized);
    });

    // SHOOT
    socket.on(CLIENT_EVENTS.GAME_SHOOT, (data: unknown, callback?: (res: unknown) => void) => {
      if (!rateLimiter.allow(socket.id)) {
        socket.emit(SERVER_EVENTS.GAME_ERROR, { message: 'Please slow down your actions' });
        if (callback) callback({ success: false, error: 'Throttled' });
        return;
      }

      try {
        const context = roomManager.getContextBySocket(socket.id);
        if (!context) {
          throw new ActionError('You are not in an active room');
        }

        const parsed = shootActionSchema.safeParse(data);
        if (!parsed.success) {
          const errMsg = parsed.error.issues[0]?.message || 'Invalid shoot target';
          throw new ActionError(errMsg);
        }

        const result = GameEngine.shoot(context.state, context.player.id, parsed.data.target);

        // Broadcast action result to room
        io.to(context.state.roomCode).emit(SERVER_EVENTS.GAME_ACTION_RESULT, result);

        // Broadcast updated states
        broadcastPersonalizedState(context.state);

        if (result.matchEnded) {
          io.to(context.state.roomCode).emit(SERVER_EVENTS.GAME_FINISHED, {
            winnerId: result.winnerId,
          });
        }

        if (callback) callback({ success: true, result });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to execute shoot';
        socket.emit(SERVER_EVENTS.GAME_ERROR, { message });
        if (callback) callback({ success: false, error: message });
      }
    });

    // ITEM
    socket.on(CLIENT_EVENTS.GAME_ITEM, (data: unknown, callback?: (res: unknown) => void) => {
      if (!rateLimiter.allow(socket.id)) {
        socket.emit(SERVER_EVENTS.GAME_ERROR, { message: 'Please slow down your actions' });
        if (callback) callback({ success: false, error: 'Throttled' });
        return;
      }

      try {
        const context = roomManager.getContextBySocket(socket.id);
        if (!context) {
          throw new ItemError('You are not in an active room');
        }

        const parsed = itemActionSchema.safeParse(data);
        if (!parsed.success) {
          const errMsg = parsed.error.issues[0]?.message || 'Invalid item';
          throw new ItemError(errMsg);
        }

        const result = GameEngine.useItem(context.state, context.player.id, parsed.data.item);

        // If item has private data (Magnifier), send ONLY to the user's socket!
        if (result.privateData) {
          socket.emit(SERVER_EVENTS.GAME_PRIVATE, {
            type: 'magnifier_reveal',
            item: result.item,
            revealedShell: result.privateData.revealedShell,
          });
        }

        // Broadcast updated state to all in room
        broadcastPersonalizedState(context.state);

        if (callback) callback({ success: true, item: result.item });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to use item';
        socket.emit(SERVER_EVENTS.GAME_ERROR, { message });
        if (callback) callback({ success: false, error: message });
      }
    });

    // REMATCH
    socket.on(CLIENT_EVENTS.GAME_REMATCH, () => {
      if (!rateLimiter.allow(socket.id)) return;

      try {
        const context = roomManager.getContextBySocket(socket.id);
        if (!context) {
          socket.emit(SERVER_EVENTS.GAME_ERROR, { message: 'Not in an active room' });
          return;
        }

        const result = GameEngine.requestRematch(context.state, context.player.id);

        if (result.rematchStarted) {
          io.to(context.state.roomCode).emit(SERVER_EVENTS.GAME_STARTED, {
            roomCode: context.state.roomCode,
          });
        }

        broadcastPersonalizedState(context.state);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Rematch error';
        socket.emit(SERVER_EVENTS.GAME_ERROR, { message });
      }
    });

    // LEAVE ROOM
    socket.on(CLIENT_EVENTS.ROOM_LEAVE, () => {
      const result = roomManager.leaveRoom(socket.id);
      if (result) {
        socket.leave(result.roomCode);
        const room = roomManager.getRoom(result.roomCode);
        if (room) {
          broadcastPersonalizedState(room);
        }
      }
    });

    // DISCONNECT
    socket.on('disconnect', () => {
      rateLimiter.cleanup(socket.id);
      const res = roomManager.handleDisconnect(socket.id);
      if (res && !res.isEmpty) {
        broadcastPersonalizedState(res.state);
      }
    });
  });
}

