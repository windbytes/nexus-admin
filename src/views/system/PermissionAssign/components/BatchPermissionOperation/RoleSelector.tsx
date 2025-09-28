import { Card, Select, Table, Space, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useMemo, memo } from 'react';
import type React from 'react';
import type { TableProps } from 'antd';
import type { RoleModel } from '@/services/system/role/type';

/**
 * 角色选择组件Props
 */
interface RoleSelectorProps {
  /** 选中的角色ID列表 */
  selectedRoles: string[];
  /** 角色列表 */
  roleList?: RoleModel[];
  /** 是否正在加载 */
  isLoading?: boolean;
  /** 角色选择变化回调 */
  onRoleSelect: (roleIds: string[]) => void;
}

/**
 * 角色选择组件
 * 负责角色选择和多选展示
 */
const RoleSelector: React.FC<RoleSelectorProps> = memo(({
  selectedRoles,
  roleList = [],
  isLoading = false,
  onRoleSelect,
}) => {
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
   * 获取角色选项
   */
  const roleOptions = useMemo(() => {
    return roleList.map((role: RoleModel) => ({
      label: role.roleName,
      value: role.id,
    }));
  }, [roleList]);

  /**
   * 获取选中的角色数据
   */
  const selectedRoleData = useMemo(() => {
    return roleList.filter((role: RoleModel) => selectedRoles.includes(role.id));
  }, [roleList, selectedRoles]);

  return (
    <Card title="选择角色" size="small" className="h-full">
      <div className="h-full flex flex-col">
        <div className="mb-4">
          <Select
            mode="multiple"
            placeholder="请选择角色"
            value={selectedRoles}
            onChange={onRoleSelect}
            style={{ width: '100%' }}
            options={roleOptions}
            loading={isLoading}
            showSearch
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
          />
        </div>
        <div className="flex-1 overflow-auto">
          <Table
            columns={roleColumns}
            dataSource={selectedRoleData}
            rowKey="id"
            pagination={false}
            size="small"
            scroll={{ y: 200 }}
          />
        </div>
      </div>
    </Card>
  );
});

RoleSelector.displayName = 'RoleSelector';

export default RoleSelector;
