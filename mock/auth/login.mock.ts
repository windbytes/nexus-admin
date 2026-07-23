import { defineMock } from 'vite-plugin-mock-dev-server';
import { fail, ok } from '../_util';
import { MOCK_HOME_PATH } from '../fixtures/menus';
import { getButtonPermissionsByRoleCode } from '../fixtures/permissions';
import { getRolesByIds } from '../fixtures/roles';
import { MOCK_ACCESS_TOKEN, MOCK_USERS } from '../fixtures/users';

export default defineMock([
  {
    url: '/api/auth/login',
    method: 'POST',
    delay: 200,
    // 登录页 isTransformResponse: false，需完整 Response 包装
    body: ({ body }) => {
      const username = String(body?.username ?? '').trim();
      const password = body?.password;
      const user = MOCK_USERS[username];

      if (!user) {
        return fail('用户名不存在', 107);
      }
      if (password === undefined || password === null || String(password) === '') {
        return fail('密码输入错误', 108);
      }

      const userRoles = getRolesByIds(user.roleIds).map((role) => ({
        id: role.id,
        roleName: role.roleName,
        roleCode: role.roleCode,
        roleType: role.roleType,
        remark: role.remark,
        status: role.status,
      }));

      return ok({
        userId: user.id,
        username: user.username,
        accessToken: MOCK_ACCESS_TOKEN,
        homePath: MOCK_HOME_PATH,
        userRoles,
      });
    },
  },
  {
    url: '/api/auth/confirm-role',
    method: 'POST',
    delay: 100,
    body: ({ body }) => {
      const roleCode = String(body?.roleCode ?? 'SUPER_ADMIN');
      return ok({
        accessToken: MOCK_ACCESS_TOKEN,
        permissions: getButtonPermissionsByRoleCode(roleCode),
      });
    },
  },
  {
    url: '/api/auth/logout',
    method: 'POST',
    body: () => ok(true),
  },
  {
    url: '/api/auth/refresh',
    method: 'POST',
    body: () => ok(MOCK_ACCESS_TOKEN),
  },
]);
