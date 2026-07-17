import { Layout, Watermark } from 'antd';
import { useShallow } from 'zustand/shallow';
import { usePreferencesStore } from '@/shared/stores/preferences.store';
import type { LayoutType } from '@/types/app';
import Content from '../components/Content';
import Footer from '../components/Footer';
import Header from '../components/Header';
import LeftMenu from '../components/LeftMenu';

/** 水平导航布局下不渲染侧边栏 */
const HORIZONTAL_LAYOUT: LayoutType = 'header-nav';

/**
 * 基础后台布局
 *
 * 侧边栏 + Header + 多页签内容区 + Footer，适用于绝大多数业务页面。
 * 通过偏好设置（usePreferencesStore）驱动导航模式与水印开关。
 */
export default function BasicLayout() {
  const { watermarkEnabled, layout } = usePreferencesStore(
    useShallow((state) => ({
      watermarkEnabled: state.preferences.app.watermark,
      layout: state.preferences.app.layout,
    }))
  );

  return (
    <Watermark content={watermarkEnabled ? 'Syndra Pro' : ''} gap={[80, 80]} className="w-full h-full">
      <Layout className="h-full">
        {layout !== HORIZONTAL_LAYOUT && <LeftMenu />}
        <Layout>
          <Header />
          <Content />
          <Footer />
        </Layout>
      </Layout>
    </Watermark>
  );
}
