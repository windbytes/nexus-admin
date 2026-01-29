import type { PermissionModel } from '@/services/system/permission/type';

/**
 * 转换权限点数据为穿梭框数据格式
 */
export interface PermissionTransferItem {
  key: string;
  title: string;
  description?: string;
  disabled?: boolean;
  permCode: string;
  permName: string;
  permType: 'ACTION' | 'DATA';
  moduleCode: string;
  status: number;
}

/**
 * 处理穿梭框数据的 Hook
 * @param dataSource 所有权限点数据
 * @param rolePermissionIds 角色已配置的权限点ID集合
 * @returns 处理后的穿梭框数据
 */
export const useTransferData = (dataSource: PermissionModel[], rolePermissionIds: string[]) => {
  const transferData: PermissionTransferItem[] = dataSource.map((permission) => ({
    key: permission.id,
    title: permission.permName,
    description: permission.description,
    disabled: false,
    permCode: permission.permCode,
    permName: permission.permName,
    permType: permission.permType,
    moduleCode: permission.moduleCode,
    status: permission.status,
  }));

  // 初始选中的keys（角色已配置的权限点）
  const initialTargetKeys = rolePermissionIds.filter((id) => dataSource.some((permission) => permission.id === id));

  return {
    transferData,
    initialTargetKeys,
  };
};
