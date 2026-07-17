import { AppRouter } from '@/app/router';

/**
 * 主应用
 *
 * 全局初始化逻辑由 AppProvider 各层 Provider 承担，这里只负责渲染路由入口。
 */
export default function App() {
  return <AppRouter />;
}
