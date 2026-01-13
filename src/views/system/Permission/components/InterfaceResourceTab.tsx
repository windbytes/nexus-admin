import { Checkbox, Spin, Tree, type TreeProps } from 'antd';
import type React from 'react';

export interface InterfaceResourceTabProps {
  menuTreeData: any[];
  menuLoading: boolean;
  interfaceLoading: boolean;
  boundLoading: boolean;
  selectedMenuId: string | null;
  interfaceTransferData: any[];
  interfaceTargetKeys: string[];
  onMenuSelect: TreeProps['onSelect'];
  onInterfaceToggle: (key: string, checked: boolean) => void;
}

/**
 * 接口资源标签页组件
 */
const InterfaceResourceTab: React.FC<InterfaceResourceTabProps> = ({
  menuTreeData,
  menuLoading,
  interfaceLoading,
  boundLoading,
  selectedMenuId,
  interfaceTransferData,
  interfaceTargetKeys,
  onMenuSelect,
  onInterfaceToggle,
}) => {
  // 过滤接口资源（根据选中的菜单）
  const filteredInterfaceData = selectedMenuId
    ? interfaceTransferData.filter((item) => item.menuId === selectedMenuId)
    : interfaceTransferData;

  // 过滤已选中的资源（用于右侧显示）
  const getSelectedData = (targetKeys: string[], allData: any[]) => {
    return targetKeys.map((key) => allData.find((d) => d.key === key)).filter(Boolean);
  };

  return (
    <Spin spinning={interfaceLoading || boundLoading || menuLoading}>
      <div className="flex gap-4 h-full min-h-0">
        {/* 左侧：菜单树 + 接口列表 */}
        <div className="flex-1 border border-gray-200 rounded p-4 flex flex-col min-h-0">
          <div className="mb-4 shrink-0">
            <div className="font-semibold mb-2">菜单树</div>
            <div className="border border-gray-100 rounded p-2 bg-gray-50 overflow-auto max-h-[200px]">
              <Tree
                showLine
                blockNode
                treeData={menuTreeData}
                fieldNames={{ title: 'name', key: 'id', children: 'children' }}
                onSelect={onMenuSelect}
                defaultExpandAll
              />
            </div>
          </div>
          <div className="flex-1 overflow-auto min-h-0">
            <div className="font-semibold mb-2">接口资源</div>
            <div className="space-y-2">
              {filteredInterfaceData.length === 0 ? (
                <div className="text-gray-400 text-center py-8">暂无数据</div>
              ) : (
                filteredInterfaceData.map((item) => (
                  <div key={item.key} className="flex items-center p-2 border border-gray-200 rounded hover:bg-blue-50">
                    <Checkbox
                      checked={interfaceTargetKeys.includes(item.key)}
                      onChange={(e) => onInterfaceToggle(item.key, e.target.checked)}
                    >
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                        <div className="text-xs text-gray-400">{item.menuName}</div>
                      </div>
                    </Checkbox>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 右侧：已绑定的接口资源 */}
        <div className="flex-1 border border-gray-200 rounded p-4 flex flex-col min-h-0">
          <div className="font-semibold mb-2 shrink-0">已绑定的接口资源</div>
          <div className="flex-1 overflow-auto min-h-0">
            <div className="space-y-2">
              {interfaceTargetKeys.length === 0 ? (
                <div className="text-gray-400 text-center py-8">暂无绑定</div>
              ) : (
                getSelectedData(interfaceTargetKeys, interfaceTransferData).map((item) => (
                  <div key={item.key} className="p-2 border border-gray-200 rounded bg-blue-50">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                    <div className="text-xs text-gray-400">{item.menuName}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Spin>
  );
};

export default InterfaceResourceTab;
