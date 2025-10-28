import ScreenLock from '@/components/ScreenLock';
import { Layout } from 'antd';
import React from 'react';
import Content from './Content';
import Footer from './Footer';
import Header from './Header';
import LeftMenu from './LeftMenu';

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

export default Layouts;
