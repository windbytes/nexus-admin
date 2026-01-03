/**
 * 系统参数模块配置
 */

// 是否使用模拟数据（开发阶段设置为true，生产环境设置为false）
export const USE_MOCK_DATA = import.meta.env.MODE === 'development';

// 分页配置
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// 分页显示配置
export const PAGINATION_CONFIG = {
  showQuickJumper: true,
  hideOnSinglePage: false,
  showSizeChanger: true,
  showTotal: true,
};

// 表格列配置
export const TABLE_COLUMNS_CONFIG = {
  // 是否显示序号列
  showSerialNumber: true,
  // 是否显示选择列
  showSelection: true,
  // 是否显示操作列
  showActions: true,
  // 是否显示状态列
  showStatus: true,
  // 是否显示创建时间列
  showCreateTime: true,
};

// 搜索配置
export const SEARCH_CONFIG = {
  // 是否默认展开搜索
  defaultExpanded: false,
  // 搜索字段配置
  fields: {
    name: {
      label: '参数名称',
      placeholder: '请输入参数名称',
      type: 'input',
      required: false,
    },
    code: {
      label: '参数键值',
      placeholder: '请输入参数键值',
      type: 'input',
      required: false,
    },
    category: {
      label: '参数分类',
      placeholder: '请选择参数分类',
      type: 'select',
      required: false,
    },
  },
};

// 表单验证规则
export const VALIDATION_RULES = {
  code: {
    pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
    message: '参数标识只能包含字母、数字和下划线，且必须以字母开头',
  },
  name: {
    max: 255,
    message: '参数名称不能超过255个字符',
  },
  description: {
    max: 255,
    message: '参数描述不能超过255个字符',
  },
};

// 权限配置
export const PERMISSIONS = {
  // 查看权限
  view: 'sys:param:view',
  // 新增权限
  create: 'sys:param:create',
  // 编辑权限
  update: 'sys:param:update',
  // 删除权限
  delete: 'sys:param:delete',
  // 批量删除权限
  batchDelete: 'sys:param:batchDelete',
};
