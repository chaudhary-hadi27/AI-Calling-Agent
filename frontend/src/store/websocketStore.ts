import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { io, Socket } from 'socket.io-client';
import { API_CONFIG, WS_EVENTS } from '@/utils/constants';
import type { WebSocketMessage, Call, Campaign } from '@/types';

interface WebSocketState {
  // Connection state
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectAttempts: number;

  // Real-time data
  activeCalls: Call[];
  activeCallsCount: number;
  dashboardMetrics: any;
  lastMessage: WebSocketMessage | null;

  // Actions
  connect: (token?: string) => void;
  disconnect: () => void;
  subscribe: (event: string, callback: (data: any) => void) => void;
  unsubscribe: (event: string) => void;
  emit: (event: string, data: any) => void;
  updateActiveCalls: (calls: Call[]) => void;
  updateDashboardMetrics: (metrics: any) => void;
}

export const useWebSocketStore = create<WebSocketState>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      socket: null,
      isConnected: false,
      isConnecting: false,
      error: null,
      reconnectAttempts: 0,
      activeCalls: [],
      activeCallsCount: 0,
      dashboardMetrics: null,
      lastMessage: null,

      // Connect to WebSocket
      connect: (token?: string) => {
        const { socket, isConnected, isConnecting } = get();

        // Don't connect if already connected or connecting
        if (socket || isConnected || isConnecting) {
          return;
        }

        set((state) => {
          state.isConnecting = true;
          state.error = null;
        });

        try {
          const newSocket = io(API_CONFIG.WS_URL, {
            auth: {
              token: token || localStorage.getItem('auth_token'),
            },
            transports: ['websocket', 'polling'],
            timeout: 5000,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            maxReconnectionAttempts: 5,
          });

          // Connection successful
          newSocket.on('connect', () => {
            set((state) => {
              state.socket = newSocket;
              state.isConnected = true;
              state.isConnecting = false;
              state.error = null;
              state.reconnectAttempts = 0;
            });

            console.log('WebSocket connected');
          });

          // Connection error
          newSocket.on('connect_error', (error) => {
            set((state) => {
              state.isConnecting = false;
              state.error = error.message;
              state.reconnectAttempts += 1;
            });

            console.error('WebSocket connection error:', error);
          });

          // Disconnection
          newSocket.on('disconnect', (reason) => {
            set((state) => {
              state.isConnected = false;
              state.socket = null;
            });

            console.log('WebSocket disconnected:', reason);
          });

          // Reconnection attempts
          newSocket.on('reconnect_attempt', (attempt) => {
            set((state) => {
              state.reconnectAttempts = attempt;
            });
          });

          newSocket.on('reconnect', () => {
            set((state) => {
              state.reconnectAttempts = 0;
              state.error = null;
            });
          });

          // Real-time event handlers
          newSocket.on(WS_EVENTS.CALL_STATUS_UPDATE, (data: any) => {
            set((state) => {
              state.lastMessage = {
                type: WS_EVENTS.CALL_STATUS_UPDATE,
                data,
                timestamp: new Date().toISOString(),
              };

              // Update active calls if the call is in the list
              const callIndex = state.activeCalls.findIndex(call => call.id === data.call_id);
              if (callIndex !== -1) {
                state.activeCalls[callIndex] = { ...state.activeCalls[callIndex], ...data };
              }
            });
          });

          newSocket.on(WS_EVENTS.CAMPAIGN_UPDATE, (data: any) => {
            set((state) => {
              state.lastMessage = {
                type: WS_EVENTS.CAMPAIGN_UPDATE,
                data,
                timestamp: new Date().toISOString(),
              };
            });
          });

          newSocket.on(WS_EVENTS.DASHBOARD_UPDATE, (data: any) => {
            set((state) => {
              state.lastMessage = {
                type: WS_EVENTS.DASHBOARD_UPDATE,
                data,
                timestamp: new Date().toISOString(),
              };
              state.dashboardMetrics = data;
            });
          });

          newSocket.on(WS_EVENTS.SESSION_UPDATE, (data: any) => {
            set((state) => {
              state.lastMessage = {
                type: WS_EVENTS.SESSION_UPDATE,
                data,
                timestamp: new Date().toISOString(),
              };
              state.activeCallsCount = data.active_sessions_count || 0;
            });
          });

          set((state) => {
            state.socket = newSocket;
          });

        } catch (error: any) {
          set((state) => {
            state.isConnecting = false;
            state.error = error.message || 'Failed to connect to WebSocket';
          });
        }
      },

      // Disconnect from WebSocket
      disconnect: () => {
        const { socket } = get();

        if (socket) {
          socket.disconnect();

          set((state) => {
            state.socket = null;
            state.isConnected = false;
            state.isConnecting = false;
            state.error = null;
            state.reconnectAttempts = 0;
          });
        }
      },

      // Subscribe to custom events
      subscribe: (event: string, callback: (data: any) => void) => {
        const { socket } = get();

        if (socket && socket.connected) {
          socket.on(event, callback);
        }
      },

      // Unsubscribe from events
      unsubscribe: (event: string) => {
        const { socket } = get();

        if (socket) {
          socket.off(event);
        }
      },

      // Emit events to server
      emit: (event: string, data: any) => {
        const { socket } = get();

        if (socket && socket.connected) {
          socket.emit(event, data);
        }
      },

      // Update active calls
      updateActiveCalls: (calls: Call[]) => {
        set((state) => {
          state.activeCalls = calls;
          state.activeCallsCount = calls.length;
        });
      },

      // Update dashboard metrics
      updateDashboardMetrics: (metrics: any) => {
        set((state) => {
          state.dashboardMetrics = metrics;
        });
      },
    })),
    { name: 'websocket-store' }
  )
);

// Selectors
export const useWebSocketConnection = () => useWebSocketStore(state => ({
  isConnected: state.isConnected,
  isConnecting: state.isConnecting,
  error: state.error,
  reconnectAttempts: state.reconnectAttempts,
}));

export const useActiveCalls = () => useWebSocketStore(state => state.activeCalls);
export const useActiveCallsCount = () => useWebSocketStore(state => state.activeCallsCount);
export const useDashboardMetrics = () => useWebSocketStore(state => state.dashboardMetrics);
export const useLastWebSocketMessage = () => useWebSocketStore(state => state.lastMessage);

// Actions
export const useWebSocketActions = () => useWebSocketStore(state => ({
  connect: state.connect,
  disconnect: state.disconnect,
  subscribe: state.subscribe,
  unsubscribe: state.unsubscribe,
  emit: state.emit,
}));

// Hook for managing WebSocket lifecycle
export const useWebSocketManager = () => {
  const { isConnected, isConnecting, error } = useWebSocketConnection();
  const { connect, disconnect } = useWebSocketActions();

  // Auto-connect when component mounts
  React.useEffect(() => {
    if (!isConnected && !isConnecting) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        connect(token);
      }
    }

    // Cleanup on unmount
    return () => {
      if (isConnected) {
        disconnect();
      }
    };
  }, []);

  return {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
  };
};

// Hook for subscribing to specific events
export const useWebSocketEvent = (event: string, callback: (data: any) => void) => {
  const { subscribe, unsubscribe } = useWebSocketActions();

  React.useEffect(() => {
    subscribe(event, callback);

    return () => {
      unsubscribe(event);
    };
  }, [event, callback]);
};