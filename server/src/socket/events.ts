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

