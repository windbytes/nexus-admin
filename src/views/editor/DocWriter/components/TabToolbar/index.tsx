/**
 * WPS 风格的 Tab 工具栏
 * 通过配置渲染 Tab 与当前 Tab 下的工具按钮，不写死
 * 工具条为圆角拉长白色背景，类似 Ant Design Card 样式
 */
import { Button, Card } from 'antd';
import type { TabItemConfig } from '../../types';

interface TabToolbarProps {
  /** Tab 及工具配置 */
  config: TabItemConfig[];
  /** 当前激活的 Tab key */
  activeTabKey?: string;
  /** 切换 Tab */
  onTabChange?: (key: string) => void;
  /** 工具点击（可选） */
  onToolClick?: (tabKey: string, toolKey: string) => void;
  className?: string;
}

const TabToolbar: React.FC<TabToolbarProps> = ({
  config,
  activeTabKey,
  onTabChange,
  onToolClick,
  className = '',
}) => {
  const defaultKey = config[0]?.key ?? '';
  const currentKey = activeTabKey ?? defaultKey;
  const currentTab = config.find((t) => t.key === currentKey) ?? config[0];

  return (
    <div className={`flex flex-col border-b border-gray-200 bg-transparent ${className}`}>
      {/* Tab 标签行 */}
      <div className="flex border-b border-gray-100 bg-white px-1">
        {config.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange?.(tab.key)}
            className={`px-4 py-2 text-sm transition-colors ${
              currentKey === tab.key
                ? 'border-b-2 border-blue-600 bg-white font-medium text-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* 当前 Tab 下的工具条：圆角拉长白色卡片样式 */}
      {currentTab && (
        <div className="px-4 pb-2 pt-1">
          <Card
            size="small"
            className="w-full shadow-sm"
            styles={{
              body: { padding: '8px 12px' },
            }}
            style={{
              borderRadius: '8px',
              border: '1px solid #f0f0f0',
            }}
          >
            <div className="flex flex-wrap items-center gap-0.5">
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
          </Card>
        </div>
      )}
    </div>
  );
};

export default TabToolbar;
