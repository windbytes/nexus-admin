/**
 * 菜单树：从 syndra/database/postgresql/system/sys_menu.sql 抽出，
 * 形状对齐后端 SysMenuServiceImpl.getPermissionJsonObject。
 * meta.title 使用中文（前端 locales 尚无对应 i18n key）。
 * component 对已有前端页面做了归一化。
 */

export interface MockRouteItem {
  id: string;
  parentId?: string;
  path: string;
  component: string;
  name?: string | null;
  route?: boolean;
  redirect?: string;
  hidden?: boolean;
  children?: MockRouteItem[];
  childrenRoute?: MockRouteItem[];
  meta: {
    title: string;
    icon?: string;
    keepAlive?: boolean;
    menuType?: number;
    requiresAuth?: boolean;
  };
}

function leaf(
  id: string,
  parentId: string,
  title: string,
  path: string,
  component: string,
  icon: string,
  menuType = 1
): MockRouteItem {
  return {
    id,
    parentId,
    path,
    component,
    name: path.replace(/^\//, '').replace(/\//g, '-'),
    route: true,
    meta: {
      title,
      icon,
      keepAlive: false,
      menuType,
      requiresAuth: true,
    },
  };
}

function group(id: string, title: string, redirect: string, icon: string, children: MockRouteItem[]): MockRouteItem {
  return {
    id,
    parentId: '',
    path: '',
    component: '',
    route: false,
    redirect,
    children,
    meta: {
      title,
      icon,
      keepAlive: false,
      menuType: 0,
      requiresAuth: true,
    },
  };
}

/** SUPER_ADMIN 全量菜单（与 SQL 种子一致） */
export const MOCK_MENUS: MockRouteItem[] = [
  group('235123826202185728', '仪表盘', '/dashboard/workbench', 'DashboardOutlined', [
    leaf('235123826202185738', '235123826202185728', '工作台', '/dashboard/workbench', 'dashboard', 'HomeOutlined'),
    leaf('235123826202185739', '235123826202185728', '监控台', '/dashboard/monitor', 'dashboard', 'MonitorOutlined'),
  ]),
  group('235123826202185729', '数据统计', '/statics/message-search', 'LineChartOutlined', [
    leaf(
      '235123826202185740',
      '235123826202185729',
      '消息检索',
      '/statics/message-search',
      'statics/MessageSearch',
      'SearchOutlined'
    ),
    leaf(
      '235123826202185741',
      '235123826202185729',
      '端点统计',
      '/statics/endpoint',
      'statics/Endpoint',
      'ApiOutlined'
    ),
    leaf(
      '235123826202185742',
      '235123826202185729',
      '错误统计',
      '/statics/error-statics',
      'statics/ErrorStatics',
      'ExclamationCircleOutlined'
    ),
    leaf(
      '235123826202185743',
      '235123826202185729',
      '测试消息',
      '/statics/test-message',
      'statics/TestMessage',
      'MessageOutlined'
    ),
  ]),
  group('235123826202185730', '资源维护', '/resource/database', 'DatabaseOutlined', [
    leaf(
      '235123826202185744',
      '235123826202185730',
      '数据库资源',
      '/resource/database',
      'resource/Database',
      'DatabaseOutlined'
    ),
    leaf(
      '235123826202185745',
      '235123826202185730',
      '数据模型',
      '/resource/data-mode',
      'resource/DataMode',
      'UnorderedListOutlined'
    ),
    leaf(
      '235123826202185746',
      '235123826202185730',
      '传输资源',
      '/resource/transfer',
      'resource/Transfer',
      'SwapOutlined'
    ),
    leaf('235123826202185747', '235123826202185730', 'SSL', '/resource/ssl', 'resource/SSL', 'LockOutlined'),
    leaf('235123826202185748', '235123826202185730', 'Web', '/resource/web', 'resource/Web', 'ApiOutlined'),
    leaf('235123826202185749', '235123826202185730', 'DLL', '/resource/dll', 'resource/Dll', 'FileUnknownOutlined'),
  ]),
  group('235123826202185731', '连接管理', '/connection/database', 'ApartmentOutlined', [
    leaf(
      '235123826202185750',
      '235123826202185731',
      '数据库连接',
      '/connection/database',
      'connection/Database',
      'DatabaseOutlined'
    ),
    leaf(
      '235123826202185751',
      '235123826202185731',
      'JMS 连接',
      '/connection/jms',
      'connection/Jms',
      'MessageOutlined'
    ),
  ]),
  group('235123826202185732', '数据处理', '/engine/processing/data-transfer', 'SwapOutlined', [
    leaf(
      '235123826202185752',
      '235123826202185732',
      '数据传输',
      '/engine/processing/data-transfer',
      'engine/processing/DataTransfer',
      'SwapOutlined'
    ),
    leaf(
      '235123826202185753',
      '235123826202185732',
      '变量',
      '/engine/processing/variable',
      'engine/processing/Variable',
      'EditOutlined'
    ),
    leaf(
      '235123826202185754',
      '235123826202185732',
      '代码集',
      '/engine/processing/code-set',
      'engine/processing/CodeSet',
      'OrderedListOutlined'
    ),
    leaf(
      '235123826202185755',
      '235123826202185732',
      '脚本',
      '/engine/processing/script',
      'engine/processing/Script',
      'FileMarkdownOutlined'
    ),
  ]),
  group('235123826202185733', '系统管理', '/system/menu', 'SettingOutlined', [
    leaf('235123826202185756', '235123826202185733', '菜单管理', '/system/menu', 'system/menu', 'MenuOutlined'),
    leaf('235123826202185758', '235123826202185733', '接口管理', '/system/api', 'system/api', 'ApiOutlined'),
    leaf(
      '235123826202185759',
      '235123826202185733',
      '角色管理',
      '/system/role',
      'system/role',
      'UsergroupDeleteOutlined'
    ),
    leaf('235123826202185760', '235123826202185733', '用户管理', '/system/user', 'system/user', 'UserOutlined'),
    leaf('235123826202185761', '235123826202185733', '字典管理', '/system/dict', 'system/dict', 'BookOutlined'),
    leaf('235123826202185762', '235123826202185733', '参数配置', '/system/params', 'system/config', 'SettingOutlined'),
    leaf(
      '235123826202185763',
      '235123826202185733',
      '系统公告',
      '/system/announcement',
      'system/Announcement',
      'BellOutlined'
    ),
  ]),
  group('235123826202185734', '系统监控', '/monitor/timer', 'MonitorOutlined', [
    leaf('235123826202185764', '235123826202185734', '定时任务', '/monitor/timer', 'monitor', 'ClockCircleOutlined'),
  ]),
  group('235123826202185735', '集成管理', '/engine/app', 'AppstoreOutlined', [
    {
      ...leaf('235123826202185765', '235123826202185735', '应用中心', '/engine/app', 'engine/app', 'AppstoreOutlined'),
      childrenRoute: [
        leaf(
          '235123826202185768',
          '235123826202185765',
          '流程编排',
          '/engine/$appId/flow',
          'engine/flow',
          'SwitcherOutlined',
          2
        ),
      ],
    },
    leaf(
      '235123826202185766',
      '235123826202185735',
      '端点维护',
      '/engine/endpoint',
      'engine/endpoint',
      'DeploymentUnitOutlined'
    ),
    leaf(
      '235123826202185767',
      '235123826202185735',
      '端点配置',
      '/engine/endpoint-cfg',
      'engine/endpoint-cfg',
      'SettingOutlined'
    ),
    leaf(
      '235123826202185769',
      '235123826202185735',
      '模板库',
      '/engine/template',
      'engine/template',
      'FileMarkdownOutlined'
    ),
    leaf(
      '235123826202185770',
      '235123826202185735',
      '版本管理',
      '/engine/version',
      'engine/version',
      'HistoryOutlined'
    ),
    leaf('235123826202185771', '235123826202185735', '插件市场', '/engine/market', 'engine/market', 'FundOutlined'),
    leaf(
      '235123826202185772',
      '235123826202185735',
      '执行记录',
      '/engine/execution',
      'engine/execution',
      'FieldTimeOutlined'
    ),
    leaf(
      '235123826202185773',
      '235123826202185735',
      '指标汇集',
      '/engine/metrics',
      'engine/metrics',
      'LineChartOutlined'
    ),
  ]),
  group('235123826202185736', '消息中心', '/message/template', 'MessageOutlined', [
    leaf(
      '235123826202185774',
      '235123826202185736',
      '消息模板',
      '/message/template',
      'message',
      'FileMarkdownOutlined'
    ),
  ]),
  leaf('235123826202185775', '', 'menu.editor.sdwriter', '/editor/sdwriter', 'editor/sdwriter', 'EditOutlined', 0),
];

export const MOCK_HOME_PATH = '/dashboard/workbench';
