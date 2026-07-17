import BasicLayout from '../BasicLayout';

/**
 * 工作台布局
 *
 * 用于工作台 / 个人中心 / 多区块仪表盘等强调聚合视图的页面。
 * 目前复用基础后台布局的整体框架，后续可在此扩展个性化区块。
 */
export default function WorkspaceLayout() {
  return <BasicLayout />;
}
