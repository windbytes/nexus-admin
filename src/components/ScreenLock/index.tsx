import { LockOutlined } from '@ant-design/icons';
import { Card, Input, type InputRef, Typography } from 'antd';
import type React from 'react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import favicon from '@/assets/icon/web/icon-512.png';
import background from '@/assets/svg/login/background.svg';
import { usePreferencesStore } from '@/stores/store';

const { Text } = Typography;

/**
 * 锁屏操作
 * 性能优化：
 * 1. 使用 memo 避免不必要的重渲染
 * 2. 使用 useShallow 优化 store 选择器
 * 3. 使用 useCallback 缓存所有回调函数
 * 4. 使用 antd 默认样式和 tailwindcss 类名
 */
const ScreenLock: React.FC = memo(() => {
  // 使用 useShallow 优化状态选择
  const { lockScreenStatus, updatePreferences } = usePreferencesStore(
    useShallow((state) => ({
      lockScreenStatus: state.preferences.widget.lockScreenStatus,
      updatePreferences: state.updatePreferences,
    }))
  );

  const pwdRef = useRef<InputRef>(null);
  const [password, setPassword] = useState('');

  // 页面锁屏时，聚焦到密码框
  useEffect(() => {
    if (lockScreenStatus) {
      const timer = setTimeout(() => {
        pwdRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [lockScreenStatus]);

  /**
   * 验证解锁密码 - 使用 useCallback 缓存
   */
  const validatePassword = useCallback(() => {
    if (password.trim()) {
      updatePreferences('widget', 'lockScreenStatus', false);
      setPassword('');
    }
  }, [updatePreferences, password]);

  /**
   * 处理密码输入 - 使用 useCallback 缓存
   */
  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-[#eee]"
      style={{ backgroundImage: `url(${background})` }}
    >
      {/* 主要内容 */}
      <Card
        hoverable
        className="w-full max-w-md mx-4"
        styles={{
          body: {
            padding: '48px 40px',
          },
        }}
      >
        <div className="text-center">
          {/* 图标和标题 */}
          <div className="mb-6">
            <div className="inline-block mb-4 relative">
              <img src={favicon} alt="应用图标" className="w-20 h-20" />
            </div>
            <div className="flex items-center justify-center gap-3 mb-3">
              <LockOutlined className="text-2xl text-gray-600" />
            </div>
            <Text className="text-base text-gray-600">请输入密码以解锁系统</Text>
          </div>

          {/* 密码输入区域 */}
          <div className="mt-8">
            <Input.Password
              ref={pwdRef}
              value={password}
              onChange={handlePasswordChange}
              placeholder="请输入密码"
              onPressEnter={validatePassword}
              size="large"
              className="w-full"
            />
            <div className="mt-4">
              <Text type="secondary" className="text-sm">
                按 Enter 键解锁
              </Text>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
});

ScreenLock.displayName = 'ScreenLock';

export default ScreenLock;
