import { Card, Button, Space, Row, Col } from 'antd';
import { UserOutlined, ReloadOutlined } from '@ant-design/icons';
import { useMemo, memo } from 'react';
import type React from 'react';
import type { RoleModel } from '@/services/system/role/type';
import BaseRoleSelector from './BaseRoleSelector';
import type { RoleOption } from './types';

/**
 * 角色选择栏组件Props
 */
interface RoleSelectorBarProps {
  /** 角色列表 */
  roles: RoleModel[];
  /** 当前选中的角色编码 */
  selectedRole?: string | null;
  /** 是否正在加载 */
  loading?: boolean;
  /** 占位符文本 */
  placeholder?: string;
  /** 选择器宽度 */
  width?: number;
  /** 是否显示刷新按钮 */
  showRefreshButton?: boolean;
  /** 角色选择变化回调 */
  onSelect: (roleCode: string) => void;
  /** 刷新回调 */
  onRefresh?: () => void;
  /** 是否显示标签 */
  showLabel?: boolean;
  /** 标签文本 */
  labelText?: string;
}

/**
 * 角色选择栏组件
 * 提供带标签和刷新按钮的角色选择功能
 */
const RoleSelectorBar: React.FC<RoleSelectorBarProps> = memo(({
  roles,
  selectedRole,
  loading = false,
  placeholder = '请选择角色',
  width = 300,
  showRefreshButton = false,
  onSelect,
  onRefresh,
  showLabel = true,
  labelText = '选择角色：',
}) => {
  /**
   * 获取角色选项
   */
  const roleOptions: RoleOption[] = useMemo(() => {
    return roles.map((role: RoleModel) => ({
      label: role.roleName,
      value: role.roleCode,
    }));
  }, [roles]);

  /**
   * 处理角色选择变化
   */
  const handleChange = (value: string | string[]) => {
    if (typeof value === 'string') {
      onSelect(value);
    }
  };

  return (
    <Card size="small">
      <Row gutter={16} align="middle">
        <Col flex="auto">
          <Space>
            {showLabel && (
              <>
                <UserOutlined className="text-gray-500" />
                <span className="font-medium">{labelText}</span>
              </>
            )}
            <BaseRoleSelector
              options={roleOptions}
              loading={loading}
              placeholder={placeholder}
              width={width}
              value={selectedRole}
              onChange={handleChange}
            />
          </Space>
        </Col>
        {showRefreshButton && onRefresh && (
          <Col>
            <Button 
              type="text" 
              icon={<ReloadOutlined />} 
              onClick={onRefresh} 
              loading={loading}
            >
              刷新
            </Button>
          </Col>
        )}
      </Row>
    </Card>
  );
});

RoleSelectorBar.displayName = 'RoleSelectorBar';

export default RoleSelectorBar;
