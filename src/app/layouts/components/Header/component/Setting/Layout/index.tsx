import Block from '../Block';
import Breadcrumb from './Breadcrumb';
import Content from './Content';
import CopyRight from './CopyRight';
import Footer from './Footer';
import Header from './Header';
import MyLayout from './MyLayout';
import Navigation from './navigation';
import SideBar from './SideBar';
import TabBar from './TabBar';
import Widget from './Widget';

const Layout: React.FC = () => {
  return (
    <>
      {/* 布局 */}
      <Block title="布局">
        <MyLayout />
      </Block>
      {/* 内容 */}
      <Block title="内容">
        <Content />
      </Block>
      {/* 侧边栏 */}
      <Block title="侧边栏">
        <SideBar />
      </Block>
      {/* 顶栏 */}
      <Block title="顶栏">
        <Header />
      </Block>
      {/* 导航菜单 */}
      <Block title="导航菜单">
        <Navigation />
      </Block>
      {/* 面包屑导航 */}
      <Block title="面包屑导航">
        <Breadcrumb />
      </Block>
      {/* 标签栏 */}
      <Block title="标签栏">
        <TabBar />
      </Block>
      {/* 小部件 */}
      <Block title="小部件">
        <Widget />
      </Block>
      {/* 底栏 */}
      <Block title="底栏">
        <Footer />
      </Block>
      {/* 版权 */}
      <Block title="版权">
        <CopyRight />
      </Block>
    </>
  );
};
export default Layout;
