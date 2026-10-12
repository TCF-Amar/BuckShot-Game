import crypto from 'node:crypto';
import type { ShellType } from '../types/game.js';

/**
 * Returns a cryptographically secure random integer in [min, max] (inclusive).
 */
export function getRandomInt(min: number, max: number): number {
  return crypto.randomInt(min, max + 1);
}

/**
 * Shuffles an array in-place using Fisher-Yates with crypto.randomInt.
 */
export function secureShuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = getRandomInt(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export interface ShellGenerationResult {
  sequence: ShellType[];
  liveCount: number;
  blankCount: number;
}

/**
 * Generates a round shell sequence:
 * - Minimum 3, Maximum 6 shells per round (unless totalShellsOverride provided)
 * - At least 1 live shell and 1 blank shell
 * - Shuffled cryptographically
 */
export function generateShellSequence(
  totalShellsOverride?: number,
  liveCountOverride?: number
): ShellGenerationResult {
  const total = totalShellsOverride !== undefined ? totalShellsOverride : getRandomInt(3, 6);
  
  // Ensure at least 1 live and 1 blank
  const liveCount = liveCountOverride !== undefined 
    ? liveCountOverride 
    : getRandomInt(1, total - 1);
  const blankCount = total - liveCount;

  const sequence: ShellType[] = [
    ...Array<ShellType>(liveCount).fill('live'),
    ...Array<ShellType>(blankCount).fill('blank'),
  ];

  return {
    sequence: secureShuffle(sequence),
    liveCount,
    blankCount,
  };
}

/**
 * Generate a random token for player reconnection/resume
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}
