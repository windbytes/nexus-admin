/**
 * 集成引擎 - 应用列表页及卡片操作相关文案
 * 含：类型分段、状态筛选、创建/编辑/复制/导出等
 */
const translation = {
  segment: {
    all: '全部',
    more: '更多',
    collapse: '收起',
    integrated: '集成项目',
    interface: '接口项目',
    tripartite: '三方项目',
  },
  statusFilter: '状态',
  status: {
    all: '全部',
    stopped: '未启动',
    normal: '正常',
    error: '异常',
    partialError: '部分异常',
  },
  statusLabel: '状态',
  list: '应用列表',
  createBy: '我创建的',
  allTags: '全部标签',
  newApp: {
    createApp: '创建应用',
    startFromBlank: '创建空白项目',
    startFromTemplate: '从应用模板创建',
    importFromDSL: '导入 DSL',
  },
  editApp: '编辑应用',
  duplicate: '复制',
  export: '导出 DSL',
  saveAsTemplate: '存为模板',
  switch: '切换为集成项目',
  deleteAppConfirmTitle: '确认删除应用？',
  deleteAppConfirmContent: '删除应用后，用户将无法访问该应用，所有配置和日志均将一并被永久删除。',
  deleteApp: {
    success: '删除成功',
    error: {
      title: '删除失败',
      content: '删除失败：{{error}}',
    },
  },
  updateApp: {
    success: '更新成功',
    error: {
      title: '更新失败',
      content: '更新失败：{{error}}',
    },
  },
  copyApp: {
    success: '复制成功',
    error: {
      title: '复制失败',
      content: '复制失败：{{error}}',
    },
  },
  exportSuccess: '导出成功',
  exportError: {
    title: '导出失败',
  },
  name: '应用名称',
  namePlaceholder: '请输入应用名称',
  type: '应用类型',
  icon: '图标',
  iconBg: '图标背景色',
  priority: '优先级',
  logLevel: '日志级别',
  remark: '备注',
  remarkPlaceholder: '备注信息',
};

export default translation;
