import { getRandomInt } from './random.js';

// Unambiguous uppercase alphanumeric characters (no 0, O, 1, I, L)
const CODE_CHARACTERS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Generates a human-readable 6-character room code.
 */
export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    const idx = getRandomInt(0, CODE_CHARACTERS.length - 1);
    code += CODE_CHARACTERS[idx];
  }
  return code;
}

/**
 * Normalizes user input room code: trim whitespace and uppercase.
 */
export function normalizeRoomCode(raw: string): string {
  return (raw || '').trim().toUpperCase();
}

/**
 * Validates whether a room code is valid format (6 alphanumeric chars).
 */
export function isValidRoomCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code);
}

