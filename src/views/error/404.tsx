import { Button, Result } from 'antd';
import type React from 'react';
import { useNavigate } from '@tanstack/react-router';

const App: React.FC = () => {
  const navigate = useNavigate();
  return (
    <>
      <Result
        status="404"
        title="404"
        subTitle="抱歉，您访问的页面不存在。（可能正在开发中，敬请期待）"
        extra={
          <Button type="primary" onClick={() => navigate({ to: '/home' })}>
            回到首页
          </Button>
        }
      />
    </>
  );
};
export default App;
