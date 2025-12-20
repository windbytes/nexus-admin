// 只导入项目中实际使用的图标，而不是整个图标库
import {
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
  DeleteOutlined as DeleteIcon,
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
import { Pagination } from 'antd';
import { random } from 'lodash-es';
import type React from 'react';
import { useMemo, useState } from 'react';

// 定义图标映射，只包含实际使用的图标
const iconMap = {
  // 系统相关
  SettingOutlined: SettingOutlined,
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
  DeleteIcon: DeleteIcon,
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

// 将图标映射转换为数组，用于分页显示
const iconList = Object.entries(iconMap).map(([name, Icon]) => ({
  name,
  Icon,
  displayName: name,
}));

/**
 * 优化后的图标面板组件
 * 只加载项目中实际使用的图标，避免加载整个图标库
 */
const OptimizedIconPanel: React.FC<IconPanelProps> = (props) => {
  const { onSelect } = props;
  // 当前选中的图标
  const [selectedIcon, setSelectedIcon] = useState<string>('');
  // 当前分页
  const [currentPage, setCurrentPage] = useState<number>(1);
  // 每页显示的图标数量
  const pageSize = 60;

  // 计算当前页需要显示的图标
  const paginatedIcons = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return iconList.slice(startIndex, endIndex);
  }, [currentPage]);

  // 处理图标选中
  const handleIconClick = (iconName: string) => {
    setSelectedIcon(iconName);
    onSelect(iconName);
  };

  return (
    <>
      <div className="icon-panel flex flex-wrap gap-2 p-4">
        {paginatedIcons.map(({ name, Icon }) => {
          const id = random();
          return (
            <div
              key={`${name}-${id}`}
              className={`icon-item cursor-pointer hover:bg-[#ddd] w-[20px] text-center ${
                selectedIcon === name ? 'bg-[#1890ff] text-white' : ''
              }`}
              onClick={() => handleIconClick(name)}
              title={name}
            >
              <Icon style={{ fontSize: '18px' }} />
            </div>
          );
        })}
      </div>
      {/* 分页组件 */}
      <Pagination
        className="absolute bottom-2"
        current={currentPage}
        size="small"
        pageSize={pageSize}
        total={iconList.length}
        onChange={(page) => setCurrentPage(page)}
      />
    </>
  );
};

export default OptimizedIconPanel;

/**
 * 选择图标时候调用的回调，返回当前选中的图标
 */
export interface IconPanelProps {
  onSelect: (icon: string) => void;
}

/**
 * 获取可用的图标列表（用于搜索和过滤）
 */
export const getAvailableIcons = () => {
  return Object.keys(iconMap);
};

/**
 * 根据图标名称获取图标组件
 */
export const getIconByName = (name: string) => {
  return iconMap[name as keyof typeof iconMap];
};
