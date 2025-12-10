import { defineMock } from 'vite-plugin-mock-dev-server';
export default defineMock([
  {
    // 登录接口
    url: '/api/login',
    method: 'POST',
    // 表示对该接口进行mock
    enabled: true,
    // 模拟登录接口
    body: (req) => {
      const { username, password } = req.body;
      if (username === 'nexus' && password === '123456') {
        return {
          code: 200,
          data: {
            accessToken: 'mock-token',
            refreshToken: 'mock-refresh-token',
            roleId: 'admin-role',
          },
        };
      }
      return {
        code: 200,
        data: {
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh-token',
          roleId: 'other-role',
        },
      };
    },
  },
  {
    // 获取验证码接口
    url: '/api/getCaptcha/:t',
    method: 'GET',
    enabled: true,
    body: {
      code: 200,
      data: 'data:image/jpg;base64,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',
    },
  },
  {
    // 刷新token接口
    url: '/api/refreshToken',
    method: 'POST',
    enabled: true,
    body: {
      code: 200,
      data: 'mock-refresh-token',
    },
  },
  // 查询菜单接口
  {
    url: 'api/system/menu/getMenusByRole',
    method: 'GET',
    enabled: true,
    body: {
      code: 200,
      message: '操作成功!',
      data: [
        {
          redirect: null,
          path: '/home',
          component: 'Home',
          route: true,
          meta: {
            keepAlive: false,
            internalOrExternal: false,
            icon: 'HomeOutlined',
            componentName: '首页',
            title: 'menu.home',
          },
          name: '首页',
          id: '257681744906833920',
        },
        {
          redirect: null,
          path: '/system',
          component: null,
          route: false,
          children: [
            {
              path: '/system/role',
              component: 'system/Role',
              route: true,
              meta: {
                keepAlive: false,
                internalOrExternal: false,
                icon: 'UsergroupDeleteOutlined',
                componentName: '角色管理',
                title: 'menu.system.role',
              },
              name: '角色管理',
              id: '259950660651450368',
            },
            {
              path: '/system/menu',
              component: 'system/Menu',
              route: true,
              meta: {
                keepAlive: false,
                internalOrExternal: false,
                icon: 'MenuOutlined',
                componentName: '菜单管理',
                title: 'menu.system.menu',
              },
              name: '菜单管理',
              id: '235123826202185729',
            },
          ],
          meta: {
            keepAlive: false,
            internalOrExternal: false,
            icon: 'SettingOutlined',
            componentName: '系统管理',
            title: 'menu.system.main',
          },
          name: '系统管理',
          id: '235123826202185728',
        },
      ],
    },
  },
]);
