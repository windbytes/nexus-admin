/**
 * @file 授权资源穿梭框数据转换
 */

import type { PermissionModel } from '@/shared/api/system/permission/type';

/**
 * 穿梭框数据项。
 */
export interface PermissionTransferItem {
  key: string;
  title: string;
  description?: string;
  disabled?: boolean;
  permCode: string;
  permName: string;
  resourceType: number;
  status: boolean;
}

/**
 * 将权限点列表转为穿梭框数据格式。
 *
 * @param dataSource - 所有权限点数据
 * @param rolePermissionIds - 角色已配置的权限点 ID
 */
export function useTransferData(dataSource: PermissionModel[], rolePermissionIds: string[]) {
  const transferData: PermissionTransferItem[] = dataSource.map((permission) => ({
    key: permission.id,
    title: permission.permName,
    description: permission.description,
    disabled: false,
    permCode: permission.permCode,
    permName: permission.permName,
    resourceType: permission.resourceType,
    status: permission.status,
  }));

  const initialTargetKeys = rolePermissionIds.filter((id) => dataSource.some((permission) => permission.id === id));

  return {
    transferData,
    initialTargetKeys,
  };
}
