import type {
  InternalGameState,
  ShootTarget,
  ShootActionResult,
  PlayerState,
  ShellType,
} from '../types/game.js';
import { generateShellSequence } from '../utils/random.js';

export class ActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ActionError';
  }
}

/**
 * Executes a shooting action authoritatively.
 */
export function executeShoot(
  state: InternalGameState,
  playerId: string,
  target: ShootTarget
): ShootActionResult {
  if (state.phase !== 'playing') {
    throw new ActionError('Cannot fire: match is not currently in playing phase');
  }

  if (state.currentTurn !== playerId) {
    throw new ActionError('It is not your turn to fire');
  }

  if (target !== 'self' && target !== 'opponent') {
    throw new ActionError(`Invalid target: ${String(target)}`);
  }

  const shooter = state.players.find((p) => p.id === playerId);
  if (!shooter) {
    throw new ActionError('Shooter not found in match');
  }

  const opponent = state.players.find((p) => p.id !== playerId);
  if (!opponent) {
    throw new ActionError('Opponent not found in match');
  }

  const targetPlayer: PlayerState = target === 'self' ? shooter : opponent;

  const shellsRemaining = state.shellSequence.length - state.currentShellIndex;
  if (shellsRemaining <= 0) {
    throw new ActionError('No shells remaining in the chamber');
  }

  // Authoritatively consume exactly one shell
  const shellType: ShellType = state.shellSequence[state.currentShellIndex];
  state.currentShellIndex += 1;

  const wasSawedOff = state.sawedOff;
  // Sawed-off barrel effect is consumed on this shot
  state.sawedOff = false;

  let damageDealt = 0;
  let matchEnded = false;
  let winnerId: string | null = null;
  let turnRetained = false;
  let turnSkipped = false;
  let nextTurn: string | null = null;
  let roundEnded = false;

  const targetName = target === 'self' ? 'themselves' : opponent.name;

  if (shellType === 'live') {
    damageDealt = wasSawedOff ? 2 : 1;
    targetPlayer.health = Math.max(0, targetPlayer.health - damageDealt);

    const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    state.actionLog.push({
      id: logId,
      timestamp: Date.now(),
      type: 'shell_fired',
      actorId: playerId,
      message: wasSawedOff
        ? `${shooter.name} fired a SAWED-OFF LIVE shell at ${targetName}! CRITICAL HIT! (-${damageDealt} HP)`
        : `${shooter.name} shot ${targetName} with a LIVE shell! (-${damageDealt} HP)`,
      details: {
        shellType: 'live',
        target,
        damage: damageDealt,
        sawedOff: wasSawedOff,
      },
    });

    // Check for elimination
    if (targetPlayer.health === 0) {
      matchEnded = true;
      state.phase = 'finished';
      const winner = targetPlayer.id === shooter.id ? opponent : shooter;
      winnerId = winner.id;
      state.winnerId = winnerId;
      state.currentTurn = null;

      state.actionLog.push({
        id: `log_${Date.now()}_win`,
        timestamp: Date.now(),
        type: 'match_finished',
        actorId: winnerId,
        message: `${winner.name} wins the match!`,
        details: { winnerId },
      });

      return {
        shooterId: playerId,
        target,
        targetId: targetPlayer.id,
        shellType,
        damageDealt,
        sawedOff: wasSawedOff,
        targetRemainingHealth: targetPlayer.health,
        turnRetained: false,
        turnSkipped: false,
        nextTurn: null,
        roundEnded: false,
        matchEnded: true,
        winnerId,
      };
    }

    // Target survived live shell. Turn normally passes to the other player.
    const defaultNextTurnPlayer = target === 'self' ? opponent : opponent;
    // Check if the recipient of the turn has a pending skip
    if (defaultNextTurnPlayer.skippedTurnsPending > 0) {
      defaultNextTurnPlayer.skippedTurnsPending -= 1;
      turnSkipped = true;
      turnRetained = true;
      nextTurn = shooter.id;
      state.currentTurn = shooter.id;

      state.actionLog.push({
        id: `log_${Date.now()}_skip`,
        timestamp: Date.now(),
        type: 'turn_skipped',
        actorId: defaultNextTurnPlayer.id,
        message: `${defaultNextTurnPlayer.name}'s turn was skipped by Handcuffs!`,
      });
    } else {
      nextTurn = opponent.id;
      state.currentTurn = opponent.id;
    }
  } else {
    // Blank shell
    damageDealt = 0;

    const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    state.actionLog.push({
      id: logId,
      timestamp: Date.now(),
      type: 'shell_fired',
      actorId: playerId,
      message: `${shooter.name} shot ${targetName} with a BLANK shell. (Click)`,
      details: {
        shellType: 'blank',
        target,
        damage: 0,
        sawedOff: wasSawedOff,
      },
    });

    if (target === 'self') {
      // Shooting self with blank retains turn!
      turnRetained = true;
      nextTurn = shooter.id;
      state.currentTurn = shooter.id;
    } else {
      // Shooting opponent with blank passes turn to opponent
      if (opponent.skippedTurnsPending > 0) {
        opponent.skippedTurnsPending -= 1;
        turnSkipped = true;
        turnRetained = true;
        nextTurn = shooter.id;
        state.currentTurn = shooter.id;

        state.actionLog.push({
          id: `log_${Date.now()}_skip`,
          timestamp: Date.now(),
          type: 'turn_skipped',
          actorId: opponent.id,
          message: `${opponent.name}'s turn was skipped by Handcuffs!`,
        });
      } else {
        nextTurn = opponent.id;
        state.currentTurn = opponent.id;
      }
    }
  }

  // Check if shells are exhausted
  const remainingAfterShot = state.shellSequence.length - state.currentShellIndex;
  if (remainingAfterShot === 0 && !matchEnded) {
    roundEnded = true;
    startNewRound(state);
  }

  state.updatedAt = Date.now();

  return {
    shooterId: playerId,
    target,
    targetId: targetPlayer.id,
    shellType,
    damageDealt,
    sawedOff: wasSawedOff,
    targetRemainingHealth: targetPlayer.health,
    turnRetained,
    turnSkipped,
    nextTurn: state.currentTurn,
    roundEnded,
    matchEnded,
    winnerId,
  };
}

/**
 * Initializes a new round in an active match:
 * - Generates 3 to 6 shells per round (at least 1 live, at least 1 blank)
 * - Refreshes each player's inventory to 1 each (including Blade)
 * - Preserves remaining health
 * - Preserves current turn
 */
export function startNewRound(
  state: InternalGameState,
  totalShellsOverride?: number,
  liveCountOverride?: number
): void {
  state.roundNumber += 1;
  const { sequence, liveCount, blankCount } = generateShellSequence(
    totalShellsOverride,
    liveCountOverride
  );
  state.shellSequence = sequence;
  state.currentShellIndex = 0;
  state.sawedOff = false;
  state.roundLiveCount = liveCount;
  state.roundBlankCount = blankCount;

  // Refresh items for both players
  for (const player of state.players) {
    player.inventory = {
      magnifier: 1,
      cuffs: 1,
      medkit: 1,
      blade: 1,
    };
  }

  state.actionLog.push({
    id: `log_${Date.now()}_round_${state.roundNumber}`,
    timestamp: Date.now(),
    type: 'round_started',
    message: `Round ${state.roundNumber} begins! Chamber loaded: ${liveCount} LIVE, ${blankCount} BLANK (${sequence.length} total in random order). Items refreshed.`,
  });

  state.updatedAt = Date.now();
}
