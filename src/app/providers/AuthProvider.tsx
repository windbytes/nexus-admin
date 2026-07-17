import { App as AntdApp } from 'antd';
import { type PropsWithChildren, useEffect } from 'react';
import { antdUtils } from '@/shared/utils/antd';

/**
 * 认证上下文 Provider
 *
 * 承接 syndra-admin App.tsx 中的 antd App 实例初始化：
 * 将 message / notification / modal 注入 antdUtils，供非组件上下文（如 axios 拦截器）消费。
 *
 * 注：登录态统一由 `@/shared/stores/user.store` 维护，
 * 菜单与按钮权限的加载在路由入口 `@/app/router` 中按角色触发。
 */
export function AuthProvider({ children }: PropsWithChildren) {
  const { notification, message, modal } = AntdApp.useApp();

  useEffect(() => {
    antdUtils.setMessageInstance(message);
    antdUtils.setNotificationInstance(notification);
    antdUtils.setModalInstance(modal);
  }, [message, modal, notification]);

  return children;
}
