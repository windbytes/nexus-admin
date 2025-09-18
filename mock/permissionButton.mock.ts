import { defineMock } from 'vite-plugin-mock-dev-server';

// 模拟权限按钮数据
const mockButtonData = [
  {
    id: '1',
    name: '新增用户',
    code: 'system:user:add',
    menuId: '259950204508307456',
    menuType: 3,
    menuName: '用户管理',
    parentMenuId: '235123826202185728',
    parentMenuName: '系统管理',
    description: '新增用户权限按钮',
    status: true,
    sortNo: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
    createBy: 'admin',
    updateBy: 'admin',
  },
  {
    id: '2',
    name: '编辑用户',
    code: 'system:user:edit',
    menuId: '259950204508307456',
    menuType: 3,
    menuName: '用户管理',
    parentMenuId: '235123826202185728',
    parentMenuName: '系统管理',
    description: '编辑用户权限按钮',
    status: true,
    sortNo: 2,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
    createBy: 'admin',
    updateBy: 'admin',
  },
  {
    id: '3',
    name: '删除用户',
    code: 'system:user:delete',
    menuId: '259950204508307456',
    menuType: 3,
    menuName: '用户管理',
    parentMenuId: '235123826202185728',
    parentMenuName: '系统管理',
    description: '删除用户权限按钮',
    status: true,
    sortNo: 3,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
    createBy: 'admin',
    updateBy: 'admin',
  },
  {
    id: '4',
    name: '查看用户',
    code: 'system:user:view',
    menuId: '259950204508307456',
    menuType: 3,
    menuName: '用户管理',
    parentMenuId: '235123826202185728',
    parentMenuName: '系统管理',
    description: '查看用户权限按钮',
    status: true,
    sortNo: 4,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
    createBy: 'admin',
    updateBy: 'admin',
  },
  {
    id: '5',
    name: '新增角色',
    code: 'system:role:add',
    menuId: '259950660651450368',
    menuType: 3,
    menuName: '角色管理',
    parentMenuId: '235123826202185728',
    parentMenuName: '系统管理',
    description: '新增角色权限按钮',
    status: true,
    sortNo: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
    createBy: 'admin',
    updateBy: 'admin',
  },
  {
    id: '6',
    name: '编辑角色',
    code: 'system:role:edit',
    menuId: '259950660651450368',
    menuType: 3,
    menuName: '角色管理',
    parentMenuId: '235123826202185728',
    parentMenuName: '系统管理',
    description: '编辑角色权限按钮',
    status: true,
    sortNo: 2,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
    createBy: 'admin',
    updateBy: 'admin',
  },
  {
    id: '7',
    name: '删除角色',
    code: 'system:role:delete',
    menuId: '259950660651450368',
    menuType: 3,
    menuName: '角色管理',
    parentMenuId: '235123826202185728',
    parentMenuName: '系统管理',
    description: '删除角色权限按钮',
    status: true,
    sortNo: 3,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
    createBy: 'admin',
    updateBy: 'admin',
  },
  {
    id: '8',
    name: '分配权限',
    code: 'system:role:assign',
    menuId: '259950660651450368',
    menuType: 3,
    menuName: '角色管理',
    parentMenuId: '235123826202185728',
    parentMenuName: '系统管理',
    description: '分配角色权限按钮',
    status: true,
    sortNo: 4,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
    createBy: 'admin',
    updateBy: 'admin',
  },
  {
    id: '9',
    name: '新增菜单',
    code: 'system:menu:add',
    menuId: '235123826202185729',
    menuType: 3,
    menuName: '菜单管理',
    parentMenuId: '235123826202185728',
    parentMenuName: '系统管理',
    description: '新增菜单权限按钮',
    status: true,
    sortNo: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
    createBy: 'admin',
    updateBy: 'admin',
  },
  {
    id: '10',
    name: '编辑菜单',
    code: 'system:menu:edit',
    menuId: '235123826202185729',
    menuType: 3,
    menuName: '菜单管理',
    parentMenuId: '235123826202185728',
    parentMenuName: '系统管理',
    description: '编辑菜单权限按钮',
    status: true,
    sortNo: 2,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
    createBy: 'admin',
    updateBy: 'admin',
  },
  {
    id: '11',
    name: '删除菜单',
    code: 'system:menu:delete',
    menuId: '235123826202185729',
    menuType: 3,
    menuName: '菜单管理',
    parentMenuId: '235123826202185728',
    parentMenuName: '系统管理',
    description: '删除菜单权限按钮',
    status: true,
    sortNo: 3,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
    createBy: 'admin',
    updateBy: 'admin',
  },
  {
    id: '12',
    name: '新增应用',
    code: 'engine:apps:add',
    menuId: '262781066388107264',
    menuType: 3,
    menuName: '应用中心',
    parentMenuId: '262780659381235712',
    parentMenuName: '集成管理',
    description: '新增应用权限按钮',
    status: true,
    sortNo: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
    createBy: 'admin',
    updateBy: 'admin',
  },
  {
    id: '13',
    name: '编辑应用',
    code: 'engine:apps:edit',
    menuId: '262781066388107264',
    menuType: 3,
    menuName: '应用中心',
    parentMenuId: '262780659381235712',
    parentMenuName: '集成管理',
    description: '编辑应用权限按钮',
    status: true,
    sortNo: 2,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
    createBy: 'admin',
    updateBy: 'admin',
  },
  {
    id: '14',
    name: '删除应用',
    code: 'engine:apps:delete',
    menuId: '262781066388107264',
    menuType: 3,
    menuName: '应用中心',
    parentMenuId: '262780659381235712',
    parentMenuName: '集成管理',
    description: '删除应用权限按钮',
    status: true,
    sortNo: 3,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
    createBy: 'admin',
    updateBy: 'admin',
  },
  {
    id: '15',
    name: '查看应用',
    code: 'engine:apps:view',
    menuId: '262781066388107264',
    menuType: 3,
    menuName: '应用中心',
    parentMenuId: '262780659381235712',
    parentMenuName: '集成管理',
    description: '查看应用权限按钮',
    status: true,
    sortNo: 4,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
    createBy: 'admin',
    updateBy: 'admin',
  },
];

// 模拟按钮接口权限关联数据
const mockButtonInterfaceData = [
  {
    id: '1',
    buttonId: '1',
    interfaceId: 'api_user_add',
    interfaceCode: '/api/system/user/add',
    interfaceRemark: '新增用户接口',
    createTime: '2024-01-01 10:00:00',
  },
  {
    id: '2',
    buttonId: '2',
    interfaceId: 'api_user_edit',
    interfaceCode: '/api/system/user/edit',
    interfaceRemark: '编辑用户接口',
    createTime: '2024-01-01 10:00:00',
  },
  {
    id: '3',
    buttonId: '3',
    interfaceId: 'api_user_delete',
    interfaceCode: '/api/system/user/delete',
    interfaceRemark: '删除用户接口',
    createTime: '2024-01-01 10:00:00',
  },
  {
    id: '4',
    buttonId: '4',
    interfaceId: 'api_user_view',
    interfaceCode: '/api/system/user/view',
    interfaceRemark: '查看用户接口',
    createTime: '2024-01-01 10:00:00',
  },
  {
    id: '5',
    buttonId: '5',
    interfaceId: 'api_role_add',
    interfaceCode: '/api/system/role/add',
    interfaceRemark: '新增角色接口',
    createTime: '2024-01-01 10:00:00',
  },
  {
    id: '6',
    buttonId: '6',
    interfaceId: 'api_role_edit',
    interfaceCode: '/api/system/role/edit',
    interfaceRemark: '编辑角色接口',
    createTime: '2024-01-01 10:00:00',
  },
  {
    id: '7',
    buttonId: '7',
    interfaceId: 'api_role_delete',
    interfaceCode: '/api/system/role/delete',
    interfaceRemark: '删除角色接口',
    createTime: '2024-01-01 10:00:00',
  },
  {
    id: '8',
    buttonId: '8',
    interfaceId: 'api_role_assign',
    interfaceCode: '/api/system/role/assign',
    interfaceRemark: '分配角色权限接口',
    createTime: '2024-01-01 10:00:00',
  },
];

// 模拟所有接口权限数据
const mockInterfaceData = [
  {
    id: '1',
    code: 'api_user_add',
    name: '新增用户接口',
    path: '/api/system/user/add',
    method: 'POST',
    menuId: '259950204508307456',
    menuName: '用户管理',
    description: '用于新增用户信息的接口',
    status: true,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
  },
  {
    id: '2',
    code: 'api_user_edit',
    name: '编辑用户接口',
    path: '/api/system/user/edit',
    method: 'PUT',
    menuId: '259950204508307456',
    menuName: '用户管理',
    description: '用于编辑用户信息的接口',
    status: true,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
  },
  {
    id: '3',
    code: 'api_user_delete',
    name: '删除用户接口',
    path: '/api/system/user/delete',
    method: 'DELETE',
    menuId: '259950204508307456',
    menuName: '用户管理',
    description: '用于删除用户信息的接口',
    status: true,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
  },
  {
    id: '4',
    code: 'api_user_view',
    name: '查看用户接口',
    path: '/api/system/user/view',
    method: 'GET',
    menuId: '259950204508307456',
    menuName: '用户管理',
    description: '用于查看用户信息的接口',
    status: true,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
  },
  {
    id: '5',
    code: 'api_user_list',
    name: '用户列表接口',
    path: '/api/system/user/list',
    method: 'GET',
    menuId: '259950204508307456',
    menuName: '用户管理',
    description: '用于获取用户列表的接口',
    status: true,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
  },
  {
    id: '6',
    code: 'api_role_add',
    name: '新增角色接口',
    path: '/api/system/role/add',
    method: 'POST',
    menuId: '259950204508307457',
    menuName: '角色管理',
    description: '用于新增角色信息的接口',
    status: true,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
  },
  {
    id: '7',
    code: 'api_role_edit',
    name: '编辑角色接口',
    path: '/api/system/role/edit',
    method: 'PUT',
    menuId: '259950204508307457',
    menuName: '角色管理',
    description: '用于编辑角色信息的接口',
    status: true,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
  },
  {
    id: '8',
    code: 'api_role_delete',
    name: '删除角色接口',
    path: '/api/system/role/delete',
    method: 'DELETE',
    menuId: '259950204508307457',
    menuName: '角色管理',
    description: '用于删除角色信息的接口',
    status: true,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
  },
  {
    id: '9',
    code: 'api_role_assign',
    name: '分配角色权限接口',
    path: '/api/system/role/assign',
    method: 'POST',
    menuId: '259950204508307457',
    menuName: '角色管理',
    description: '用于分配角色权限的接口',
    status: true,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
  },
  {
    id: '10',
    code: 'api_menu_add',
    name: '新增菜单接口',
    path: '/api/system/menu/add',
    method: 'POST',
    menuId: '259950204508307458',
    menuName: '菜单管理',
    description: '用于新增菜单信息的接口',
    status: true,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
  },
];

export default defineMock([
  // 获取权限按钮列表
  {
    url: '/api/system/permission/button/getButtonList',
    method: 'GET',
    enabled: false,
    body: (req) => {
      const { pageNumber = 1, pageSize = 10, name, code, menuId, status } = req.query;

      let filteredData = [...mockButtonData];

      // 根据查询条件过滤数据
      if (name) {
        filteredData = filteredData.filter((item) => item.name.includes(name));
      }
      if (code) {
        filteredData = filteredData.filter((item) => item.code.includes(code));
      }
      if (menuId) {
        filteredData = filteredData.filter((item) => item.menuId === menuId);
      }
      if (status !== undefined) {
        filteredData = filteredData.filter((item) => item.status === (status === 'true'));
      }

      const startIndex = (pageNumber - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const records = filteredData.slice(startIndex, endIndex);

      return {
        code: 200,
        message: '操作成功',
        data: {
          records,
          pageNumber: Number(pageNumber),
          pageSize: Number(pageSize),
          totalPage: Math.ceil(filteredData.length / pageSize),
          totalRow: filteredData.length,
        },
      };
    },
  },

  // 获取权限按钮详情
  {
    url: '/api/system/permission/button/detail',
    method: 'GET',
    enabled: false,
    body: (req) => {
      const { buttonId } = req.query;
      const button = mockButtonData.find((item) => item.id === buttonId);

      if (!button) {
        return {
          code: 404,
          message: '按钮不存在',
          data: null,
        };
      }

      return {
        code: 200,
        message: '操作成功',
        data: button,
      };
    },
  },

  // 新增权限按钮
  {
    url: '/api/system/permission/button/add',
    method: 'POST',
    enabled: false,
    body: (req) => {
      const newButton = {
        id: String(Date.now()),
        ...req.body,
        createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updateTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
        createBy: 'admin',
        updateBy: 'admin',
      };

      mockButtonData.push(newButton as any);

      return {
        code: 200,
        message: '新增成功',
        data: true,
      };
    },
  },

  // 编辑权限按钮
  {
    url: '/api/system/permission/button/update',
    method: 'POST',
    enabled: false,
    body: (req) => {
      const { id, ...updateData } = req.body;
      const buttonIndex = mockButtonData.findIndex((item) => item.id === id);

      if (buttonIndex === -1) {
        return {
          code: 404,
          message: '按钮不存在',
          data: false,
        };
      }

      mockButtonData[buttonIndex] = {
        ...mockButtonData[buttonIndex],
        ...updateData,
        updateTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updateBy: 'admin',
      };

      return {
        code: 200,
        message: '更新成功',
        data: true,
      };
    },
  },

  // 删除权限按钮
  {
    url: '/api/system/permission/button/delete',
    method: 'DELETE',
    enabled: false,
    body: (req) => {
      const { buttonId } = req.query;
      const buttonIndex = mockButtonData.findIndex((item) => item.id === buttonId);

      if (buttonIndex === -1) {
        return {
          code: 404,
          message: '按钮不存在',
          data: false,
        };
      }

      mockButtonData.splice(buttonIndex, 1);

      return {
        code: 200,
        message: '删除成功',
        data: true,
      };
    },
  },

  // 批量删除权限按钮
  {
    url: '/api/system/permission/button/batchDelete',
    method: 'POST',
    enabled: false,
    body: (req) => {
      const { buttonIds } = req.body;

      buttonIds.forEach((id: string) => {
        const buttonIndex = mockButtonData.findIndex((item) => item.id === id);
        if (buttonIndex !== -1) {
          mockButtonData.splice(buttonIndex, 1);
        }
      });

      return {
        code: 200,
        message: '批量删除成功',
        data: true,
      };
    },
  },

  // 切换权限按钮状态
  {
    url: '/api/system/permission/button/toggleStatus',
    method: 'POST',
    enabled: false,
    body: (req) => {
      const { buttonId, status } = req.body;
      const buttonIndex = mockButtonData.findIndex((item) => item.id === buttonId);

      if (buttonIndex === -1) {
        return {
          code: 404,
          message: '按钮不存在',
          data: false,
        };
      }

      mockButtonData[buttonIndex].status = status;
      mockButtonData[buttonIndex].updateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
      mockButtonData[buttonIndex].updateBy = 'admin';

      return {
        code: 200,
        message: '状态切换成功',
        data: true,
      };
    },
  },

  // 获取按钮关联的接口权限
  {
    url: '/api/system/permission/button/interfaces',
    method: 'GET',
    enabled: false,
    body: (req) => {
      const { buttonId } = req.query;
      const interfaces = mockButtonInterfaceData.filter((item) => item.buttonId === buttonId);

      return {
        code: 200,
        message: '操作成功',
        data: interfaces,
      };
    },
  },

  // 获取所有接口权限
  {
    url: '/api/system/permission/button/getNotAssignedInterfaces',
    method: 'GET',
    enabled: false,
    body: (_req) => {
      return {
        code: 200,
        message: '操作成功',
        data: mockInterfaceData,
      };
    },
  },

  // 分配按钮接口权限
  {
    url: '/api/system/permission/button/assignInterfaces',
    method: 'POST',
    enabled: false,
    body: (req) => {
      const { buttonId, interfaceIds } = req.body;

      // 先删除该按钮的现有接口权限
      const existingIndexes = mockButtonInterfaceData
        .map((item, index) => (item.buttonId === buttonId ? index : -1))
        .filter((index) => index !== -1)
        .reverse(); // 从后往前删除，避免索引变化

      existingIndexes.forEach((index) => {
        mockButtonInterfaceData.splice(index, 1);
      });

      // 添加新的接口权限
      interfaceIds.forEach((interfaceId: string, index: number) => {
        mockButtonInterfaceData.push({
          id: String(Date.now() + index),
          buttonId,
          interfaceId,
          interfaceCode: `/api/interface/${interfaceId}`,
          interfaceRemark: `接口${interfaceId}`,
          createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
        });
      });

      return {
        code: 200,
        message: '分配成功',
        data: true,
      };
    },
  },
]);
