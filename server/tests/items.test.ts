import { describe, it, expect } from 'vitest';
import { GameEngine, ItemError } from '../src/game/engine.js';
import type { InternalGameState } from '../src/types/game.js';

describe('Strategic Items Engine', () => {
  function createTestMatch(shells: ('live' | 'blank')[]): InternalGameState {
    const { state } = GameEngine.createGame('TEST02', 'sock_p1', 'Player 1');
    GameEngine.joinGame(state, 'sock_p2', 'Player 2', shells);
    return state;
  }

  describe('Blade (Handsaw)', () => {
    it('saws off shotgun barrel and doubles damage to 2 on next live shot', () => {
      const state = createTestMatch(['live', 'live']);
      const p1Id = state.players[0].id;
      const p2Id = state.players[1].id;

      expect(state.players[0].inventory.blade).toBe(1);
      expect(state.sawedOff).toBe(false);

      const result = GameEngine.useItem(state, p1Id, 'blade');
      expect(result.item).toBe('blade');
      expect(state.sawedOff).toBe(true);
      expect(state.players[0].inventory.blade).toBe(0);

      // Now fire at opponent with sawed-off shotgun
      const shootResult = GameEngine.shoot(state, p1Id, 'opponent');
      expect(shootResult.damageDealt).toBe(2); // 2 DAMAGE!
      expect(shootResult.sawedOff).toBe(true);
      expect(state.players[1].health).toBe(2); // 4 - 2 = 2 HP
      // Sawed-off resets after shot
      expect(state.sawedOff).toBe(false);
    });

    it('consumes sawed-off effect on a blank shot without dealing damage', () => {
      const state = createTestMatch(['blank', 'live']);
      const p1Id = state.players[0].id;

      GameEngine.useItem(state, p1Id, 'blade');
      expect(state.sawedOff).toBe(true);

      const shootResult = GameEngine.shoot(state, p1Id, 'self');
      expect(shootResult.damageDealt).toBe(0);
      expect(state.players[0].health).toBe(4);
      expect(state.sawedOff).toBe(false); // Resets back to false
    });

    it('rejects using blade twice if barrel is already sawed off', () => {
      const state = createTestMatch(['live', 'blank']);
      const p1Id = state.players[0].id;

      GameEngine.useItem(state, p1Id, 'blade');
      // Give fake extra blade to test sawed-off check
      state.players[0].inventory.blade = 1;
      expect(() => GameEngine.useItem(state, p1Id, 'blade')).toThrow('already sawed off');
    });
  });

  describe('Magnifier', () => {
    it('reveals the next shell without consuming it and does not advance turn', () => {
      const state = createTestMatch(['live', 'blank']);
      const p1Id = state.players[0].id;

      expect(state.players[0].inventory.magnifier).toBe(1);
      expect(state.currentShellIndex).toBe(0);

      const result = GameEngine.useItem(state, p1Id, 'magnifier');

      expect(result.item).toBe('magnifier');
      expect(result.privateData?.revealedShell).toBe('live');
      // Item consumed
      expect(state.players[0].inventory.magnifier).toBe(0);
      // Shell NOT consumed
      expect(state.currentShellIndex).toBe(0);
      // Turn unchanged
      expect(state.currentTurn).toBe(p1Id);
    });

    it('rejects magnifier if already used this round', () => {
      const state = createTestMatch(['live', 'blank']);
      const p1Id = state.players[0].id;

      GameEngine.useItem(state, p1Id, 'magnifier');
      expect(() => GameEngine.useItem(state, p1Id, 'magnifier')).toThrow(ItemError);
    });

    it('rejects magnifier if out of turn', () => {
      const state = createTestMatch(['live', 'blank']);
      const p2Id = state.players[1].id;

      expect(() => GameEngine.useItem(state, p2Id, 'magnifier')).toThrow(ItemError);
    });
  });

  describe('Cuffs', () => {
    it('skips opponent next turn when turn passes to them', () => {
      const state = createTestMatch(['live', 'live']);
      const p1Id = state.players[0].id;
      const p2Id = state.players[1].id;

      // P1 uses cuffs
      const cuffResult = GameEngine.useItem(state, p1Id, 'cuffs');
      expect(cuffResult.item).toBe('cuffs');
      expect(state.players[0].inventory.cuffs).toBe(0);
      expect(state.players[1].skippedTurnsPending).toBe(1);
      expect(state.currentTurn).toBe(p1Id);

      // P1 shoots opponent with live shell
      const shootResult = GameEngine.shoot(state, p1Id, 'opponent');
      expect(shootResult.damageDealt).toBe(1);
      expect(shootResult.turnSkipped).toBe(true);
      expect(shootResult.turnRetained).toBe(true);
      expect(state.currentTurn).toBe(p1Id);
      expect(state.players[1].skippedTurnsPending).toBe(0);
    });

    it('handles cuffs when shooting opponent with a blank shell', () => {
      const state = createTestMatch(['blank', 'live']);
      const p1Id = state.players[0].id;

      GameEngine.useItem(state, p1Id, 'cuffs');
      const shootResult = GameEngine.shoot(state, p1Id, 'opponent');

      expect(shootResult.turnSkipped).toBe(true);
      expect(state.currentTurn).toBe(p1Id);
    });
  });

  describe('Medkit', () => {
    it('rejects medkit if health is already at max (4)', () => {
      const state = createTestMatch(['live', 'blank']);
      const p1Id = state.players[0].id;

      expect(state.players[0].health).toBe(4);
      expect(() => GameEngine.useItem(state, p1Id, 'medkit')).toThrow('Health is already at maximum (4)');
    });

    it('restores 1 health capped at maxHealth and does not advance turn', () => {
      const state = createTestMatch(['live', 'blank']);
      const p1Id = state.players[0].id;

      state.players[0].health = 2;
      const result = GameEngine.useItem(state, p1Id, 'medkit');

      expect(result.item).toBe('medkit');
      expect(state.players[0].health).toBe(3);
      expect(state.players[0].inventory.medkit).toBe(0);
      expect(state.currentTurn).toBe(p1Id);
    });

    it('cannot reuse medkit in the same round', () => {
      const state = createTestMatch(['live', 'blank']);
      const p1Id = state.players[0].id;

      state.players[0].health = 2;
      GameEngine.useItem(state, p1Id, 'medkit');
      expect(() => GameEngine.useItem(state, p1Id, 'medkit')).toThrow(ItemError);
    });
  });
});
