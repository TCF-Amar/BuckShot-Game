import { describe, it, expect } from 'vitest';
import { GameEngine, ActionError } from '../src/game/engine.js';
import { generateShellSequence } from '../src/utils/random.js';
import { serializePublicGameState } from '../src/game/state-serializer.js';
import type { InternalGameState } from '../src/types/game.js';

describe('Game Engine - Shell Generation', () => {
  it('generates between 3 and 6 shells per round with at least 1 live and 1 blank', () => {
    for (let i = 0; i < 50; i++) {
      const { sequence, liveCount, blankCount } = generateShellSequence();
      expect(sequence.length).toBeGreaterThanOrEqual(3);
      expect(sequence.length).toBeLessThanOrEqual(6);
      expect(liveCount).toBeGreaterThanOrEqual(1);
      expect(blankCount).toBeGreaterThanOrEqual(1);
      expect(liveCount + blankCount).toBe(sequence.length);
    }
  });

  it('keeps sequence server-only; public state exposes only counts, not order', () => {
    const { state } = GameEngine.createGame('ABC123', 'sock1', 'Host');
    GameEngine.joinGame(state, 'sock2', 'Player2');

    const publicState = serializePublicGameState(state);
    expect((publicState as any).shellSequence).toBeUndefined();
    expect(publicState.roundLiveCount).toBeGreaterThanOrEqual(1);
    expect(publicState.roundBlankCount).toBeGreaterThanOrEqual(1);
    expect(publicState.shellsRemaining).toBe(publicState.roundLiveCount + publicState.roundBlankCount);
  });
});

describe('Game Engine - Shooting Mechanics', () => {
  function createTestMatch(shells: ('live' | 'blank')[]): InternalGameState {
    const { state } = GameEngine.createGame('TEST01', 'sock_p1', 'Player 1');
    GameEngine.joinGame(state, 'sock_p2', 'Player 2', shells);
    return state;
  }

  it('decreases target health by 1 on live shell and passes turn if target survives', () => {
    const state = createTestMatch(['live', 'blank']);
    const p1Id = state.players[0].id;
    const p2Id = state.players[1].id;

    expect(state.currentTurn).toBe(p1Id);
    expect(state.players[1].health).toBe(4);

    const result = GameEngine.shoot(state, p1Id, 'opponent');

    expect(result.shellType).toBe('live');
    expect(result.damageDealt).toBe(1);
    expect(state.players[1].health).toBe(3);
    expect(result.targetRemainingHealth).toBe(3);
    expect(state.currentTurn).toBe(p2Id);
    expect(result.matchEnded).toBe(false);
  });

  it('does not decrease health on blank shell and retains turn when shooting self', () => {
    const state = createTestMatch(['blank', 'live']);
    const p1Id = state.players[0].id;

    expect(state.currentTurn).toBe(p1Id);
    const result = GameEngine.shoot(state, p1Id, 'self');

    expect(result.shellType).toBe('blank');
    expect(result.damageDealt).toBe(0);
    expect(state.players[0].health).toBe(4);
    expect(result.turnRetained).toBe(true);
    expect(state.currentTurn).toBe(p1Id);
  });

  it('passes turn to opponent when shooting opponent with a blank shell', () => {
    const state = createTestMatch(['blank', 'live']);
    const p1Id = state.players[0].id;
    const p2Id = state.players[1].id;

    const result = GameEngine.shoot(state, p1Id, 'opponent');

    expect(result.shellType).toBe('blank');
    expect(result.turnRetained).toBe(false);
    expect(state.currentTurn).toBe(p2Id);
  });

  it('ends match and declares winner when health drops to zero', () => {
    const state = createTestMatch(['live']);
    const p1Id = state.players[0].id;

    // Set p2 to 1 health
    state.players[1].health = 1;

    const result = GameEngine.shoot(state, p1Id, 'opponent');

    expect(result.damageDealt).toBe(1);
    expect(state.players[1].health).toBe(0);
    expect(result.matchEnded).toBe(true);
    expect(result.winnerId).toBe(p1Id);
    expect(state.phase).toBe('finished');
    expect(state.winnerId).toBe(p1Id);
  });

  it('declares opponent winner if player shoots themselves to 0 health', () => {
    const state = createTestMatch(['live']);
    const p1Id = state.players[0].id;
    const p2Id = state.players[1].id;

    state.players[0].health = 1;

    const result = GameEngine.shoot(state, p1Id, 'self');

    expect(state.players[0].health).toBe(0);
    expect(result.matchEnded).toBe(true);
    expect(result.winnerId).toBe(p2Id);
    expect(state.winnerId).toBe(p2Id);
  });

  it('rejects shot if it is not the players turn', () => {
    const state = createTestMatch(['live', 'blank']);
    const p2Id = state.players[1].id;

    expect(state.currentTurn).not.toBe(p2Id);
    expect(() => GameEngine.shoot(state, p2Id, 'opponent')).toThrow(ActionError);
  });

  it('rejects actions after match is finished', () => {
    const state = createTestMatch(['live']);
    const p1Id = state.players[0].id;
    state.players[1].health = 1;

    GameEngine.shoot(state, p1Id, 'opponent');
    expect(state.phase).toBe('finished');

    expect(() => GameEngine.shoot(state, p1Id, 'opponent')).toThrow(ActionError);
  });

  it('starts a new round, refreshes items, and preserves health when shells are exhausted', () => {
    const state = createTestMatch(['blank']);
    const p1Id = state.players[0].id;

    state.players[0].health = 2;
    state.players[1].health = 3;
    state.players[0].inventory.magnifier = 0;
    state.players[1].inventory.medkit = 0;
    state.players[0].inventory.blade = 0;

    const result = GameEngine.shoot(state, p1Id, 'self');

    expect(result.roundEnded).toBe(true);
    expect(state.roundNumber).toBe(2);
    expect(state.shellSequence.length).toBeGreaterThanOrEqual(3);
    expect(state.shellSequence.length).toBeLessThanOrEqual(6);
    expect(state.currentShellIndex).toBe(0);
    // Health preserved
    expect(state.players[0].health).toBe(2);
    expect(state.players[1].health).toBe(3);
    // Items refreshed including blade
    expect(state.players[0].inventory.magnifier).toBe(1);
    expect(state.players[1].inventory.medkit).toBe(1);
    expect(state.players[0].inventory.blade).toBe(1);
  });
});
