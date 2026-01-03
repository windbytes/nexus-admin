import { Button } from 'antd';
import type React from 'react';
import type { MenuModel } from '@/services/system/menu/type';

interface TableFooterProps {
  menu?: MenuModel;
  hasUnsavedData: boolean;
  hasAddPermission: boolean;
  onAdd: () => void;
}

/**
 * 表格底部组件
 */
const TableFooter: React.FC<TableFooterProps> = ({ menu, hasUnsavedData, hasAddPermission, onAdd }) => {
  const hasMenuData = !!menu?.id;

  let buttonText = '添加一行';
  let buttonType: 'dashed' | 'default' = 'dashed';
  let buttonDisabled = false;
  let tooltipText = '点击添加新行';

  if (!hasMenuData) {
    buttonText = '请先选择菜单';
    buttonType = 'default';
    buttonDisabled = true;
    tooltipText = '请先选择菜单后再添加接口权限';
  } else if (hasUnsavedData) {
    buttonText = '请先完成当前编辑';
    buttonType = 'default';
    buttonDisabled = true;
    tooltipText = '您有未保存的编辑数据，请先完成保存或取消编辑';
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-xs text-gray-500">
        {hasUnsavedData && <span className="text-orange-500">⚠️ 有未保存的编辑数据，请先完成保存后继续添加</span>}
        {!hasMenuData && <span className="text-gray-400">📋 请先选择菜单</span>}
      </div>
      {hasAddPermission && (
        <Button
          type={buttonType}
          style={{ width: '100%' }}
          onClick={onAdd}
          disabled={buttonDisabled}
          title={tooltipText}
        >
          {buttonText}
        </Button>
      )}
    </div>
  );
};

TableFooter.displayName = 'TableFooter';

export default TableFooter;
