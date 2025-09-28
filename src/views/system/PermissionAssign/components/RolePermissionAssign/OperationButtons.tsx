import { Button, Space, Col } from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import { memo } from 'react';
import type React from 'react';

/**
 * 操作按钮组件Props
 */
interface OperationButtonsProps {
  /** 保存权限回调 */
  onSavePermissions: () => void;
  /** 刷新回调 */
  onRefresh: () => void;
  /** 是否有当前角色 */
  hasRole: boolean;
  /** 是否显示保存按钮 */
  showSaveButton?: boolean;
  /** 是否显示刷新按钮 */
  showRefreshButton?: boolean;
  /** 保存按钮加载状态 */
  saveLoading?: boolean;
  /** 刷新按钮加载状态 */
  refreshLoading?: boolean;
  activeTab: 'menu' | 'button' | 'interface';
}

/**
 * 操作按钮组件
 * 包含保存权限和刷新按钮
 */
const OperationButtons: React.FC<OperationButtonsProps> = memo(({
  onSavePermissions,
  onRefresh,
  hasRole,
  showSaveButton = true,
  showRefreshButton = true,
  saveLoading = false,
  refreshLoading = false,
  activeTab,
}) => {
  return (
    <Col>
      <Space>
        {showRefreshButton && (
          <Button
            type="text"
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            loading={refreshLoading}
          >
            刷新
          </Button>
        )}
        {showSaveButton && (
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={onSavePermissions}
            loading={saveLoading}
            disabled={!hasRole}
          >
            保存{activeTab === 'menu' ? '菜单' : activeTab === 'button' ? '按钮' : '接口'}权限
          </Button>
        )}
      </Space>
    </Col>
  );
});

export default OperationButtons;
