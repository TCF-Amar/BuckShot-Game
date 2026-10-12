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

export interface ClientPersonalizedState {
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

export interface MagnifierPrivateReveal {
  type: 'magnifier_reveal';
  item: 'magnifier';
  revealedShell: ShellType;
}

export const CLIENT_EVENTS = {
  ROOM_CREATE: 'room:create',
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
  GAME_SHOOT: 'game:shoot',
  GAME_ITEM: 'game:item',
  GAME_REMATCH: 'game:rematch',
  GAME_REQUEST_STATE: 'game:request-state',
} as const;

export const SERVER_EVENTS = {
  ROOM_CREATED: 'room:created',
  ROOM_JOINED: 'room:joined',
  GAME_STARTED: 'game:started',
  GAME_STATE: 'game:state',
  GAME_PRIVATE: 'game:private',
  GAME_ACTION_RESULT: 'game:action-result',
  GAME_FINISHED: 'game:finished',
  GAME_ERROR: 'game:error',
  CONNECTION_STATUS: 'connection:status',
} as const;
