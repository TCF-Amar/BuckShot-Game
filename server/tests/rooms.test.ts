import { describe, it, expect, beforeEach } from 'vitest';
import { RoomManager } from '../src/game/room-manager.js';
import { GameEngine, ActionError } from '../src/game/engine.js';
import { serializePersonalizedGameState } from '../src/game/state-serializer.js';

describe('Room Manager and Multiplayer Lifecycle', () => {
  let roomManager: RoomManager;

  beforeEach(() => {
    roomManager = new RoomManager();
  });

  it('creates a room and accepts two players', () => {
    const { roomCode, hostPlayer } = roomManager.createRoom('socket_host', 'HostName');
    expect(roomCode).toMatch(/^[A-Z0-9]{6}$/);
    expect(hostPlayer.name).toBe('HostName');

    const { player } = roomManager.joinRoom(roomCode, 'socket_p2', 'GuestName');
    expect(player.name).toBe('GuestName');

    const room = roomManager.getRoom(roomCode);
    expect(room).toBeDefined();
    expect(room?.players.length).toBe(2);
    expect(room?.phase).toBe('playing');
  });

  it('rejects a 3rd player trying to join a full room', () => {
    const { roomCode } = roomManager.createRoom('socket_host', 'Host');
    roomManager.joinRoom(roomCode, 'socket_p2', 'Guest 1');

    expect(() => roomManager.joinRoom(roomCode, 'socket_p3', 'Guest 2')).toThrow(ActionError);
  });

  it('rejects joining with an invalid or nonexistent room code', () => {
    expect(() => roomManager.joinRoom('BAD', 'sock', 'Name')).toThrow(/Invalid room code format/);
    expect(() => roomManager.joinRoom('ZZZZZZ', 'sock', 'Name')).toThrow(/not found/);
  });

  it('provides properly personalized state to each player', () => {
    const { roomCode } = roomManager.createRoom('socket_host', 'Host');
    roomManager.joinRoom(roomCode, 'socket_p2', 'Guest');

    const room = roomManager.getRoom(roomCode)!;
    const p1 = room.players[0];
    const p2 = room.players[1];

    const p1State = serializePersonalizedGameState(room, p1.id);
    const p2State = serializePersonalizedGameState(room, p2.id);

    expect(p1State.myId).toBe(p1.id);
    expect(p1State.me?.name).toBe('Host');
    expect(p1State.opponent?.name).toBe('Guest');
    expect(p1State.isMyTurn).toBe(true);

    expect(p2State.myId).toBe(p2.id);
    expect(p2State.me?.name).toBe('Guest');
    expect(p2State.opponent?.name).toBe('Host');
    expect(p2State.isMyTurn).toBe(false);

    // Ensure hidden sequence is NOT leaked
    expect((p1State as any).shellSequence).toBeUndefined();
    expect((p2State as any).shellSequence).toBeUndefined();
  });

  it('requires both players to agree for a rematch', () => {
    const { roomCode } = roomManager.createRoom('socket_host', 'Host');
    roomManager.joinRoom(roomCode, 'socket_p2', 'Guest');
    const room = roomManager.getRoom(roomCode)!;

    // Simulate match finish
    room.phase = 'finished';
    room.winnerId = room.players[0].id;

    const p1 = room.players[0];
    const p2 = room.players[1];

    // P1 requests rematch
    const res1 = GameEngine.requestRematch(room, p1.id);
    expect(res1.rematchStarted).toBe(false);
    expect(res1.waitingForOther).toBe(true);
    expect(room.phase).toBe('finished');

    // P2 requests rematch
    const res2 = GameEngine.requestRematch(room, p2.id);
    expect(res2.rematchStarted).toBe(true);
    expect(res2.waitingForOther).toBe(false);
    expect(room.phase).toBe('playing');
    expect(room.roundNumber).toBe(1);
    expect(room.players[0].health).toBe(4);
    expect(room.players[1].health).toBe(4);
    expect(room.players[0].inventory.magnifier).toBe(1);
  });

  it('cleans up waiting room when host leaves', () => {
    const { roomCode } = roomManager.createRoom('socket_host', 'Host');
    expect(roomManager.getRoom(roomCode)).toBeDefined();

    const result = roomManager.leaveRoom('socket_host');
    expect(result?.destroyed).toBe(true);
    expect(roomManager.getRoom(roomCode)).toBeUndefined();
  });
});

