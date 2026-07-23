/** 来源：syndra/database/postgresql/system/sys_role.sql */

export interface MockRole {
  id: string;
  roleCode: string;
  roleName: string;
  roleType: string;
  remark: string;
  status: boolean;
}

export const SUPER_ADMIN_ROLE_ID = '235123826202185723';
export const SYNDRA_ROLE_ID = '295733718759399424';

export const MOCK_ROLES: Record<string, MockRole> = {
  [SUPER_ADMIN_ROLE_ID]: {
    id: SUPER_ADMIN_ROLE_ID,
    roleCode: 'SUPER_ADMIN',
    roleName: '超级管理员',
    roleType: '1',
    remark: '拥有整个系统的最高权限',
    status: true,
  },
  [SYNDRA_ROLE_ID]: {
    id: SYNDRA_ROLE_ID,
    roleCode: 'syndra',
    roleName: '访问',
    roleType: '1',
    remark: '普通用户访问角色',
    status: true,
  },
};

export function getRolesByIds(roleIds: string[]): MockRole[] {
  return roleIds.map((id) => MOCK_ROLES[id]).filter(Boolean) as MockRole[];
}
