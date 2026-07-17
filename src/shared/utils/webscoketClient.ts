import { useUserStore } from '@/shared/stores/user.store';

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
  code?: number;
  success?: boolean;
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

function resolveWebSocketUrl(): string {
  const configuredUrl = import.meta.env.VITE_WS_URL?.trim();
  if (configuredUrl) {
    return configuredUrl;
  }
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/api/ws/syndra`;
  }
  return 'ws://localhost:8891/ws/syndra';
}

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
  /**
   * 是否正在等待业务侧 HTTP 拦截器完成 token 刷新。
   * 该状态下不走普通重连逻辑，由 handleTokenUpdated 监听到 store 更新后自动触发重连。
   */
  private waitingForTokenRenewal = false;
  private tokenRenewalTimeoutTimer: number | null = null;
  /** 等待业务侧刷新 token 的最长时间（10 分钟），超时后放弃重连 */
  private readonly maxTokenRenewalWaitMs = 10 * 60 * 1000;
  private monitorPreferences: MonitorPreferences = {
    sqlEnabled: false,
    paramEnabled: false,
  };

  constructor() {
    // 订阅 accessToken 变化：HTTP 拦截器刷新 token 后会调用 userStore.setAccessToken，
    // 此处监听变化并在等待续期时立即重连，无需 WebSocket 层自行调用 refresh 接口。
    useUserStore.subscribe((state, prevState) => {
      if (state.accessToken && state.accessToken !== prevState.accessToken) {
        this.handleTokenUpdated(state.accessToken);
      }
    });
  }

  public connect(token: string) {
    if (!token) {
      return;
    }
    this.authToken = token;
    this.manuallyClosed = false;
    // 显式调用 connect 时清除续期等待状态（如重新登录等场景）
    this.waitingForTokenRenewal = false;
    this.clearTokenRenewalTimer();
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }
    this.createSocket();
  }

  public disconnect() {
    this.manuallyClosed = true;
    this.authenticated = false;
    this.waitingForTokenRenewal = false;
    this.clearTokenRenewalTimer();
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

  /**
   * store 中 accessToken 发生变化时调用（由构造函数中的 subscribe 触发）。
   * 仅在等待续期状态下才触发重连；其他情况仅更新缓存的 token。
   */
  private handleTokenUpdated(newToken: string) {
    this.authToken = newToken;
    if (!this.waitingForTokenRenewal) {
      return;
    }
    this.clearTokenRenewalTimer();
    this.waitingForTokenRenewal = false;
    this.reconnectAttempts = 0;
    this.createSocket();
  }

  /**
   * 进入"等待业务侧刷新 token"状态。
   * 在此期间不走普通重连，等 HTTP 拦截器刷新成功后由 handleTokenUpdated 重连。
   * 超过 maxTokenRenewalWaitMs 后自动放弃，避免永久挂起。
   */
  private enterTokenRenewalWait() {
    if (this.waitingForTokenRenewal) {
      return;
    }
    this.waitingForTokenRenewal = true;
    this.tokenRenewalTimeoutTimer = window.setTimeout(() => {
      this.tokenRenewalTimeoutTimer = null;
      this.waitingForTokenRenewal = false;
      this.setStatus('disconnected');
    }, this.maxTokenRenewalWaitMs);
  }

  private createSocket() {
    this.clearReconnectTimer();
    this.stopHeartbeat();
    this.authenticated = false;
    this.setStatus('connecting');
    const socket = new WebSocket(resolveWebSocketUrl());
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
        case 'error': {
          const errorEnvelope = envelope as WebSocketEnvelope<ErrorPayload>;
          this.emit('serverError', errorEnvelope);
          this.setStatus('error');
          if (errorEnvelope.payload.code === 401) {
            // accessToken 失效：不在 WebSocket 层主动调用 refresh 接口，
            // 等待普通业务请求触发 HTTP 拦截器完成刷新，再由 handleTokenUpdated 重连。
            this.enterTokenRenewalWait();
          }
          break;
        }
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
      // 1) disconnect() 已把 this.socket 置空：旧连接的 close 不应再走重连逻辑。
      // 2) handleTokenUpdated 已建立新 socket 时，忽略旧 socket 晚到的 close。
      if (this.socket === null || event.target !== this.socket) {
        return;
      }
      this.stopHeartbeat();
      this.authenticated = false;
      this.emit('close', event);
      if (this.manuallyClosed) {
        this.setStatus('disconnected');
        return;
      }
      if (this.waitingForTokenRenewal) {
        // 连接因 token 失效被服务端关闭，等待 HTTP 层刷新 token 后再重连，不走普通重连
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

  private clearTokenRenewalTimer() {
    if (this.tokenRenewalTimeoutTimer !== null) {
      window.clearTimeout(this.tokenRenewalTimeoutTimer);
      this.tokenRenewalTimeoutTimer = null;
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
