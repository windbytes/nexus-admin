/**
 * 工具栏：左（文件下拉 + 快捷按钮）| 中（Tab 标签 + 展开/收缩）| 右（上传、分享）
 * 同一行等高；中间 Tab 切换后，下方内容区拉通整行显示，不使用 antd Tabs
 */
import {
  CaretDownOutlined,
  CloudUploadOutlined,
  DownOutlined,
  MenuOutlined,
  ShareAltOutlined,
  UpOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Card, Dropdown } from 'antd';
import { useState } from 'react';
import { fileMenuConfig, leftQuickActionsConfig } from '../../config/fileMenuConfig';
import type { FileMenuConfigItem, FileMenuItem, TabItemConfig } from '../../types';

/** 将文件菜单配置转为 antd Menu items */
function fileConfigToMenuItems(config: FileMenuConfigItem[]): MenuProps['items'] {
  return config.map((item) => {
    if ('type' in item && item.type === 'divider') {
      return { type: 'divider' as const };
    }
    const menuItem = item as FileMenuItem;
    const base = { key: menuItem.key, label: menuItem.label, icon: menuItem.icon };
    if (menuItem.children?.length) {
      return {
        ...base,
        children: menuItem.children.map((child) => ({ key: child.key, label: child.label })),
      };
    }
    return base;
  });
}

/** 单行高度，保证左中右对齐 */
const TOOLBAR_ROW_HEIGHT = 40;

interface TabToolbarProps {
  /** 中间 Tab 及工具配置（不含文件） */
  config: TabItemConfig[];
  activeTabKey?: string;
  onTabChange?: (key: string) => void;
  onToolClick?: (tabKey: string, toolKey: string) => void;
  onFileMenuClick?: (key: string) => void;
  onLeftQuickActionClick?: (key: string) => void;
  onUploadClick?: () => void;
  onShareClick?: () => void;
  uploadLabel?: string;
  className?: string;
}

const TabToolbar: React.FC<TabToolbarProps> = ({
  config,
  activeTabKey,
  onTabChange,
  onToolClick,
  onFileMenuClick,
  onLeftQuickActionClick,
  onUploadClick,
  onShareClick,
  uploadLabel = '未上云',
  className = '',
}) => {
  const [toolbarExpanded, setToolbarExpanded] = useState(true);
  const centerTabs = config.filter((t) => t.key !== 'file');
  const defaultKey = centerTabs[0]?.key ?? '';
  const currentKey = activeTabKey ?? defaultKey;
  const currentTab = centerTabs.find((t) => t.key === currentKey);

  const fileMenuItems = fileConfigToMenuItems(fileMenuConfig);

  return (
    <div
      className={`flex flex-col border-b border-gray-200 bg-[#f5f5f5] shadow-sm ${className}`}
      style={{ borderRadius: '8px 8px 0 0' }}
    >
      {/* 第一行：左 | 中（Tab 标签 + 展开/收缩）| 右，同一行等高 */}
      <div className="flex min-w-0 items-center" style={{ minHeight: TOOLBAR_ROW_HEIGHT }}>
        {/* 左侧：文件下拉 + 竖线 + 快捷按钮 */}
        <div className="flex h-full shrink-0 items-center gap-0 border-r border-gray-200 pl-2 pr-2">
          <Dropdown
            menu={{ items: fileMenuItems, onClick: ({ key }) => onFileMenuClick?.(key) }}
            trigger={['click']}
            placement="bottomLeft"
            classNames={{
              root: 'w-44',
            }}
          >
            <Button type="text" size="small" className="flex items-center gap-1 text-gray-700">
              <MenuOutlined />
              <span>文件</span>
              <CaretDownOutlined className="text-xs" />
            </Button>
          </Dropdown>
          <div className="ml-1 h-5 w-px bg-gray-300" />
          <div className="flex items-center gap-0">
            {leftQuickActionsConfig.map((action) => (
              <Button
                key={action.key}
                type="text"
                size="small"
                title={action.label}
                onClick={() => onLeftQuickActionClick?.(action.key)}
                className="flex items-center justify-center text-gray-600 hover:text-gray-800"
              >
                {action.icon}
              </Button>
            ))}
          </div>
        </div>

        {/* 中间：Tab 标签；收缩时在右侧显示展开图标 */}
        <div className="flex flex-1 min-w-0 items-center gap-0">
          <div className="flex flex-1 items-end min-w-0 justify-center">
            {centerTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => onTabChange?.(tab.key)}
                className={`shrink-0 px-4 py-2 text-sm transition-colors ${
                  currentKey === tab.key
                    ? 'border-b-2 border-blue-600 font-medium text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {!toolbarExpanded && (
            <Button
              type="text"
              size="small"
              title="展开工具栏"
              onClick={() => setToolbarExpanded(true)}
              className="shrink-0 text-gray-500 hover:text-gray-700"
              icon={<DownOutlined />}
            />
          )}
        </div>

        {/* 右侧：上传、分享 */}
        <div className="flex shrink-0 items-center gap-2 border-l border-gray-200 pl-2 pr-3">
          <Button
            type="text"
            size="small"
            className="flex items-center gap-1 text-gray-600"
            icon={<CloudUploadOutlined />}
            onClick={onUploadClick}
          >
            {uploadLabel}
          </Button>
          <Button type="primary" size="small" icon={<ShareAltOutlined />} onClick={onShareClick}>
            分享
          </Button>
        </div>
      </div>

      {/* 第二行：Tab 内容区拉通整行（仅展开时显示），收缩图标在 Card 内部最右侧 */}
      {toolbarExpanded && currentTab && (
        <div className="w-full border-t border-gray-200 bg-[#f5f5f5]">
          <div className="px-4 pb-2 pt-1">
            <Card
              size="small"
              className="w-full shadow-sm"
              styles={{ body: { padding: '8px 12px' } }}
              style={{
                borderRadius: '8px',
                border: '1px solid #f0f0f0',
              }}
            >
              <div className="flex items-center gap-0.5">
                <div className="flex flex-1 min-w-0 flex-wrap items-center gap-0.5">
                  {currentTab.tools.map((tool) => (
                    <Button
                      key={tool.key}
                      type="text"
                      size="small"
                      onClick={() => onToolClick?.(currentTab.key, tool.key)}
                      className="text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                      {tool.icon ?? tool.label}
                    </Button>
                  ))}
                </div>
                <Button
                  type="text"
                  size="small"
                  title="收缩工具栏"
                  onClick={() => setToolbarExpanded(false)}
                  className="shrink-0 text-gray-500 hover:text-gray-700"
                  icon={<UpOutlined />}
                />
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabToolbar;
