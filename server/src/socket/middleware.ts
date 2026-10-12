export class SocketRateLimiter {
  private lastActionTime: Map<string, number> = new Map();
  private readonly minIntervalMs: number;

  constructor(minIntervalMs: number = 300) {
    this.minIntervalMs = minIntervalMs;
  }

  /**
   * Checks if socket is allowed to perform action. Returns true if allowed, false if throttled.
   */
  allow(socketId: string): boolean {
    const now = Date.now();
    const last = this.lastActionTime.get(socketId) || 0;
    if (now - last < this.minIntervalMs) {
      return false;
    }
    this.lastActionTime.set(socketId, now);
    return true;
  }

  cleanup(socketId: string): void {
    this.lastActionTime.delete(socketId);
  }
}

