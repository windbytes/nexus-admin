import { defineMock } from 'vite-plugin-mock-dev-server';
import { ok } from '../_util';
import { MOCK_MENUS } from '../fixtures/menus';

export default defineMock({
  url: '/api/system/menu/getMenusByRole',
  method: 'GET',
  delay: 100,
  body: () => ok(MOCK_MENUS),
});
