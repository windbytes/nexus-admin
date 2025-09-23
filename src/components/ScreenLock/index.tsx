import { Input, type InputRef, Typography } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import favicon from "@/assets/images/icon-512.png";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import style from "./screenLock.module.scss";
import { usePreferencesStore } from "@/stores/store";
import { useShallow } from "zustand/shallow";

const { Text } = Typography;

/**
 * 锁屏操作
 * @returns
 */
const ScreenLock: React.FC = () => {
  // 状态
  const { lockScreenStatus, updatePreferences } = usePreferencesStore(
    useShallow((state) => ({
      lockScreenStatus: state.preferences.widget.lockScreenStatus,
      updatePreferences: state.updatePreferences,
    })),
  );
  const pwdRef = useRef<InputRef>(null);
  const [password, setPassword] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  // 页面锁屏时，聚焦到密码框
  useEffect(() => {
    if (lockScreenStatus) {
      setIsAnimating(true);
      setTimeout(() => {
        pwdRef.current?.focus();
      }, 300);
    } else {
      setIsAnimating(false);
    }
  }, [lockScreenStatus]);

  /**
   * 验证解锁密码
   */
  const validatePassword = useCallback(() => {
    if (password.trim()) {
      updatePreferences("widget", "lockScreenStatus", false);
      setPassword("");
    }
  }, [updatePreferences, password]);

  /**
   * 处理密码输入
   */
  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);

  return lockScreenStatus ? (
    <div className={`${style["screen-lock"]} ${isAnimating ? style["animate"] : ""}`}>
      {/* 背景装饰 */}
      <div className={style["background-decoration"]}>
        <div className={style["floating-circle"]} style={{ "--delay": "0s" } as React.CSSProperties}></div>
        <div className={style["floating-circle"]} style={{ "--delay": "2s" } as React.CSSProperties}></div>
        <div className={style["floating-circle"]} style={{ "--delay": "4s" } as React.CSSProperties}></div>
      </div>
      
      {/* 主要内容 */}
      <div className={style["lock-container"]}>
        <div className={style["lock-card"]}>
          {/* 图标和标题 */}
          <div className={style["lock-header"]}>
            <div className={style["app-icon"]}>
              <img src={favicon} alt="应用图标" />
              <div className={style["icon-glow"]}></div>
            </div>
            <div className={style["lock-title"]}>
              <LockOutlined className={style["lock-icon"]} />
            </div>
            <Text className={style["subtitle"] || ""}>请输入密码以解锁系统</Text>
          </div>

          {/* 密码输入区域 */}
          <div className={style["password-section"]}>
              <Input.Password
                ref={pwdRef}
                value={password}
                prefix={<UserOutlined style={{ fontSize: '18px' }} />}
                onChange={handlePasswordChange}
                placeholder="请输入密码"
                onPressEnter={validatePassword}
                size="large"
              />
            <div className={style["unlock-hint"]}>
              <Text type="secondary">按 Enter 键解锁</Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default ScreenLock;
