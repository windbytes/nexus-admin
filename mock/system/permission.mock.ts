import { defineMock } from 'vite-plugin-mock-dev-server';
import { ok } from '../_util';
import { getButtonPermissionsByRoleId } from '../fixtures/permissions';

export default defineMock({
  url: '/api/system/permission/getButtonPermissionsByRoleId',
  method: 'GET',
  body: ({ query }) => {
    const roleId = String(query?.roleId ?? '');
    return ok(getButtonPermissionsByRoleId(roleId));
  },
});
