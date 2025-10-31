import { Input, type InputRef, Typography } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import favicon from '@/assets/images/icon-512.png';
import type React from 'react';
import { useCallback, useEffect, useRef, useState, memo } from 'react';
import style from './screenLock.module.scss';
import { usePreferencesStore } from '@/stores/store';
import { useShallow } from 'zustand/shallow';

const { Text } = Typography;

// 提取静态样式到组件外部
const circleDelays = ['0s', '2s', '4s'] as const;

/**
 * 锁屏操作
 * 性能优化：
 * 1. 使用 memo 避免不必要的重渲染
 * 2. 使用 useShallow 优化 store 选择器
 * 3. 使用 useCallback 缓存所有回调函数
 * 4. 提取静态数据到组件外部
 * 5. 优化条件渲染，只在需要时挂载组件
 */
const ScreenLock: React.FC = memo(() => {
  // 使用 useShallow 优化状态选择
  const { lockScreenStatus, updatePreferences } = usePreferencesStore(
    useShallow((state) => ({
      lockScreenStatus: state.preferences.widget.lockScreenStatus,
      updatePreferences: state.updatePreferences,
    })),
  );

  const pwdRef = useRef<InputRef>(null);
  const [password, setPassword] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  // 页面锁屏时，聚焦到密码框
  useEffect(() => {
    if (lockScreenStatus) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        pwdRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
    setIsAnimating(false);
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

  // 注意：这个组件现在只在 lockScreenStatus 为 true 时才会被渲染（在父组件中控制）
  // 所以这里不需要再做条件判断
  return (
    <div className={`${style['screen-lock']} ${isAnimating ? style['animate'] : ''}`}>
      {/* 背景装饰 */}
      <div className={style['background-decoration']}>
        {circleDelays.map((delay, index) => (
          <div
            key={index}
            className={style['floating-circle']}
            style={{ '--delay': delay } as React.CSSProperties}
          />
        ))}
      </div>

      {/* 主要内容 */}
      <div className={style['lock-container']}>
        <div className={style['lock-card']}>
          {/* 图标和标题 */}
          <div className={style['lock-header']}>
            <div className={style['app-icon']}>
              <img src={favicon} alt="应用图标" />
              <div className={style['icon-glow']} />
            </div>
            <div className={style['lock-title']}>
              <LockOutlined className={style['lock-icon']} />
            </div>
            <Text className={style['subtitle'] || ''}>请输入密码以解锁系统</Text>
          </div>

          {/* 密码输入区域 */}
          <div className={style['password-section']}>
            <div className={style['input-wrapper']}>
              <UserOutlined className={style['input-icon']} />
              <Input.Password
                ref={pwdRef}
                value={password}
                onChange={handlePasswordChange}
                placeholder="请输入密码"
                onPressEnter={validatePassword}
                className={style['password-input']}
                size="large"
              />
            </div>
            <div className={style['unlock-hint']}>
              <Text type="secondary">按 Enter 键解锁</Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ScreenLock.displayName = 'ScreenLock';

export default ScreenLock;
