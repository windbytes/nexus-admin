import { useMemo } from 'react';
import type { RoleModel } from '@/shared/api/system/role/type';

/**
 * 表格穿梭框条目结构
 */
export interface TransferItem {
  key: string;
  title: string;
  description?: string;
  disabled?: boolean;
  roleCode: string;
  roleName: string;
  roleType: string | number;
  status: boolean;
  remark?: string;
}

/**
 * 处理穿梭框数据的 Hook。
 *
 * @param dataSource - 所有角色数据
 * @param userRoleIds - 用户已拥有的角色 ID 集合
 * @returns 处理后的穿梭框数据与初始选中 keys
 */
export const useTransferData = (dataSource: RoleModel[], userRoleIds: string[]) => {
  const transferData = useMemo<TransferItem[]>(() => {
    return dataSource.map((role) => ({
      key: role.id,
      title: role.roleName,
      description: role.remark,
      disabled: false,
      roleCode: role.roleCode,
      roleName: role.roleName,
      roleType: role.roleType,
      status: role.status,
      remark: role.remark,
    }));
  }, [dataSource]);

  // 初始选中的 keys（用户已拥有的角色）
  const initialTargetKeys = useMemo(() => {
    return userRoleIds.filter((id) => dataSource.some((role) => role.id === id));
  }, [userRoleIds, dataSource]);

  return {
    transferData,
    initialTargetKeys,
  };
};
