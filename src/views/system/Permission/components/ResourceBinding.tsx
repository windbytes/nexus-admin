import { useQuery } from '@tanstack/react-query';
import { Checkbox, Spin, Tabs, Tree, type TreeProps } from 'antd';
import { useEffect, useState } from 'react';
import type { PermissionResourceModel } from '@/services/system/permission/type';
import { permissionService } from '@/services/system/permission';
import { menuService } from '@/services/system/menu/menuApi';
import { transformData } from '@/utils/utils';

interface ResourceBindingProps {
  permissionId?: string;
  onChange?: (resources: PermissionResourceModel[]) => void;
}

/**
 * 资源绑定组件
 */
const ResourceBinding: React.FC<ResourceBindingProps> = ({ permissionId, onChange }) => {
  const [activeTab, setActiveTab] = useState<'button' | 'interface'>('button');
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);

  // 查询菜单树
  const { data: menuTreeData, isFetching: menuLoading } = useQuery({
    queryKey: ['permission-menu-tree'],
    queryFn: async () => {
      const menus = await menuService.getAllMenus({});
      const expanded: string[] = [];
      return transformData(menus || [], expanded, (key) => key);
    },
  });

  // 查询按钮资源（根据菜单查询按钮）
  const { data: buttonResources, isFetching: buttonLoading } = useQuery({
    queryKey: ['permission-button-resources'],
    queryFn: () => permissionService.queryMenuButtonResources(),
    enabled: activeTab === 'button',
  });

  // 查询接口资源（根据菜单查询接口）
  const { data: interfaceResources, isFetching: interfaceLoading } = useQuery({
    queryKey: ['permission-interface-resources'],
    queryFn: () => permissionService.queryMenuInterfaceResources(),
    enabled: activeTab === 'interface',
  });

  // 查询已绑定的资源
  const { data: boundResources = [], isFetching: boundLoading } = useQuery({
    queryKey: ['permission-bound-resources', permissionId],
    queryFn: () => (permissionId ? permissionService.queryPermissionResources(permissionId) : []),
    enabled: !!permissionId,
  });

  // 按钮资源数据（用于Transfer）
  const [buttonTransferData, setButtonTransferData] = useState<any[]>([]);
  const [buttonTargetKeys, setButtonTargetKeys] = useState<string[]>([]);

  // 接口资源数据（用于Transfer）
  const [interfaceTransferData, setInterfaceTransferData] = useState<any[]>([]);
  const [interfaceTargetKeys, setInterfaceTargetKeys] = useState<string[]>([]);

  // 初始化按钮资源数据
  useEffect(() => {
    if (activeTab === 'button' && buttonResources) {
      const data: any[] = [];
      buttonResources.forEach((menuResource) => {
        menuResource.buttons.forEach((button) => {
          data.push({
            key: `ACTION_${button.id}`,
            title: button.name,
            description: button.code,
            menuId: menuResource.menuId,
            menuName: menuResource.menuName,
            resourceId: button.id,
            resourceType: 'ACTION',
          });
        });
      });
      setButtonTransferData(data);

      // 设置已绑定的按钮资源
      const boundButtonKeys = boundResources
        .filter((r) => r.resourceType === 'ACTION')
        .map((r) => `ACTION_${r.resourceId}`);
      setButtonTargetKeys(boundButtonKeys);
    }
  }, [activeTab, buttonResources, boundResources]);

  // 初始化接口资源数据
  useEffect(() => {
    if (activeTab === 'interface' && interfaceResources) {
      const data: any[] = [];
      interfaceResources.forEach((menuResource) => {
        menuResource.interfaces.forEach((inter) => {
          data.push({
            key: `API_${inter.id}`,
            title: inter.name,
            description: `${inter.method} ${inter.path}`,
            menuId: menuResource.menuId,
            menuName: menuResource.menuName,
            resourceId: inter.id,
            resourceType: 'API',
          });
        });
      });
      setInterfaceTransferData(data);

      // 设置已绑定的接口资源
      const boundInterfaceKeys = boundResources
        .filter((r) => r.resourceType === 'API')
        .map((r) => `API_${r.resourceId}`);
      setInterfaceTargetKeys(boundInterfaceKeys);
    }
  }, [activeTab, interfaceResources, boundResources]);

  // 通知父组件资源变化
  useEffect(() => {
    if (!onChange) return;

    const resources: PermissionResourceModel[] = [];

    // 添加按钮资源
    buttonTargetKeys.forEach((key) => {
      const item = buttonTransferData.find((d) => d.key === key);
      if (item) {
        resources.push({
          permissionId: permissionId || '',
          resourceId: item.resourceId,
          resourceType: 'ACTION',
        });
      }
    });

    // 添加接口资源
    interfaceTargetKeys.forEach((key) => {
      const item = interfaceTransferData.find((d) => d.key === key);
      if (item) {
        resources.push({
          permissionId: permissionId || '',
          resourceId: item.resourceId,
          resourceType: 'API',
        });
      }
    });

    onChange(resources);
  }, [buttonTargetKeys, interfaceTargetKeys, buttonTransferData, interfaceTransferData, permissionId, onChange]);

  // 菜单树选择
  const onMenuSelect: TreeProps['onSelect'] = (selectedKeys) => {
    if (selectedKeys.length > 0) {
      setSelectedMenuId(selectedKeys[0] as string);
    } else {
      setSelectedMenuId(null);
    }
  };

  // 过滤按钮资源（根据选中的菜单）
  const filteredButtonData = selectedMenuId
    ? buttonTransferData.filter((item) => item.menuId === selectedMenuId)
    : buttonTransferData;

  // 过滤接口资源（根据选中的菜单）
  const filteredInterfaceData = selectedMenuId
    ? interfaceTransferData.filter((item) => item.menuId === selectedMenuId)
    : interfaceTransferData;

  // 过滤已选中的资源（用于右侧显示）
  const getSelectedData = (targetKeys: string[], allData: any[]) => {
    return targetKeys.map((key) => allData.find((d) => d.key === key)).filter(Boolean);
  };

  return (
    <div className="flex flex-col h-full">
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as 'button' | 'interface')}
        items={[
          {
            key: 'button',
            label: '按钮资源',
            children: (
              <Spin spinning={buttonLoading || boundLoading}>
                <div className="flex gap-4 h-[500px]">
                  {/* 左侧：菜单树 + 按钮列表 */}
                  <div className="flex-1 border border-gray-200 rounded p-4 flex flex-col">
                    <div className="mb-4">
                      <div className="font-semibold mb-2">菜单树</div>
                      <Tree
                        showLine
                        blockNode
                        treeData={menuTreeData || []}
                        fieldNames={{ title: 'name', key: 'id', children: 'children' }}
                        onSelect={onMenuSelect}
                        defaultExpandAll
                        className="border border-gray-100 rounded p-2 bg-gray-50"
                      />
                    </div>
                    <div className="flex-1 overflow-auto">
                      <div className="font-semibold mb-2">按钮资源</div>
                      <div className="space-y-2">
                        {filteredButtonData.length === 0 ? (
                          <div className="text-gray-400 text-center py-8">暂无数据</div>
                        ) : (
                          filteredButtonData.map((item) => (
                            <div
                              key={item.key}
                              className="flex items-center p-2 border border-gray-200 rounded hover:bg-blue-50"
                            >
                              <Checkbox
                                checked={buttonTargetKeys.includes(item.key)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setButtonTargetKeys([...buttonTargetKeys, item.key]);
                                  } else {
                                    setButtonTargetKeys(buttonTargetKeys.filter((k) => k !== item.key));
                                  }
                                }}
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

                  {/* 右侧：已绑定的按钮资源 */}
                  <div className="flex-1 border border-gray-200 rounded p-4">
                    <div className="font-semibold mb-2">已绑定的按钮资源</div>
                    <div className="space-y-2 overflow-auto max-h-full">
                      {buttonTargetKeys.length === 0 ? (
                        <div className="text-gray-400 text-center py-8">暂无绑定</div>
                      ) : (
                        getSelectedData(buttonTargetKeys, buttonTransferData).map((item) => (
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
              </Spin>
            ),
          },
          {
            key: 'interface',
            label: '接口资源',
            children: (
              <Spin spinning={interfaceLoading || boundLoading}>
                <div className="flex gap-4 h-[500px]">
                  {/* 左侧：菜单树 + 接口列表 */}
                  <div className="flex-1 border border-gray-200 rounded p-4 flex flex-col">
                    <div className="mb-4">
                      <div className="font-semibold mb-2">菜单树</div>
                      <Tree
                        showLine
                        blockNode
                        treeData={menuTreeData || []}
                        fieldNames={{ title: 'name', key: 'id', children: 'children' }}
                        onSelect={onMenuSelect}
                        defaultExpandAll
                        className="border border-gray-100 rounded p-2 bg-gray-50"
                      />
                    </div>
                    <div className="flex-1 overflow-auto">
                      <div className="font-semibold mb-2">接口资源</div>
                      <div className="space-y-2">
                        {filteredInterfaceData.length === 0 ? (
                          <div className="text-gray-400 text-center py-8">暂无数据</div>
                        ) : (
                          filteredInterfaceData.map((item) => (
                            <div
                              key={item.key}
                              className="flex items-center p-2 border border-gray-200 rounded hover:bg-blue-50"
                            >
                              <Checkbox
                                checked={interfaceTargetKeys.includes(item.key)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setInterfaceTargetKeys([...interfaceTargetKeys, item.key]);
                                  } else {
                                    setInterfaceTargetKeys(interfaceTargetKeys.filter((k) => k !== item.key));
                                  }
                                }}
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
                  <div className="flex-1 border border-gray-200 rounded p-4">
                    <div className="font-semibold mb-2">已绑定的接口资源</div>
                    <div className="space-y-2 overflow-auto max-h-full">
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
              </Spin>
            ),
          },
        ]}
      />
    </div>
  );
};

export default ResourceBinding;
