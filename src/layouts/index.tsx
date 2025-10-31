import { usePreferencesStore } from '@/stores/store';
import { Layout } from 'antd';
import { lazy, memo, Suspense } from 'react';
import Content from './Content';
import Footer from './Footer';
import Header from './Header';
import LeftMenu from './LeftMenu';

// 懒加载锁屏组件，只在需要时才加载
const ScreenLock = lazy(() => import('@/components/ScreenLock'));

/**
 * 系统整体布局
 * 性能优化：
 * 1. 使用 memo 避免不必要的重渲染
 * 2. 懒加载 ScreenLock 组件
 * 3. 条件渲染 ScreenLock，避免总是挂载
 */
const Layouts = memo(() => {
  // 只获取锁屏状态，用于条件渲染
  const lockScreenStatus = usePreferencesStore((state) => state.preferences.widget.lockScreenStatus);

  return (
    <>
      <Layout className="h-full">
        <LeftMenu />
        <Layout>
          <Header />
          <Content />
          <Footer />
        </Layout>
      </Layout>
      {/* 只在锁屏状态为 true 时才渲染 ScreenLock 组件 */}
      {lockScreenStatus && (
        <Suspense fallback={null}>
          <ScreenLock />
        </Suspense>
      )}
    </>
  );
});

Layouts.displayName = 'Layouts';

export default Layouts;
