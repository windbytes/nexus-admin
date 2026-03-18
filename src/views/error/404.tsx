import { useNavigate } from '@tanstack/react-router';
import { Button, Result } from 'antd';
import type React from 'react';
import { useMenuStore } from '@/stores/store';
import { useUserStore } from '@/stores/userStore';
import { getFirstMenuPath } from '@/utils/utils';

const App: React.FC = () => {
  const navigate = useNavigate();
  const homePath = useUserStore((s) => s.homePath);
  const menus = useMenuStore((s) => s.menus);
  const fallbackHome = getFirstMenuPath(menus) ?? '/home';

  return (
    <Result
      status="404"
      title="404"
      subTitle="抱歉，您访问的页面不存在。（可能正在开发中，敬请期待）"
      extra={
        <Button
          type="primary"
          onClick={() => navigate({ to: homePath || fallbackHome })}
        >
          回到首页
        </Button>
      }
    />
  );
};
export default App;
