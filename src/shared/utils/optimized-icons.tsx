// 只导入项目中实际使用的图标，按需加载
import {
  AimOutlined,
  AlertOutlined,
  // 其他常用图标
  ApartmentOutlined,
  ApiOutlined,
  AppstoreAddOutlined,
  AppstoreOutlined,
  ArrowRightOutlined,
  BellOutlined,
  BookOutlined,
  CaretDownOutlined,
  CheckOutlined,
  ClearOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CloseOutlined,
  ClusterOutlined,
  ColumnHeightOutlined,
  CommentOutlined,
  CopyOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  DeploymentUnitOutlined,
  DotChartOutlined,
  DownloadOutlined,
  // 方向相关图标
  DownOutlined,
  EditOutlined,
  EllipsisOutlined,
  ExclamationCircleFilled,
  ExclamationCircleOutlined,
  ExpandAltOutlined,
  ExportOutlined,
  FallOutlined,
  FieldTimeOutlined,
  // 文件相关图标
  FileAddFilled,
  FileDoneOutlined,
  FileMarkdownOutlined,
  FileSearchOutlined,
  FileUnknownOutlined,
  FilterOutlined,
  FolderFilled,
  FolderOpenFilled,
  ForkOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  FundOutlined,
  GithubOutlined,
  HeatMapOutlined,
  HistoryOutlined,
  HomeOutlined,
  ImportOutlined,
  InfoCircleOutlined,
  LeftOutlined,
  LineChartOutlined,
  LoadingOutlined,
  LockOutlined,
  MailOutlined,
  ManOutlined,
  MediumOutlined,
  MenuFoldOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  MessageOutlined,
  MonitorOutlined,
  MoonOutlined,
  MoreOutlined,
  NodeCollapseOutlined,
  NodeIndexOutlined,
  NotificationOutlined,
  OrderedListOutlined,
  // 操作相关图标
  PlusOutlined,
  // 菜单相关图标
  ProjectOutlined,
  QuestionCircleOutlined,
  ReconciliationOutlined,
  ReloadOutlined,
  RightOutlined,
  // 数据相关图标
  RiseOutlined,
  SearchOutlined,
  SecurityScanOutlined,
  // 系统相关图标
  SettingOutlined,
  ShareAltOutlined,
  SolutionOutlined,
  StarFilled,
  SunOutlined,
  SwapOutlined,
  SwitcherOutlined,
  TagOutlined,
  TagsOutlined,
  ToolOutlined,
  UndoOutlined,
  UnlockOutlined,
  UnorderedListOutlined,
  UpOutlined,
  UserAddOutlined,
  UsergroupDeleteOutlined,
  // 用户相关图标
  UserOutlined,
  WarningOutlined,
  WomanOutlined,
} from '@ant-design/icons';
import React from 'react';
import { MyIcon } from '@/shared/components/common/MyIcon/index';

// 定义图标映射，只包含实际使用的图标
const iconMap: { [key: string]: React.ComponentType<any> } = {
  // 系统相关
  SettingOutlined: SettingOutlined,
  AimOutlined: AimOutlined,
  BellOutlined: BellOutlined,
  GithubOutlined: GithubOutlined,
  LockOutlined: LockOutlined,
  MailOutlined: MailOutlined,
  SearchOutlined: SearchOutlined,
  ClearOutlined: ClearOutlined,
  ClockCircleOutlined: ClockCircleOutlined,
  DeleteOutlined: DeleteOutlined,
  FullscreenExitOutlined: FullscreenExitOutlined,
  FullscreenOutlined: FullscreenOutlined,
  MenuFoldOutlined: MenuFoldOutlined,
  MenuUnfoldOutlined: MenuUnfoldOutlined,
  QuestionCircleOutlined: QuestionCircleOutlined,
  UserAddOutlined: UserAddOutlined,
  MessageOutlined: MessageOutlined,
  NotificationOutlined: NotificationOutlined,
  ReconciliationOutlined: ReconciliationOutlined,
  HomeOutlined: HomeOutlined,

  // 操作相关
  PlusOutlined: PlusOutlined,
  EditOutlined: EditOutlined,
  ReloadOutlined: ReloadOutlined,
  DownloadOutlined: DownloadOutlined,
  ExportOutlined: ExportOutlined,
  ImportOutlined: ImportOutlined,
  CopyOutlined: CopyOutlined,
  CheckOutlined: CheckOutlined,
  CloseOutlined: CloseOutlined,
  MoreOutlined: MoreOutlined,
  ExclamationCircleFilled: ExclamationCircleFilled,
  ExclamationCircleOutlined: ExclamationCircleOutlined,
  WarningOutlined: WarningOutlined,
  InfoCircleOutlined: InfoCircleOutlined,

  // 用户相关
  UserOutlined: UserOutlined,
  ManOutlined: ManOutlined,
  WomanOutlined: WomanOutlined,
  LoadingOutlined: LoadingOutlined,
  UsergroupDeleteOutlined: UsergroupDeleteOutlined,

  // 方向相关
  DownOutlined: DownOutlined,
  UpOutlined: UpOutlined,
  LeftOutlined: LeftOutlined,
  RightOutlined: RightOutlined,
  ArrowRightOutlined: ArrowRightOutlined,
  CaretDownOutlined: CaretDownOutlined,

  // 文件相关
  FileAddFilled: FileAddFilled,
  FolderFilled: FolderFilled,
  FolderOpenFilled: FolderOpenFilled,
  BookOutlined: BookOutlined,
  MenuOutlined: MenuOutlined,

  // 数据相关
  RiseOutlined: RiseOutlined,
  FallOutlined: FallOutlined,
  UnorderedListOutlined: UnorderedListOutlined,
  ColumnHeightOutlined: ColumnHeightOutlined,
  OrderedListOutlined: OrderedListOutlined,
  HistoryOutlined: HistoryOutlined,
  AppstoreAddOutlined: AppstoreAddOutlined,

  // 菜单相关图标
  ProjectOutlined: ProjectOutlined,
  ClusterOutlined: ClusterOutlined,
  FileSearchOutlined: FileSearchOutlined,
  CloseCircleOutlined: CloseCircleOutlined,
  SwapOutlined: SwapOutlined,
  FieldTimeOutlined: FieldTimeOutlined,
  DatabaseOutlined: DatabaseOutlined,
  CommentOutlined: CommentOutlined,
  MonitorOutlined: MonitorOutlined,
  DeploymentUnitOutlined: DeploymentUnitOutlined,
  HeatMapOutlined: HeatMapOutlined,
  LineChartOutlined: LineChartOutlined,
  FundOutlined: FundOutlined,
  FileDoneOutlined: FileDoneOutlined,
  FileMarkdownOutlined: FileMarkdownOutlined,
  ForkOutlined: ForkOutlined,
  DotChartOutlined: DotChartOutlined,
  NodeIndexOutlined: NodeIndexOutlined,
  FileUnknownOutlined: FileUnknownOutlined,
  ShareAltOutlined: ShareAltOutlined,
  NodeCollapseOutlined: NodeCollapseOutlined,
  MediumOutlined: MediumOutlined,
  DashboardOutlined: DashboardOutlined,

  // 其他常用
  ApartmentOutlined: ApartmentOutlined,
  ApiOutlined: ApiOutlined,
  AppstoreOutlined: AppstoreOutlined,
  SolutionOutlined: SolutionOutlined,
  StarFilled: StarFilled,
  EllipsisOutlined: EllipsisOutlined,
  SwitcherOutlined: SwitcherOutlined,
  FilterOutlined: FilterOutlined,
  TagOutlined: TagOutlined,
  TagsOutlined: TagsOutlined,
  UndoOutlined: UndoOutlined,
  UnlockOutlined: UnlockOutlined,
  ExpandAltOutlined: ExpandAltOutlined,
  SecurityScanOutlined: SecurityScanOutlined,
  MoonOutlined: MoonOutlined,
  SunOutlined: SunOutlined,
  AlertOutlined: AlertOutlined,
  ToolOutlined: ToolOutlined,
};

/**
 * 动态渲染 Icon 图标（优化版本，只加载实际使用的图标）
 * @param name 图表名
 */
export const getIcon = (name: string | undefined | null) => {
  if (name && name.indexOf('syndra') > -1) {
    return <MyIcon type={`${name}`} />;
  }
  return addIcon(name);
};

/**
 * 使用antd的图标库（优化版本，按需加载）
 * @param name 图标名
 * @returns
 */
export const addIcon = (name: string | undefined | null) => {
  if (!name || !iconMap[name]) {
    return null;
  }
  const IconComponent = iconMap[name];
  return React.createElement(IconComponent);
};

/**
 * 获取可用的图标列表
 */
export const getAvailableIcons = () => {
  return Object.keys(iconMap);
};

/**
 * 检查图标是否存在
 */
export const hasIcon = (name: string) => {
  return name in iconMap;
};
