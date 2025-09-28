import { Card } from 'antd';
import { memo } from 'react';
import type React from 'react';

/**
 * 权限统计组件Props
 */
interface PermissionStatisticsProps {
  /** 菜单权限数量 */
  menuCount?: number;
  /** 按钮权限数量 */
  buttonCount?: number;
  /** 接口权限数量 */
  interfaceCount?: number;
}

/**
 * 权限统计组件
 * 负责展示权限统计信息
 */
const PermissionStatistics: React.FC<PermissionStatisticsProps> = memo(({
  menuCount = 0,
  buttonCount = 0,
  interfaceCount = 0,
}) => {
  return (
    <Card title="权限统计" size="small">
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{menuCount}</div>
          <div className="text-sm text-gray-500">菜单权限</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{buttonCount}</div>
          <div className="text-sm text-gray-500">按钮权限</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{interfaceCount}</div>
          <div className="text-sm text-gray-500">接口权限</div>
        </div>
      </div>
    </Card>
  );
});

PermissionStatistics.displayName = 'PermissionStatistics';

export default PermissionStatistics;
