import { useNavigate } from '@tanstack/react-router';
import { Spin } from 'antd';
import type React from 'react';
import { useEffect } from 'react';

const GH_CODE_KEY = 'syndra_github_oauth_code';

/**
 * GitHub OAuth 回调页：将 code 写入 sessionStorage 后回到登录页完成 token 交换。
 */
const GitHubOAuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    if (err) {
      sessionStorage.removeItem(GH_CODE_KEY);
      navigate({ to: '/login', replace: true });
      return;
    }
    const code = params.get('code');
    if (code) {
      sessionStorage.setItem(GH_CODE_KEY, code);
    }
    navigate({ to: '/login', replace: true });
  }, [navigate]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#eee]">
      <Spin size="large" />
    </div>
  );
};

export default GitHubOAuthCallback;
