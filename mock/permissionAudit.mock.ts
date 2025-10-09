import { defineMock } from 'vite-plugin-mock-dev-server';

// 模拟权限统计数据
const mockPermissionStatistics = {
  totalButtons: 15,
  activeButtons: 12,
  inactiveButtons: 3,
  totalInterfaces: 20,
  usedInterfaces: 16,
  unusedInterfaces: 4,
  topUsedButtons: [
    {
      buttonId: '1',
      buttonName: '新增用户',
      usageCount: 1250,
    },
    {
      buttonId: '2',
      buttonName: '编辑用户',
      usageCount: 980,
    },
    {
      buttonId: '12',
      buttonName: '新增应用',
      usageCount: 856,
    },
    {
      buttonId: '15',
      buttonName: '查看应用',
      usageCount: 1200,
    },
    {
      buttonId: '5',
      buttonName: '新增角色',
      usageCount: 450,
    },
  ],
  topUsedInterfaces: [
    {
      interfaceId: 'api_user_add',
      interfaceCode: '/api/system/user/add',
      usageCount: 1250,
    },
    {
      interfaceId: 'api_user_edit',
      interfaceCode: '/api/system/user/edit',
      usageCount: 980,
    },
    {
      interfaceId: 'api_apps_add',
      interfaceCode: '/api/engine/apps/add',
      usageCount: 856,
    },
    {
      interfaceId: 'api_apps_view',
      interfaceCode: '/api/engine/apps/view',
      usageCount: 1200,
    },
    {
      interfaceId: 'api_role_add',
      interfaceCode: '/api/system/role/add',
      usageCount: 450,
    },
  ],
};

// 模拟权限变更日志数据
const mockPermissionChangeLogs = [
  {
    id: '1',
    operationType: 'create',
    targetType: 'button',
    targetId: '16',
    targetName: '导出用户',
    operatorId: 'admin',
    operatorName: '系统管理员',
    operationTime: '2024-01-15 14:30:00',
    description: '创建了新的权限按钮：导出用户',
    beforeData: null,
    afterData: {
      name: '导出用户',
      code: 'system:user:export',
      menuId: '259950204508307456',
      description: '导出用户数据权限按钮',
    },
  },
  {
    id: '2',
    operationType: 'update',
    targetType: 'button',
    targetId: '1',
    targetName: '新增用户',
    operatorId: 'admin',
    operatorName: '系统管理员',
    operationTime: '2024-01-15 10:20:00',
    description: '更新了权限按钮：新增用户',
    beforeData: {
      name: '新增用户',
      code: 'system:user:add',
      description: '新增用户权限按钮',
    },
    afterData: {
      name: '新增用户',
      code: 'system:user:add',
      description: '新增用户权限按钮（已更新描述）',
    },
  },
  {
    id: '3',
    operationType: 'assign',
    targetType: 'role',
    targetId: 'user-role',
    targetName: '普通用户',
    operatorId: 'admin',
    operatorName: '系统管理员',
    operationTime: '2024-01-14 16:45:00',
    description: '为角色"普通用户"分配了权限',
    beforeData: {
      menuPermissions: ['262781066388107264'],
      buttonPermissions: ['12'],
    },
    afterData: {
      menuPermissions: ['262781066388107264', '262781545507647488'],
      buttonPermissions: ['12', '15'],
    },
  },
  {
    id: '4',
    operationType: 'delete',
    targetType: 'button',
    targetId: '17',
    targetName: '批量导入用户',
    operatorId: 'admin',
    operatorName: '系统管理员',
    operationTime: '2024-01-14 09:15:00',
    description: '删除了权限按钮：批量导入用户',
    beforeData: {
      name: '批量导入用户',
      code: 'system:user:import',
      menuId: '259950204508307456',
      description: '批量导入用户权限按钮',
    },
    afterData: null,
  },
  {
    id: '5',
    operationType: 'revoke',
    targetType: 'role',
    targetId: 'operator-role',
    targetName: '操作员',
    operatorId: 'admin',
    operatorName: '系统管理员',
    operationTime: '2024-01-13 11:30:00',
    description: '撤销了角色"操作员"的部分权限',
    beforeData: {
      menuPermissions: ['295674094257594368', '295682339458224128', '295687416063430656'],
      buttonPermissions: ['20', '21'],
    },
    afterData: {
      menuPermissions: ['295674094257594368', '295682339458224128'],
      buttonPermissions: [],
    },
  },
  {
    id: '6',
    operationType: 'create',
    targetType: 'interface',
    targetId: 'api_user_export',
    targetName: '导出用户接口',
    operatorId: 'admin',
    operatorName: '系统管理员',
    operationTime: '2024-01-12 15:20:00',
    description: '创建了新的接口权限：导出用户接口',
    beforeData: null,
    afterData: {
      interfaceCode: '/api/system/user/export',
      interfaceRemark: '导出用户数据接口',
    },
  },
  {
    id: '7',
    operationType: 'update',
    targetType: 'button',
    targetId: '12',
    targetName: '新增应用',
    operatorId: 'admin',
    operatorName: '系统管理员',
    operationTime: '2024-01-12 08:45:00',
    description: '更新了权限按钮：新增应用',
    beforeData: {
      name: '新增应用',
      code: 'engine:apps:add',
      description: '新增应用权限按钮',
    },
    afterData: {
      name: '新增应用',
      code: 'engine:apps:add',
      description: '新增应用权限按钮（更新了权限范围）',
    },
  },
  {
    id: '8',
    operationType: 'assign',
    targetType: 'role',
    targetId: 'admin-role',
    targetName: '系统管理员',
    operatorId: 'admin',
    operatorName: '系统管理员',
    operationTime: '2024-01-11 14:10:00',
    description: '为角色"系统管理员"分配了新的权限',
    beforeData: {
      menuPermissions: ['235123826202185728', '259950204508307456'],
      buttonPermissions: ['1', '2', '3', '4'],
    },
    afterData: {
      menuPermissions: ['235123826202185728', '259950204508307456', '259950660651450368'],
      buttonPermissions: ['1', '2', '3', '4', '5', '6', '7', '8'],
    },
  },
];

// 模拟异常检测结果数据
const mockAnomalyDetectionResults = [
  {
    id: '1',
    anomalyType: 'unused_permission',
    description: '发现未使用的权限按钮：批量删除用户',
    severity: 'medium',
    detectedTime: '2024-01-15 16:30:00',
    status: 'pending',
  },
  {
    id: '2',
    anomalyType: 'duplicate_permission',
    description: '发现重复的权限代码：system:user:view',
    severity: 'high',
    detectedTime: '2024-01-15 14:20:00',
    status: 'pending',
  },
  {
    id: '3',
    anomalyType: 'orphaned_interface',
    description: '发现孤立的接口权限：/api/system/user/old',
    severity: 'low',
    detectedTime: '2024-01-15 10:15:00',
    status: 'resolved',
  },
  {
    id: '4',
    anomalyType: 'excessive_permissions',
    description: '角色"普通用户"拥有过多权限，可能存在安全风险',
    severity: 'high',
    detectedTime: '2024-01-14 09:45:00',
    status: 'pending',
  },
  {
    id: '5',
    anomalyType: 'missing_permission',
    description: '菜单"应用中心"缺少对应的查看权限',
    severity: 'medium',
    detectedTime: '2024-01-14 08:30:00',
    status: 'ignored',
  },
  {
    id: '6',
    anomalyType: 'inconsistent_naming',
    description: '权限代码命名不一致：system:user:add 和 engine:apps:create',
    severity: 'low',
    detectedTime: '2024-01-13 15:20:00',
    status: 'resolved',
  },
  {
    id: '7',
    anomalyType: 'unused_interface',
    description: '发现未使用的接口权限：/api/system/role/old',
    severity: 'medium',
    detectedTime: '2024-01-13 11:10:00',
    status: 'pending',
  },
  {
    id: '8',
    anomalyType: 'circular_dependency',
    description: '检测到权限循环依赖：菜单A依赖菜单B，菜单B依赖菜单A',
    severity: 'high',
    detectedTime: '2024-01-12 16:45:00',
    status: 'pending',
  },
];

export default defineMock([
  // 获取权限使用统计
  {
    url: '/api/system/permission/audit/statistics',
    method: 'GET',
    enabled: false,
    body: (req) => {
      const { startTime, endTime } = req.query;
      
      // 根据时间范围调整统计数据（这里简化处理）
      const statistics = { ...mockPermissionStatistics };
      
      if (startTime && endTime) {
        // 模拟根据时间范围调整数据
        const start = new Date(startTime as string);
        const end = new Date(endTime as string);
        const now = new Date();
        
        // 如果查询的是过去的数据，适当调整使用次数
        if (end < now) {
          statistics.topUsedButtons = statistics.topUsedButtons.map(item => ({
            ...item,
            usageCount: Math.floor(item.usageCount * 0.8),
          }));
          statistics.topUsedInterfaces = statistics.topUsedInterfaces.map(item => ({
            ...item,
            usageCount: Math.floor(item.usageCount * 0.8),
          }));
        }
      }
      
      return {
        code: 200,
        message: '操作成功',
        data: statistics,
      };
    },
  },
  
  // 获取权限变更日志
  {
    url: '/api/system/permission/audit/changeLog',
    method: 'GET',
    enabled: false,
    body: (req) => {
      const { 
        pageNumber = 1, 
        pageSize = 10, 
        operationType, 
        targetType, 
        startTime, 
        endTime 
      } = req.query;
      
      let filteredData = [...mockPermissionChangeLogs];
      
      // 根据查询条件过滤数据
      if (operationType) {
        filteredData = filteredData.filter(item => item.operationType === operationType);
      }
      if (targetType) {
        filteredData = filteredData.filter(item => item.targetType === targetType);
      }
      if (startTime) {
        filteredData = filteredData.filter(item => 
          new Date(item.operationTime) >= new Date(startTime as string)
        );
      }
      if (endTime) {
        filteredData = filteredData.filter(item => 
          new Date(item.operationTime) <= new Date(endTime as string)
        );
      }
      
      // 按时间倒序排列
      filteredData.sort((a, b) => 
        new Date(b.operationTime).getTime() - new Date(a.operationTime).getTime()
      );
      
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
  
  // 获取异常权限检测结果
  {
    url: '/api/system/permission/audit/anomaly',
    method: 'GET',
    enabled: false,
    body: (req) => {
      const { pageNumber = 1, pageSize = 10, anomalyType } = req.query;
      
      let filteredData = [...mockAnomalyDetectionResults];
      
      // 根据查询条件过滤数据
      if (anomalyType) {
        filteredData = filteredData.filter(item => item.anomalyType === anomalyType);
      }
      
      // 按检测时间倒序排列
      filteredData.sort((a, b) => 
        new Date(b.detectedTime).getTime() - new Date(a.detectedTime).getTime()
      );
      
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
]);
