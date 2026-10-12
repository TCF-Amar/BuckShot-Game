import type {
  InternalGameState,
  ItemType,
  ItemActionResult,
  PlayerState,
} from '../types/game.js';

export class ItemError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ItemError';
  }
}

/**
 * Validates and applies an item action.
 */
export function applyItem(
  state: InternalGameState,
  playerId: string,
  item: ItemType
): ItemActionResult {
  if (state.phase !== 'playing') {
    throw new ItemError('Items can only be used during an active match');
  }

  if (state.currentTurn !== playerId) {
    throw new ItemError('You can only use items during your turn');
  }

  const player = state.players.find((p) => p.id === playerId);
  if (!player) {
    throw new ItemError('Player not found in match');
  }

  const opponent = state.players.find((p) => p.id !== playerId);

  // Validate inventory
  if (player.inventory[item] <= 0) {
    throw new ItemError(`You have already used your ${item} this round`);
  }

  switch (item) {
    case 'blade': {
      if (state.sawedOff) {
        throw new ItemError('The shotgun barrel is already sawed off!');
      }

      // Consume blade
      player.inventory.blade -= 1;
      state.sawedOff = true;

      const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      state.actionLog.push({
        id: logId,
        timestamp: Date.now(),
        type: 'item_used',
        actorId: playerId,
        message: `${player.name} sawed off the shotgun with a Blade! Next shot deals DOUBLE DAMAGE (2 HP)!`,
        details: { item: 'blade', sawedOff: true },
      });

      return {
        userId: playerId,
        item: 'blade',
        publicMessage: `${player.name} sawed off the shotgun barrel! Next shot deals 2 DMG!`,
      };
    }

    case 'magnifier': {
      const shellsRemaining = state.shellSequence.length - state.currentShellIndex;
      if (shellsRemaining <= 0) {
        throw new ItemError('No shells remaining to inspect');
      }

      // Consume item
      player.inventory.magnifier -= 1;

      const nextShell = state.shellSequence[state.currentShellIndex];

      const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      state.actionLog.push({
        id: logId,
        timestamp: Date.now(),
        type: 'item_used',
        actorId: playerId,
        message: `${player.name} examined the chamber with a Magnifier.`,
        details: { item: 'magnifier' },
      });

      return {
        userId: playerId,
        item: 'magnifier',
        publicMessage: `${player.name} examined the chamber with a Magnifier.`,
        privateData: {
          revealedShell: nextShell,
        },
      };
    }

    case 'cuffs': {
      if (!opponent) {
        throw new ItemError('Opponent not found');
      }

      // Consume item
      player.inventory.cuffs -= 1;

      // Mark opponent for 1 skipped turn
      opponent.skippedTurnsPending += 1;

      const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      state.actionLog.push({
        id: logId,
        timestamp: Date.now(),
        type: 'item_used',
        actorId: playerId,
        message: `${player.name} locked Handcuffs on ${opponent.name}.`,
        details: { item: 'cuffs' },
      });

      return {
        userId: playerId,
        item: 'cuffs',
        publicMessage: `${player.name} locked Handcuffs on ${opponent.name}.`,
      };
    }

    case 'medkit': {
      if (player.health >= player.maxHealth) {
        throw new ItemError('Health is already at maximum (4)');
      }

      // Consume item
      player.inventory.medkit -= 1;

      // Restore 1 health capped at maxHealth
      player.health = Math.min(player.maxHealth, player.health + 1);

      const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      state.actionLog.push({
        id: logId,
        timestamp: Date.now(),
        type: 'item_used',
        actorId: playerId,
        message: `${player.name} used a Medkit and restored 1 health. (${player.health}/${player.maxHealth})`,
        details: { item: 'medkit' },
      });

      return {
        userId: playerId,
        item: 'medkit',
        publicMessage: `${player.name} used a Medkit and restored 1 health.`,
      };
    }

    default:
      throw new ItemError(`Unknown item: ${String(item)}`);
  }
}
