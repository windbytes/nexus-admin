import { ToolOutlined } from '@ant-design/icons';
import { useLocation } from '@tanstack/react-router';
import { Card, Result, Tag, Typography } from 'antd';
import { useMenuStore } from '@/shared/stores/preferences.store';
import { searchRoute } from '@/shared/utils/utils';

/**
 * 动态路由占位页
 *
 * 当菜单对应的业务页面尚未实现（modules 下无 default 导出的页面文件）时，
 * 使用该占位页渲染，保证「后端菜单驱动路由」的链路可用且可见。
 * 真实页面补齐后会自动替换该占位。
 */
export function PlaceholderPage() {
  const { pathname } = useLocation();
  const menus = useMenuStore((state) => state.menus);
  const route = searchRoute(pathname, menus);
  const title = route?.meta?.title ?? pathname;

  return (
    <div className="p-2">
      <Card>
        <Result
          icon={<ToolOutlined className="text-(--ant-color-primary,#1677ff)" />}
          title={
            <Typography.Title level={4} className="mb-0!">
              {title}
            </Typography.Title>
          }
          subTitle={
            <div className="flex flex-col items-center gap-2">
              <span>该页面正在建设中，菜单 → 动态路由链路已打通。</span>
              <Tag>{pathname}</Tag>
            </div>
          }
        />
      </Card>
    </div>
  );
}

/** 404 页面 */
export function NotFoundPage() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Result status="404" title="404" subTitle="抱歉，您访问的页面不存在。" />
    </div>
  );
}

/** 403 页面 */
export function ForbiddenPage() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Result status="403" title="403" subTitle="抱歉，您没有访问该页面的权限。" />
    </div>
  );
}

/** 500 页面 */
export function ServerErrorPage() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Result status="500" title="500" subTitle="抱歉，服务器出现了一些问题。" />
    </div>
  );
}
