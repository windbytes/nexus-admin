import { defineMock } from 'vite-plugin-mock-dev-server';

// 模拟权限分配数据
const mockPermissionAssignData = [
  {
    id: '1',
    roleId: 'admin-role',
    roleName: '系统管理员',
    permissionType: 'menu',
    permissionId: '235123826202185728',
    permissionName: '系统管理',
    permissionCode: 'system:manage',
    assignTime: '2024-01-01 10:00:00',
    assignBy: 'admin',
  },
  {
    id: '2',
    roleId: 'admin-role',
    roleName: '系统管理员',
    permissionType: 'menu',
    permissionId: '259950204508307456',
    permissionName: '用户管理',
    permissionCode: 'system:user',
    assignTime: '2024-01-01 10:00:00',
    assignBy: 'admin',
  },
  {
    id: '3',
    roleId: 'admin-role',
    roleName: '系统管理员',
    permissionType: 'button',
    permissionId: '1',
    permissionName: '新增用户',
    permissionCode: 'system:user:add',
    assignTime: '2024-01-01 10:00:00',
    assignBy: 'admin',
  },
  {
    id: '4',
    roleId: 'admin-role',
    roleName: '系统管理员',
    permissionType: 'button',
    permissionId: '2',
    permissionName: '编辑用户',
    permissionCode: 'system:user:edit',
    assignTime: '2024-01-01 10:00:00',
    assignBy: 'admin',
  },
  {
    id: '5',
    roleId: 'admin-role',
    roleName: '系统管理员',
    permissionType: 'interface',
    permissionId: 'api_user_add',
    permissionName: '新增用户接口',
    permissionCode: '/api/system/user/add',
    assignTime: '2024-01-01 10:00:00',
    assignBy: 'admin',
  },
  {
    id: '6',
    roleId: 'user-role',
    roleName: '普通用户',
    permissionType: 'menu',
    permissionId: '262781066388107264',
    permissionName: '应用中心',
    permissionCode: 'engine:apps',
    assignTime: '2024-01-01 10:00:00',
    assignBy: 'admin',
  },
  {
    id: '7',
    roleId: 'user-role',
    roleName: '普通用户',
    permissionType: 'button',
    permissionId: '12',
    permissionName: '新增应用',
    permissionCode: 'engine:apps:add',
    assignTime: '2024-01-01 10:00:00',
    assignBy: 'admin',
  },
  {
    id: '8',
    roleId: 'user-role',
    roleName: '普通用户',
    permissionType: 'button',
    permissionId: '15',
    permissionName: '查看应用',
    permissionCode: 'engine:apps:view',
    assignTime: '2024-01-01 10:00:00',
    assignBy: 'admin',
  },
  {
    id: '9',
    roleId: 'operator-role',
    roleName: '操作员',
    permissionType: 'menu',
    permissionId: '295674094257594368',
    permissionName: '数据统计',
    permissionCode: 'statics:main',
    assignTime: '2024-01-01 10:00:00',
    assignBy: 'admin',
  },
  {
    id: '10',
    roleId: 'operator-role',
    roleName: '操作员',
    permissionType: 'menu',
    permissionId: '295682339458224128',
    permissionName: '资源管理',
    permissionCode: 'resource:main',
    assignTime: '2024-01-01 10:00:00',
    assignBy: 'admin',
  },
];

// 模拟角色权限详情数据
const mockRolePermissionDetails = {
  'admin': {
    menuPermissions: [
      '235123826202185728', // 系统管理
      '259950204508307456', // 用户管理
      '259950660651450368', // 角色管理
      '235123826202185729', // 菜单管理
      '262707554793222144', // 数据字典
      '262708109523480576', // 系统参数
      '295692346073440256', // 系统公告
    ],
    buttonPermissions: [
      '1', '2', '3', '4', // 用户管理按钮
      '5', '6', '7', '8', // 角色管理按钮
      '9', '10', '11',    // 菜单管理按钮
    ],
    interfacePermissions: [
      'api_user_add',
      'api_user_edit',
      'api_user_delete',
      'api_user_view',
      'api_role_add',
      'api_role_edit',
      'api_role_delete',
      'api_role_assign',
      'api_menu_add',
      'api_menu_edit',
      'api_menu_delete',
    ],
  },
  'user-role': {
    menuPermissions: [
      '262781066388107264', // 应用中心
      '262781545507647488', // 端点维护模块
      '262781914170191872', // 端点的配置选项维护
      '297119415814750208', // 模板库
      '297120015839297536', // 版本管理
    ],
    buttonPermissions: [
      '12', '13', '14', '15', // 应用中心按钮
    ],
    interfacePermissions: [
      'api_apps_add',
      'api_apps_edit',
      'api_apps_delete',
      'api_apps_view',
    ],
  },
  'operator-role': {
    menuPermissions: [
      '295674094257594368', // 数据统计
      '295682339458224128', // 资源管理
      '295687416063430656', // 连接管理
      '295688138591014912', // 数据处理
    ],
    buttonPermissions: [],
    interfacePermissions: [
      'api_statics_view',
      'api_resource_view',
      'api_connection_view',
    ],
  },
};

export default defineMock([
  // 获取权限分配列表
  {
    url: '/api/system/permission/assign/list',
    method: 'GET',
    enabled: false,
    body: (req) => {
      const { pageNumber = 1, pageSize = 10, roleId, userId, permissionType } = req.query;
      
      let filteredData = [...mockPermissionAssignData];
      
      // 根据查询条件过滤数据
      if (roleId) {
        filteredData = filteredData.filter(item => item.roleId === roleId);
      }
      if (userId) {
        // 这里可以根据用户ID查找对应的角色，然后过滤
        // 简化处理，假设用户ID对应的角色ID
        const userRoleMap: Record<string, string> = {
          'user1': 'admin-role',
          'user2': 'user-role',
          'user3': 'operator-role',
        };
        const userRole = userRoleMap[userId as string];
        if (userRole) {
          filteredData = filteredData.filter(item => item.roleId === userRole);
        }
      }
      if (permissionType) {
        filteredData = filteredData.filter(item => item.permissionType === permissionType);
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
  
  // 分配角色权限
  {
    url: '/api/system/permission/assign/role',
    method: 'POST',
    enabled: false,
    body: (req) => {
      const { roleId, permissionType, permissionIds } = req.body;
      
      // 先删除该角色该类型的所有权限
      const existingIndexes = mockPermissionAssignData
        .map((item, index) => 
          item.roleId === roleId && item.permissionType === permissionType ? index : -1
        )
        .filter(index => index !== -1)
        .reverse(); // 从后往前删除，避免索引变化
      
      existingIndexes.forEach(index => {
        mockPermissionAssignData.splice(index, 1);
      });
      
      // 添加新的权限分配
      permissionIds.forEach((permissionId: string, index: number) => {
        const roleName = roleId === 'admin-role' ? '系统管理员' : 
                        roleId === 'user-role' ? '普通用户' : '操作员';
        
        let permissionName = '';
        let permissionCode = '';
        
        // 根据权限类型和ID生成权限名称和代码
        if (permissionType === 'menu') {
          const menuMap: Record<string, { name: string; code: string }> = {
            '235123826202185728': { name: '系统管理', code: 'system:manage' },
            '259950204508307456': { name: '用户管理', code: 'system:user' },
            '259950660651450368': { name: '角色管理', code: 'system:role' },
            '235123826202185729': { name: '菜单管理', code: 'system:menu' },
            '262781066388107264': { name: '应用中心', code: 'engine:apps' },
          };
          const menu = menuMap[permissionId] || { name: '未知菜单', code: 'unknown' };
          permissionName = menu.name;
          permissionCode = menu.code;
        } else if (permissionType === 'button') {
          const buttonMap: Record<string, { name: string; code: string }> = {
            '1': { name: '新增用户', code: 'system:user:add' },
            '2': { name: '编辑用户', code: 'system:user:edit' },
            '3': { name: '删除用户', code: 'system:user:delete' },
            '4': { name: '查看用户', code: 'system:user:view' },
            '12': { name: '新增应用', code: 'engine:apps:add' },
            '15': { name: '查看应用', code: 'engine:apps:view' },
          };
          const button = buttonMap[permissionId] || { name: '未知按钮', code: 'unknown' };
          permissionName = button.name;
          permissionCode = button.code;
        } else if (permissionType === 'interface') {
          permissionName = `接口${permissionId}`;
          permissionCode = `/api/interface/${permissionId}`;
        }
        
        mockPermissionAssignData.push({
          id: String(Date.now() + index),
          roleId,
          roleName,
          permissionType,
          permissionId,
          permissionName,
          permissionCode,
          assignTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
          assignBy: 'admin',
        });
      });
      
      return {
        code: 200,
        message: '权限分配成功',
        data: true,
      };
    },
  },
  
  // 获取角色权限详情
  {
    url: '/api/system/permission/assign/roleDetail',
    method: 'GET',
    enabled: false,
    body: (req) => {
      const { roleId } = req.query;
      const rolePermission = mockRolePermissionDetails[roleId as keyof typeof mockRolePermissionDetails];
      
      if (!rolePermission) {
        return {
          code: 404,
          message: '角色不存在',
          data: null,
        };
      }
      
      return {
        code: 200,
        message: '操作成功',
        data: rolePermission,
      };
    },
  },
]);
