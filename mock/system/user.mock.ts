import { defineMock } from 'vite-plugin-mock-dev-server';
import { fail, ok } from '../_util';
import { getRolesByIds, MOCK_ROLES } from '../fixtures/roles';
import { MOCK_USERS } from '../fixtures/users';

export default defineMock([
  {
    url: '/api/sys/framework/queryRolesByUserName',
    method: 'GET',
    body: ({ query }) => {
      const username = String(query?.username ?? '');
      const user = MOCK_USERS[username];
      if (!user) {
        return ok([]);
      }
      return ok(getRolesByIds(user.roleIds));
    },
  },
  {
    url: '/api/system/user/getUserInfo',
    method: 'GET',
    body: ({ query }) => {
      const username = String(query?.username ?? '');
      const roleId = String(query?.roleId ?? '');
      const user = MOCK_USERS[username];
      if (!user) {
        return fail('用户不存在', 404);
      }
      const role = MOCK_ROLES[roleId] ?? getRolesByIds(user.roleIds)[0];
      return ok({
        id: user.id,
        username: user.username,
        realName: user.realName,
        avatar: '',
        email: user.email,
        phone: user.phone,
        sex: user.sex,
        status: user.status,
        delFlag: '0',
        createBy: 'admin',
        birthday: '',
        createTime: '2024-11-09 08:48:54',
        updateBy: 'admin',
        updateTime: '2025-12-30 01:50:37',
        roleId: role?.id ?? roleId,
        roleName: role?.roleName ?? '',
      });
    },
  },
]);
