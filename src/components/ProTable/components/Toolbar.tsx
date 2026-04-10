import { ReloadOutlined } from '@ant-design/icons';
import { Button, Divider, Space } from 'antd';
import type { ToolbarProps } from '../types';
import { ColumnSettingComponent } from './ColumnSetting';
import { DensitySetting } from './DensitySetting';
import './Toolbar.css';

/**
 * 表格工具栏组件
 */
export function Toolbar({
  title,
  showTitle = true,
  showToolbar = true,
  actionButtons,
  selectedRowKeys,
  onRefresh,
  density = 'middle',
  onDensityChange,
  showColumnSetting = true,
  columnSettings = [],
  onColumnSettingChange,
  onReset,
  extra,
}: ToolbarProps) {
  return (
    <div className="pro-table-toolbar">
      {/* 左侧：标题和操作栏 */}
      <div className="pro-table-toolbar-left">
        {showTitle && title && <div className="pro-table-toolbar-title">{title}</div>}
        <Divider orientation="vertical" />
        {selectedRowKeys && (
          <>
            <span className="text-sm! text-gray-500">{`已选 ${selectedRowKeys.length} 项`}</span>
            <Divider orientation="vertical" />
          </>
        )}
        {actionButtons && <>{actionButtons}</>}
      </div>

      {/* 右侧：配置按钮 */}
      {showToolbar && (
        <div className="pro-table-toolbar-right">
          <Space>
            {extra}
            {<Button type="text" icon={<ReloadOutlined />} onClick={onRefresh} />}
            {onDensityChange && <DensitySetting value={density} onChange={onDensityChange} />}
            {showColumnSetting && onColumnSettingChange && columnSettings.length > 0 && (
              <ColumnSettingComponent columns={columnSettings} onChange={onColumnSettingChange} onReset={onReset} />
            )}
          </Space>
        </div>
      )}
    </div>
  );
}
