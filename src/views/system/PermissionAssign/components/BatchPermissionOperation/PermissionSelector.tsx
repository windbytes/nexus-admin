import { Card, Select, Spin, Tag } from 'antd';
import { useMemo, memo } from 'react';
import type React from 'react';
import type { MenuModel } from '@/services/system/menu/type';

/**
 * 权限选择组件Props
 */
interface PermissionSelectorProps {
  /** 选中的权限ID列表 */
  selectedPermissions: string[];
  /** 权限列表 */
  permissionList?: MenuModel[];
  /** 权限类型 */
  permissionType: 'menu' | 'button' | 'interface';
  /** 是否正在加载 */
  isLoading?: boolean;
  /** 权限选择变化回调 */
  onPermissionSelect: (permissionIds: string[]) => void;
}

/**
 * 权限选择组件
 * 负责权限选择和多选展示
 */
const PermissionSelector: React.FC<PermissionSelectorProps> = memo(({
  selectedPermissions,
  permissionList = [],
  permissionType,
  isLoading = false,
  onPermissionSelect,
}) => {
  /**
   * 获取权限选项
   */
  const permissionOptions = useMemo(() => {
    return permissionList.map((permission: MenuModel) => ({
      label: permission.name,
      value: permission.id,
    }));
  }, [permissionList]);

  /**
   * 获取选中的权限数据
   */
  const selectedPermissionData = useMemo(() => {
    return permissionList.filter((permission: MenuModel) => selectedPermissions.includes(permission.id));
  }, [permissionList, selectedPermissions]);

  /**
   * 获取权限类型显示名称
   */
  const permissionTypeName = useMemo(() => {
    switch (permissionType) {
      case 'menu':
        return '菜单';
      case 'button':
        return '按钮';
      case 'interface':
        return '接口';
      default:
        return '权限';
    }
  }, [permissionType]);

  return (
    <Card
      title={`选择${permissionTypeName}权限`}
      size="small"
      className="h-full"
    >
      <div className="h-full flex flex-col">
        <div className="mb-4">
          <Select
            mode="multiple"
            placeholder={`请选择${permissionTypeName}权限`}
            value={selectedPermissions}
            onChange={onPermissionSelect}
            style={{ width: '100%' }}
            options={permissionOptions}
            loading={isLoading}
            showSearch
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
          />
        </div>
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Spin />
            </div>
          ) : (
            <div className="space-y-2">
              {selectedPermissionData.map((permission: MenuModel) => (
                <div
                  key={permission.id}
                  className="p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{permission.name || permission.perms}</span>
                    <Tag color="blue">{permission.perms}</Tag>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
});

PermissionSelector.displayName = 'PermissionSelector';

export default PermissionSelector;
