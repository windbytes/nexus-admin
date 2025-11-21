/// <reference types="vite/client" />

// 扩展 HistoryState 类型
declare module '@tanstack/history' {
  interface HistoryState {
    type?: string;
    action?: string;
  }
}
