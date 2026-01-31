/**
 * @description: 封装websocket客户端
 * @author: wonderland
 * @date : 2025-03-08 11:20
 * @version: v1.0
 */
class WebSocketClient {
  private socket: WebSocket;

  // 重连间隔时间（毫秒）
  private reconnectInterval: number = 3000;
  // 最大重连次数
  private maxReconnectAttempts: number = 5;
  // 当前重连次数
  private reconnectAttempts: number = 0;

  // ping间隔
  private pingInterval: any;

  // 心跳间隔时间（毫秒）
  private heartbeatInterval: number = 30000;
  // 心跳超时时间（毫秒）
  private heartbeatTimeout: any;

  // 事件监听
  private listeners: { [event: string]: ((event: any) => void)[] } = {};

  constructor(private url: string) {
    this.socket = new WebSocket(this.url);
    this.initWebSocket();
  }

  private initWebSocket() {
    this.setupEventHandlers();
    this.setupHeartbeat();
  }

  /**
   * 设置事件监听
   */
  private setupEventHandlers() {
    // 监听socket打开
    this.socket.addEventListener('open', () => {
      console.log('WebSocket连接已打开');
      this.reconnectAttempts = 0;
      this.emit('open');
    });

    // 监听socket接收到消息
    this.socket.addEventListener('message', (event) => {
      console.log(`接收到消息: ${event.data}`);
      const data = JSON.parse(event.data);
      // 根据不同的消息类型触发不同的事件
      this.emit(data.type, data);
    });

    // 监听socket关闭
    this.socket.addEventListener('close', (event) => {
      console.log(`WebSocket连接已关闭，代码: ${event.code}，原因: ${event.reason}`);
      this.emit('close', event);
      this.reconnect();
    });

    // 监听socket错误
    this.socket.addEventListener('error', (event) => {
      console.error(`WebSocket连接发生错误: ${event}`);
      this.emit('error', event);
      this.reconnect();
    });
  }

  /**
   * 设置心跳监测
   */
  private setupHeartbeat() {
    this.pingInterval = setInterval(() => {
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'ping' }));
        this.heartbeatTimeout = setTimeout(() => {
          console.log('心跳超时，尝试重连');
          this.socket.close();
        }, this.heartbeatInterval * 2);
      }
    }, this.heartbeatInterval);
  }

  /**
   * 重连
   */
  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log('尝试重新连接 WebSocket，第', this.reconnectAttempts, '次');
      setTimeout(() => {
        this.initWebSocket();
      }, this.reconnectInterval * this.reconnectAttempts);
    } else {
      console.error('达到最大重连次数，停止重连');
    }
  }

  /**
   * 发送消息
   * @param message
   */
  public sendMessage(message: string) {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      console.error('WebSocket 连接未开启，无法发送消息');
    }
  }

  /**
   * 监听事件
   * @param event
   * @param callback
   */
  public on(event: string, callback: (event: any) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }
  /**
   * 移除事件监听
   * @param event
   * @param callback
   */
  public off(event: string, callback: (event: any) => void) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((listener) => listener !== callback);
    }
  }

  /**
   * 触发事件
   * @param event
   * @param data
   */
  private emit(event: string, data?: any) {
    if (this.listeners[event]) {
      // 遍历事件回调函数并执行
      for (const callback of this.listeners[event]) {
        callback(data);
      }
    }
  }

  /**
   * 关闭连接
   */
  public close() {
    this.socket.close();
    clearInterval(this.pingInterval);
    clearTimeout(this.heartbeatTimeout);
  }
}

// 导出单例
const webSocketClient = new WebSocketClient('ws://localhost:8080/ws');
export default webSocketClient;
