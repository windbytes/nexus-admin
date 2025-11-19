import { useUserStore } from '@/stores/userStore';
import { Button, Result } from 'antd';
import type React from 'react';
import { useNavigate } from 'react-router';
import { useShallow } from 'zustand/shallow';

const App: React.FC = () => {
  const navigate = useNavigate();
  const homePath = useUserStore(useShallow((state) => state.homePath));
  return (
    <>
      <Result
        status="500"
        title="500"
        subTitle="抱歉，可能发生了一些内部服务错误"
        extra={
          <Button type="primary" onClick={() => navigate(homePath, { replace: true })}>
            回到首页
          </Button>
        }
      />
    </>
  );
};
export default App;
