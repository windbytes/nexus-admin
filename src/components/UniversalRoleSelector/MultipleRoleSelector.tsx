import { Card, Select, Table, Space, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useMemo, memo } from 'react';
import type React from 'react';
import type { TableProps } from 'antd';
import type { RoleModel } from '@/services/system/role/type';
import BaseRoleSelector from './BaseRoleSelector';
import type { RoleOption } from './types';

/**
 * 多选角色选择组件Props
 */
interface MultipleRoleSelectorProps {
  /** 角色列表 */
  roles: RoleModel[];
  /** 选中的角色编码列表 */
  selectedRoles: string[];
  /** 是否正在加载 */
  loading?: boolean;
  /** 占位符文本 */
  placeholder?: string;
  /** 选择器宽度 */
  width?: number;
  /** 是否显示表格 */
  showTable?: boolean;
  /** 表格高度 */
  tableHeight?: number;
  /** 角色选择变化回调 */
  onSelect: (roleCodes: string[]) => void;
}

/**
 * 多选角色选择组件
 * 提供多选角色和表格展示功能
 */
const MultipleRoleSelector: React.FC<MultipleRoleSelectorProps> = memo(({
  roles,
  selectedRoles,
  loading = false,
  placeholder = '请选择角色',
  width = 300,
  showTable = true,
  tableHeight = 200,
  onSelect,
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
   * 角色表格列定义
   */
  const roleColumns: TableProps<RoleModel>['columns'] = useMemo(
    () => [
      {
        title: '角色名称',
        dataIndex: 'roleName',
        key: 'roleName',
        render: (name: string) => (
          <Space>
            <UserOutlined className="text-blue-500" />
            <span className="font-medium">{name}</span>
          </Space>
        ),
      },
      {
        title: '角色编码',
        dataIndex: 'roleCode',
        key: 'roleCode',
        render: (code: string) => <Tag color="blue">{code}</Tag>,
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (status: boolean) => <Tag color={status ? 'green' : 'red'}>{status ? '启用' : '禁用'}</Tag>,
      },
      {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
        ellipsis: true,
      },
    ],
    [],
  );

  /**
   * 获取选中的角色数据
   */
  const selectedRoleData = useMemo(() => {
    return roles.filter((role: RoleModel) => selectedRoles.includes(role.roleCode));
  }, [roles, selectedRoles]);

  /**
   * 处理角色选择变化
   */
  const handleChange = (value: string | string[]) => {
    if (Array.isArray(value)) {
      onSelect(value);
    }
  };

  return (
    <Card title="选择角色" size="small" className="h-full">
      <div className="h-full flex flex-col">
        <div className="mb-4">
          <BaseRoleSelector
            options={roleOptions}
            loading={loading}
            placeholder={placeholder}
            width={width}
            multiple={true}
            value={selectedRoles}
            onChange={handleChange}
          />
        </div>
        {showTable && (
          <div className="flex-1 overflow-auto">
            <Table
              columns={roleColumns}
              dataSource={selectedRoleData}
              rowKey="roleCode"
              pagination={false}
              size="small"
              scroll={{ y: tableHeight }}
            />
          </div>
        )}
      </div>
    </Card>
  );
});

MultipleRoleSelector.displayName = 'MultipleRoleSelector';

export default MultipleRoleSelector;
