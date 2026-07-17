import { CheckCircleOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, message, Radio, Spin, Typography } from 'antd';
import type React from 'react';
import { useState } from 'react';
import type { UserRole } from '@/modules/auth/api';

const { Title, Text } = Typography;

/**
 * 角色选择组件属性
 */
interface RoleSelectorProps {
  /** 角色列表 */
  roles: UserRole[];
  /** 默认选中的角色ID */
  defaultRoleId?: string;
  /** 选择角色回调 */
  onSelect: (roleId: string) => void;
  /** 加载状态 */
  loading?: boolean;
  /** 用户ID */
  userId?: string | undefined;
}

/**
 * 角色选择组件
 */
const RoleSelector: React.FC<RoleSelectorProps> = ({ roles, defaultRoleId, onSelect, loading = false }) => {
  const autoSelectedRoleId = defaultRoleId ?? roles[0]?.id ?? '';
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const effectiveSelectedRoleId = selectedRoleId || autoSelectedRoleId;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 处理角色选择
  const handleRoleSelect = (roleId: string) => {
    setSelectedRoleId(roleId);
  };

  // 处理确认选择
  const handleConfirm = async () => {
    if (!effectiveSelectedRoleId) {
      message.warning('请选择一个角色');
      return;
    }

    setIsSubmitting(true);
    try {
      onSelect(effectiveSelectedRoleId);
    } catch {
      message.error('角色选择失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="text-center py-8">
        <Text type="secondary">暂无可选择的角色</Text>
      </div>
    );
  }

  return (
    <div className="role-selector">
      <div className="text-center mb-6">
        <Title level={3}>选择您的角色</Title>
        <Text type="secondary">请选择您要使用的角色身份</Text>
      </div>

      <div className="role-list space-y-4">
        {roles.map((role) => (
          <Card
            key={role.id}
            className={`role-card cursor-pointer transition-all duration-200 ${
              effectiveSelectedRoleId === role.id
                ? 'border-blue-500 shadow-md bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
            onClick={() => handleRoleSelect(role.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Radio checked={effectiveSelectedRoleId === role.id} onChange={() => handleRoleSelect(role.id)} />
                <UserOutlined className="text-lg text-gray-500" />
                <div>
                  <div className="font-medium text-lg">{role.roleName}</div>
                  {role.remark && (
                    <Text type="secondary" className="text-sm">
                      {role.remark}
                    </Text>
                  )}
                  <div className="text-xs text-gray-400 mt-1">类型: {role.roleType}</div>
                </div>
              </div>
              {effectiveSelectedRoleId === role.id && <CheckCircleOutlined className="text-blue-500 text-xl" />}
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8">
        <Button
          type="primary"
          size="large"
          disabled={!effectiveSelectedRoleId}
          loading={isSubmitting}
          onClick={handleConfirm}
          className="min-w-32"
        >
          {isSubmitting ? '登录中...' : '确认选择'}
        </Button>
      </div>
    </div>
  );
};

export default RoleSelector;
