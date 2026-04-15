export type WebSocketConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'authenticated' | 'error';

export interface WebSocketEnvelope<T = unknown> {
  type: string;
  payload: T;
  timestamp: number;
}

export interface SqlMessagePayload {
  sql: string;
  elapsedMs: number;
  elapsedText: string;
  operatorId?: string;
  operatorName?: string;
  queryParams?: string;
}

export interface ParamMessagePayload {
  action: 'create' | 'update' | 'delete';
  id: string;
  code: string;
  name: string;
  category: string;
  categoryName: string;
  value?: string;
  status: boolean;
  operatorId?: string;
  operatorName?: string;
  updatedAt: number;
}

export interface AnnouncementMessagePayload {
  id: string;
  title: string;
  content: string;
  level: 'info' | 'success' | 'warning' | 'error';
  publishedBy: string;
  publishedById: string;
  publishedAt: number;
}

export interface AckPayload {
  kind: 'auth' | 'subscribe' | 'pong';
  userId?: string;
  sqlEnabled?: boolean;
  paramEnabled?: boolean;
}

export interface ErrorPayload {
  message: string;
}

export interface MonitorPreferences {
  sqlEnabled: boolean;
  paramEnabled: boolean;
}

type WebSocketEventMap = {
  open: Event;
  close: CloseEvent;
  error: Event;
  status: WebSocketConnectionStatus;
  ack: WebSocketEnvelope<AckPayload>;
  serverError: WebSocketEnvelope<ErrorPayload>;
  sql: WebSocketEnvelope<SqlMessagePayload>;
  param: WebSocketEnvelope<ParamMessagePayload>;
  announcement: WebSocketEnvelope<AnnouncementMessagePayload>;
};

type WebSocketEventKey = keyof WebSocketEventMap;
type WebSocketListener<K extends WebSocketEventKey> = (event: WebSocketEventMap[K]) => void;

const WS_URL = import.meta.env.VITE_WS_URL;

class WebSocketClient {
  private socket: WebSocket | null = null;
  private reconnectInterval = 3000;
  private maxReconnectAttempts = 5;
  private reconnectAttempts = 0;
  private reconnectTimer: number | null = null;
  private pingInterval: number | null = null;
  private readonly heartbeatInterval = 30000;
  private readonly listeners = new Map<WebSocketEventKey, Set<(event: unknown) => void>>();
  private connectionStatus: WebSocketConnectionStatus = 'disconnected';
  private authToken = '';
  private manuallyClosed = false;
  private authenticated = false;
  private monitorPreferences: MonitorPreferences = {
    sqlEnabled: false,
    paramEnabled: false,
  };

  public connect(token: string) {
    if (!token) {
      return;
    }
    this.authToken = token;
    this.manuallyClosed = false;
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }
    this.createSocket();
  }

  public disconnect() {
    this.manuallyClosed = true;
    this.authenticated = false;
    this.clearReconnectTimer();
    this.stopHeartbeat();
    const currentSocket = this.socket;
    this.socket = null;
    if (currentSocket && currentSocket.readyState !== WebSocket.CLOSED) {
      currentSocket.close();
    }
    this.setStatus('disconnected');
  }

  public setMonitorPreferences(preferences: Partial<MonitorPreferences>) {
    this.monitorPreferences = {
      ...this.monitorPreferences,
      ...preferences,
    };
    this.sendSubscription();
  }

  public getMonitorPreferences() {
    return this.monitorPreferences;
  }

  public getStatus() {
    return this.connectionStatus;
  }

  public on<K extends WebSocketEventKey>(event: K, callback: WebSocketListener<K>) {
    const listeners = this.listeners.get(event) ?? new Set();
    listeners.add(callback as (event: unknown) => void);
    this.listeners.set(event, listeners);
  }

  public off<K extends WebSocketEventKey>(event: K, callback: WebSocketListener<K>) {
    const listeners = this.listeners.get(event);
    listeners?.delete(callback as (event: unknown) => void);
  }

  private createSocket() {
    this.clearReconnectTimer();
    this.stopHeartbeat();
    this.authenticated = false;
    this.setStatus('connecting');
    const socket = new WebSocket(WS_URL);
    this.socket = socket;
    socket.addEventListener('open', (event) => {
      this.reconnectAttempts = 0;
      this.setStatus('connected');
      this.emit('open', event);
      this.sendEnvelope('auth', {
        token: `Bearer ${this.authToken}`,
      });
    });
    socket.addEventListener('message', (event) => {
      const envelope = this.parseEnvelope(event.data);
      if (!envelope) {
        return;
      }
      switch (envelope.type) {
        case 'ack': {
          const ackEnvelope = envelope as WebSocketEnvelope<AckPayload>;
          if (ackEnvelope.payload.kind === 'auth') {
            this.authenticated = true;
            this.setStatus('authenticated');
            this.sendSubscription();
          }
          this.emit('ack', ackEnvelope);
          break;
        }
        case 'error':
          this.emit('serverError', envelope as WebSocketEnvelope<ErrorPayload>);
          this.setStatus('error');
          break;
        case 'sql':
          this.emit('sql', envelope as WebSocketEnvelope<SqlMessagePayload>);
          break;
        case 'param':
          this.emit('param', envelope as WebSocketEnvelope<ParamMessagePayload>);
          break;
        case 'announcement':
          this.emit('announcement', envelope as WebSocketEnvelope<AnnouncementMessagePayload>);
          break;
        default:
          break;
      }
    });
    socket.addEventListener('close', (event) => {
      this.stopHeartbeat();
      this.authenticated = false;
      this.emit('close', event);
      if (this.manuallyClosed) {
        this.setStatus('disconnected');
        return;
      }
      this.scheduleReconnect();
    });
    socket.addEventListener('error', (event) => {
      this.emit('error', event);
      this.setStatus('error');
    });
  }

  private parseEnvelope(data: string) {
    try {
      return JSON.parse(data) as WebSocketEnvelope;
    } catch (error) {
      console.error('解析 WebSocket 消息失败', error);
      return null;
    }
  }

  private sendSubscription() {
    if (!this.authenticated || this.socket?.readyState !== WebSocket.OPEN) {
      return;
    }
    this.sendEnvelope('subscribe', this.monitorPreferences);
    this.startHeartbeat();
  }

  private sendEnvelope(type: string, payload: object) {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      return;
    }
    this.socket.send(
      JSON.stringify({
        type,
        payload,
      })
    );
  }

  private scheduleReconnect() {
    if (!this.authToken || this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.setStatus('disconnected');
      return;
    }
    this.reconnectAttempts += 1;
    const reconnectDelay = this.reconnectInterval * this.reconnectAttempts;
    this.reconnectTimer = window.setTimeout(() => {
      this.createSocket();
    }, reconnectDelay);
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.pingInterval = window.setInterval(() => {
      this.sendEnvelope('ping', {});
    }, this.heartbeatInterval);
  }

  private stopHeartbeat() {
    if (this.pingInterval !== null) {
      window.clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private emit<K extends WebSocketEventKey>(event: K, data: WebSocketEventMap[K]) {
    const listeners = this.listeners.get(event);
    if (!listeners) {
      return;
    }
    for (const listener of listeners) {
      listener(data);
    }
  }

  private setStatus(status: WebSocketConnectionStatus) {
    this.connectionStatus = status;
    this.emit('status', status);
  }
}

const webSocketClient = new WebSocketClient();

export default webSocketClient;
