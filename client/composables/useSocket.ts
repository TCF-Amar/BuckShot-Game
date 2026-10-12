import { ref } from 'vue';
import { io, Socket } from 'socket.io-client';
import { CLIENT_EVENTS, SERVER_EVENTS } from '../types/game';

let socketInstance: Socket | null = null;
const connectionStatus = ref<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
const lastSocketError = ref<string | null>(null);

export function useSocket() {
  const config = useRuntimeConfig();

  function resolveSocketUrl(): string {
    const configured = (config.public.socketUrl as string) || '';
    if (configured && configured !== 'http://localhost:4000') {
      return configured;
    }
    // In browser: connect to same origin (e.g. ngrok HTTPS or localhost:3000)
    // Nuxt/Vite dev server proxies /socket.io directly to http://localhost:4000
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return configured || 'http://localhost:4000';
  }

  function getSocket(): Socket {
    if (!socketInstance) {
      connectionStatus.value = 'connecting';
      const isNgrok = typeof window !== 'undefined' && window.location.hostname.includes('ngrok');

      socketInstance = io(resolveSocketUrl(), {
        path: '/socket.io',
        // On ngrok tunnels, use pure HTTP Long-Polling to bypass ngrok WebSocket drop & proxy limits
        transports: isNgrok ? ['polling'] : ['polling', 'websocket'],
        upgrade: !isNgrok,
        extraHeaders: {
          'ngrok-skip-browser-warning': 'true',
        },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 15,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      socketInstance.on('connect', () => {
        connectionStatus.value = 'connected';
        lastSocketError.value = null;
      });

      socketInstance.on('disconnect', () => {
        connectionStatus.value = 'disconnected';
      });

      socketInstance.on('connect_error', (err) => {
        // Do not flag error if socket is already connected via another transport
        if (!socketInstance?.connected) {
          connectionStatus.value = 'error';
          lastSocketError.value = err.message || 'Connection error';
        }
      });

      socketInstance.on(SERVER_EVENTS.GAME_ERROR, (data: { message?: string }) => {
        lastSocketError.value = data?.message || 'Server error';
      });
    }

    if (!socketInstance.connected && connectionStatus.value === 'disconnected') {
      socketInstance.connect();
    }

    return socketInstance;
  }

  function emitCreateRoom(name: string): Promise<{ success: boolean; roomCode?: string; error?: string }> {
    const s = getSocket();
    return new Promise((resolve) => {
      let resolved = false;

      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve({
            success: false,
            error: !s.connected
              ? 'Cannot connect to game server. Please ensure the backend is running.'
              : 'Server response timed out. Please try again.',
          });
        }
      }, 10000);

      const sendEmit = () => {
        const onCreated = (data: { roomCode: string }) => {
          if (!resolved && data?.roomCode) {
            resolved = true;
            clearTimeout(timer);
            s.off(SERVER_EVENTS.ROOM_CREATED, onCreated);
            resolve({ success: true, roomCode: data.roomCode });
          }
        };
        s.once(SERVER_EVENTS.ROOM_CREATED, onCreated);

        s.emit(CLIENT_EVENTS.ROOM_CREATE, { name }, (res: any) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            s.off(SERVER_EVENTS.ROOM_CREATED, onCreated);
            if (res?.success) {
              resolve({ success: true, roomCode: res.roomCode });
            } else {
              resolve({ success: false, error: res?.error || 'Failed to create room' });
            }
          }
        });
      };

      if (s.connected) {
        sendEmit();
      } else {
        s.once('connect', () => {
          if (!resolved) sendEmit();
        });
        s.connect();
      }
    });
  }

  function emitJoinRoom(
    roomCode: string,
    name: string
  ): Promise<{ success: boolean; roomCode?: string; error?: string }> {
    const s = getSocket();
    return new Promise((resolve) => {
      let resolved = false;

      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve({
            success: false,
            error: !s.connected
              ? 'Cannot connect to game server. Please ensure the backend is running.'
              : 'Server response timed out. Please check room code and try again.',
          });
        }
      }, 10000);

      const sendEmit = () => {
        const onJoined = (data: { roomCode: string }) => {
          if (!resolved && data?.roomCode) {
            resolved = true;
            clearTimeout(timer);
            s.off(SERVER_EVENTS.ROOM_JOINED, onJoined);
            resolve({ success: true, roomCode: data.roomCode });
          }
        };
        s.once(SERVER_EVENTS.ROOM_JOINED, onJoined);

        s.emit(CLIENT_EVENTS.ROOM_JOIN, { roomCode, name }, (res: any) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            s.off(SERVER_EVENTS.ROOM_JOINED, onJoined);
            if (res?.success) {
              resolve({ success: true, roomCode: res.roomCode });
            } else {
              resolve({ success: false, error: res?.error || 'Failed to join room' });
            }
          }
        });
      };

      if (s.connected) {
        sendEmit();
      } else {
        s.once('connect', () => {
          if (!resolved) sendEmit();
        });
        s.connect();
      }
    });
  }

  function emitShoot(target: 'self' | 'opponent'): Promise<any> {
    const s = getSocket();
    return new Promise((resolve) => {
      s.emit(CLIENT_EVENTS.GAME_SHOOT, { target }, (res: any) => {
        resolve(res);
      });
    });
  }

  function emitItem(item: 'magnifier' | 'cuffs' | 'medkit'): Promise<any> {
    const s = getSocket();
    return new Promise((resolve) => {
      s.emit(CLIENT_EVENTS.GAME_ITEM, { item }, (res: any) => {
        resolve(res);
      });
    });
  }

  function emitRematch(): void {
    const s = getSocket();
    s.emit(CLIENT_EVENTS.GAME_REMATCH);
  }

  function emitLeaveRoom(): void {
    const s = getSocket();
    s.emit(CLIENT_EVENTS.ROOM_LEAVE);
  }

  function emitRequestState(): void {
    const s = getSocket();
    s.emit(CLIENT_EVENTS.GAME_REQUEST_STATE);
  }

  function clearError(): void {
    lastSocketError.value = null;
  }

  return {
    getSocket,
    connectionStatus,
    lastSocketError,
    clearError,
    emitCreateRoom,
    emitJoinRoom,
    emitShoot,
    emitItem,
    emitRematch,
    emitLeaveRoom,
    emitRequestState,
  };
}

