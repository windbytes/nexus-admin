import { useMemo } from 'react';
import type { RoleModel } from '@/services/system/role/type';

/**
 * 转换角色数据为穿梭框数据格式
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
 * 处理穿梭框数据的 Hook
 * @param dataSource 所有角色数据
 * @param userRoleIds 用户已拥有的角色ID集合
 * @returns 处理后的穿梭框数据
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

  // 初始选中的keys（用户已拥有的角色）
  const initialTargetKeys = useMemo(() => {
    return userRoleIds.filter((id) => dataSource.some((role) => role.id === id));
  }, [userRoleIds, dataSource]);

  return {
    transferData,
    initialTargetKeys,
  };
};
