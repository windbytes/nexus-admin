import { Card, Select, Button, Space, Row, Col } from 'antd';
import { ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import { useId, memo } from 'react';
import type React from 'react';

/**
 * 操作配置栏组件Props
 */
interface OperationConfigBarProps {
  /** 权限类型 */
  permissionType: 'menu' | 'button' | 'interface';
  /** 操作类型 */
  operationType: 'assign' | 'revoke';
  /** 是否正在加载 */
  isLoading?: boolean;
  /** 是否可以执行操作 */
  canExecute?: boolean;
  /** 权限类型变化回调 */
  onPermissionTypeChange: (type: 'menu' | 'button' | 'interface') => void;
  /** 操作类型变化回调 */
  onOperationTypeChange: (type: 'assign' | 'revoke') => void;
  /** 刷新回调 */
  onRefresh: () => void;
  /** 执行批量操作回调 */
  onBatchOperation: () => void;
}

/**
 * 操作配置栏组件
 * 负责权限类型、操作类型选择和操作按钮
 */
const OperationConfigBar: React.FC<OperationConfigBarProps> = memo(({
  permissionType,
  operationType,
  isLoading = false,
  canExecute = false,
  onPermissionTypeChange,
  onOperationTypeChange,
  onRefresh,
  onBatchOperation,
}) => {
  const permissionTypeId = useId();
  const operationTypeId = useId();

  return (
    <Card size="small">
      <Row gutter={16}>
        <Col span={6}>
          <div className="flex items-center">
            <label htmlFor={permissionTypeId} className="text-sm font-medium">
              权限类型：
            </label>
            <Select
              id={permissionTypeId}
              value={permissionType}
              onChange={onPermissionTypeChange}
              className="flex-1"
              options={[
                { label: '菜单权限', value: 'menu' },
                { label: '按钮权限', value: 'button' },
                { label: '接口权限', value: 'interface' },
              ]}
            />
          </div>
        </Col>
        <Col span={6}>
          <div className="flex items-center">
            <label htmlFor={operationTypeId} className="text-sm font-medium">
              操作类型：
            </label>
            <Select
              id={operationTypeId}
              value={operationType}
              onChange={onOperationTypeChange}
              className="flex-1"
              options={[
                { label: '分配权限', value: 'assign' },
                { label: '回收权限', value: 'revoke' },
              ]}
            />
          </div>
        </Col>
        <Col span={12}>
          <div className="flex justify-end items-end h-full">
            <Space>
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={onRefresh}
                loading={isLoading}
              >
                刷新
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={onBatchOperation}
                disabled={!canExecute}
              >
                执行批量操作
              </Button>
            </Space>
          </div>
        </Col>
      </Row>
    </Card>
  );
});

OperationConfigBar.displayName = 'OperationConfigBar';

export default OperationConfigBar;
