import { Button, Result } from 'antd';
import type React from 'react';
import { useNavigate } from '@tanstack/react-router';

const App: React.FC = () => {
  const navigate = useNavigate();
  return (
    <>
      <Result
        status="500"
        title="500"
        subTitle="抱歉，可能发生了一些内部服务错误"
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
