/** 来源：syndra/database/postgresql/system/sys_user.sql + sys_user_role.sql */

export interface MockUser {
  id: string;
  username: string;
  realName: string;
  email: string;
  phone: string;
  sex: number;
  status: number;
  roleIds: string[];
}

export const MOCK_USERS: Record<string, MockUser> = {
  admin: {
    id: '235123826202185728',
    username: 'admin',
    realName: 'admin',
    email: '499475142@qq.com',
    phone: '',
    sex: 1,
    status: 1,
    roleIds: ['235123826202185723'],
  },
  syndra: {
    id: '295734686385332224',
    username: 'syndra',
    realName: 'SYNDRA',
    email: '2234223423@qq.com',
    phone: '',
    sex: 1,
    status: 1,
    roleIds: ['295733718759399424'],
  },
};

export const MOCK_ACCESS_TOKEN = 'mock-access-token-syndra-admin';
