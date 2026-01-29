import { useQuery } from '@tanstack/react-query';
import { Tabs, type TreeProps } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { menuService } from '@/services/system/menu/menuApi';
import { permissionService } from '@/services/system/permission';
import type { PermissionResourceModel } from '@/services/system/permission/type';
import { transformData } from '@/utils/utils';
import ButtonResourceTab from './ButtonResourceTab';
import InterfaceResourceTab from './InterfaceResourceTab';

interface ResourceBindingProps {
  permissionId?: string;
  onChange?: (resources: PermissionResourceModel[]) => void;
}

/**
 * 资源绑定组件
 */
const ResourceBinding: React.FC<ResourceBindingProps> = ({ permissionId, onChange }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'button' | 'interface'>('button');
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);

  // 查询菜单树
  const { data: menuTreeData, isFetching: menuLoading } = useQuery({
    queryKey: ['permission-menu-tree'],
    queryFn: async () => {
      const menus = await menuService.getAllMenus({});
      const expanded: string[] = [];
      return transformData(menus || [], expanded, t);
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
      buttonResources.forEach((button) => {
        data.push({
          key: `ACTION_${button.id}`,
          title: button.name,
          description: button.description,
          menuId: button.id,
          menuName: button.name,
          resourceId: button.id,
          resourceType: 'ACTION',
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
      interfaceResources.forEach((inter) => {
        data.push({
          key: `API_${inter.id}`,
          title: inter.name,
          description: `${inter.method} ${inter.path}`,
          menuId: inter.menuId,
          menuName: inter.menuName,
          resourceId: inter.id,
          resourceType: 'API',
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
    if (!onChange) {
      return;
    }

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

  // 按钮资源切换处理
  const handleButtonToggle = (key: string, checked: boolean) => {
    if (checked) {
      setButtonTargetKeys([...buttonTargetKeys, key]);
    } else {
      setButtonTargetKeys(buttonTargetKeys.filter((k) => k !== key));
    }
  };

  // 接口资源切换处理
  const handleInterfaceToggle = (key: string, checked: boolean) => {
    if (checked) {
      setInterfaceTargetKeys([...interfaceTargetKeys, key]);
    } else {
      setInterfaceTargetKeys(interfaceTargetKeys.filter((k) => k !== key));
    }
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
              <ButtonResourceTab
                menuTreeData={menuTreeData || []}
                menuLoading={menuLoading}
                buttonLoading={buttonLoading}
                boundLoading={boundLoading}
                selectedMenuId={selectedMenuId}
                buttonTransferData={buttonTransferData}
                buttonTargetKeys={buttonTargetKeys}
                onMenuSelect={onMenuSelect}
                onButtonToggle={handleButtonToggle}
              />
            ),
          },
          {
            key: 'interface',
            label: '接口资源',
            children: (
              <InterfaceResourceTab
                menuTreeData={menuTreeData || []}
                menuLoading={menuLoading}
                interfaceLoading={interfaceLoading}
                boundLoading={boundLoading}
                selectedMenuId={selectedMenuId}
                interfaceTransferData={interfaceTransferData}
                interfaceTargetKeys={interfaceTargetKeys}
                onMenuSelect={onMenuSelect}
                onInterfaceToggle={handleInterfaceToggle}
              />
            ),
          },
        ]}
      />
    </div>
  );
};

export default ResourceBinding;
