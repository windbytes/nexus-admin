import { Layout } from 'antd';
import React from 'react';
import ScreenLock from '@/components/ScreenLock';
import Content from './Content';
import Header from './Header';
import LeftMenu from './LeftMenu';
import Footer from './Footer';

/**
 * 系统整体布局
 */
const Layouts: React.FC = () => {
  return (
    <>
      <Layout className="h-full">
        {/* 左边菜单区域 */}
        <LeftMenu />
        <Layout>
          {/* 顶部区域 */}
          <Header />
          {/* 中间主内容区域 */}
          <Content />
          {/* 底部区域 */}
          <Footer />
        </Layout>
      </Layout>
      {/* 锁屏区域 */}
      <ScreenLock />
    </>
  );
};

// 【优化】使用 React.memo 避免不必要的重渲染
export default React.memo(Layouts);
