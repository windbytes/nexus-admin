/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** GitHub OAuth App Client ID（与后端 github.client-id 对应） */
  readonly VITE_GITHUB_OAUTH_CLIENT_ID?: string;
  /** 须与 GitHub App 登记及后端 github.redirect-uri 完全一致 */
  readonly VITE_GITHUB_OAUTH_REDIRECT_URI?: string;
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
