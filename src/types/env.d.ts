interface ImportMetaEnv {
  /** GitHub OAuth App Client ID（与后端 github.client-id 对应） */
  readonly VITE_GITHUB_OAUTH_CLIENT_ID?: string;
  /** 须与 GitHub App 登记及后端 github.redirect-uri 完全一致 */
  readonly VITE_GITHUB_OAUTH_REDIRECT_URI?: string;
  /** 前端 WebSocket 连接地址 */
  readonly VITE_WS_URL: string;
  /** 本地开发 API 代理目标地址 */
  readonly VITE_API_PROXY_TARGET?: string;
  /** 本地开发 Netty WebSocket 代理目标（与后端 websocket.netty.port 一致） */
  readonly VITE_WS_PROXY_TARGET?: string;
  /** 本地开发服务器端口 */
  readonly VITE_DEV_SERVER_PORT?: string;
  /** 是否启用全局实时监控台 */
  readonly VITE_ENABLE_MONITOR_CONSOLE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// 扩展 HistoryState 类型
declare module '@tanstack/history' {
  interface HistoryState {
    type?: string;
    action?: string;
  }
}
