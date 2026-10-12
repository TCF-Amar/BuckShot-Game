export type ShellType = 'live' | 'blank';

export type ItemType = 'magnifier' | 'cuffs' | 'medkit' | 'blade';

export type MatchPhase = 'waiting' | 'playing' | 'finished' | 'abandoned';

export type ShootTarget = 'self' | 'opponent';

export interface PlayerInventory {
  magnifier: number;
  cuffs: number;
  medkit: number;
  blade: number;
}

export interface PlayerState {
  id: string;
  socketId: string;
  resumeToken: string;
  name: string;
  health: number;
  maxHealth: number;
  inventory: PlayerInventory;
  skippedTurnsPending: number;
  connected: boolean;
  rematchRequested: boolean;
}

export interface ActionLogEntry {
  id: string;
  timestamp: number;
  type:
    | 'match_started'
    | 'shell_fired'
    | 'item_used'
    | 'round_started'
    | 'turn_skipped'
    | 'match_finished'
    | 'player_joined'
    | 'player_disconnected'
    | 'player_reconnected';
  message: string;
  actorId?: string;
  details?: {
    shellType?: ShellType;
    target?: ShootTarget;
    item?: ItemType;
    damage?: number;
    winnerId?: string;
    sawedOff?: boolean;
    [key: string]: unknown;
  };
}

export interface InternalGameState {
  roomCode: string;
  phase: MatchPhase;
  roundNumber: number;
  hostId: string;
  players: [PlayerState, PlayerState] | [PlayerState];
  currentTurn: string | null;
  shellSequence: ShellType[];
  currentShellIndex: number;
  sawedOff: boolean;
  roundLiveCount: number;
  roundBlankCount: number;
  winnerId: string | null;
  actionLog: ActionLogEntry[];
  createdAt: number;
  updatedAt: number;
}

export interface PublicPlayerState {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  inventory: PlayerInventory;
  skippedTurnsPending: number;
  connected: boolean;
  rematchRequested: boolean;
}

export interface PublicGameState {
  roomCode: string;
  phase: MatchPhase;
  roundNumber: number;
  hostId: string;
  players: PublicPlayerState[];
  currentTurn: string | null;
  shellsRemaining: number;
  totalRoundShells: number;
  sawedOff: boolean;
  roundLiveCount: number;
  roundBlankCount: number;
  winnerId: string | null;
  actionLog: ActionLogEntry[];
}

export interface ClientPersonalizedState extends PublicGameState {
  myId: string;
  isMyTurn: boolean;
  me: PublicPlayerState | null;
  opponent: PublicPlayerState | null;
}

export interface ShootActionResult {
  shooterId: string;
  target: ShootTarget;
  targetId: string;
  shellType: ShellType;
  damageDealt: number;
  sawedOff: boolean;
  targetRemainingHealth: number;
  turnRetained: boolean;
  turnSkipped: boolean;
  nextTurn: string | null;
  roundEnded: boolean;
  matchEnded: boolean;
  winnerId: string | null;
}

export interface ItemActionResult {
  userId: string;
  item: ItemType;
  publicMessage: string;
  privateData?: {
    revealedShell?: ShellType;
  };
}

export interface SocketUserSession {
  playerId: string;
  roomCode: string;
  name: string;
  resumeToken: string;
}
