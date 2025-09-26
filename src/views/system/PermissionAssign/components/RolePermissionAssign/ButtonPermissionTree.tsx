import { useQuery } from '@tanstack/react-query';
import { Tree, Spin, Empty, Tag, Space } from 'antd';
import { useCallback, useMemo, useState, memo, type ReactNode } from 'react';
import type React from 'react';
import { permissionButtonService } from '@/services/system/permission/PermissionButton/permissionButtonApi';
import type { TreeProps } from 'antd';
import type { MenuModel } from '@/services/system/menu/type';
import { addIcon } from '@/utils/optimized-icons';
import { useTranslation } from 'react-i18next';

// 菜单类型枚举
const MenuType = {
  TOP_LEVEL: 0,
  SUB_MENU: 1,
  SUB_ROUTE: 2,
  PERMISSION_BUTTON: 3,
} as const;
type MenuType = (typeof MenuType)[keyof typeof MenuType];

/**
 * 树节点数据类型
 */
interface TreeNode {
  key: string;
  title: React.ReactNode;
  icon?: ReactNode | ((props: any) => ReactNode);
  children?: TreeNode[];
  isLeaf?: boolean;
  data: MenuModel | null;
}

/**
 * 按钮权限树组件Props
 */
interface ButtonPermissionTreeProps {
  checkedKeys: string[];
  onCheck: (checkedKeys: string[]) => void;
}

/**
 * 按钮权限树组件
 * 以树形结构展示按钮权限分配
 */
const ButtonPermissionTree: React.FC<ButtonPermissionTreeProps> = memo(({ checkedKeys, onCheck }) => {
  const { t } = useTranslation();
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  /**
   * 查询权限按钮列表
   */
  const { data: allDirectoryData, isLoading } = useQuery({
    queryKey: ['permission-buttons'],
    queryFn: () => permissionButtonService.getButtonList({}),
  });

  /**
   * 递归处理目录数据，将菜单数据转换为树形结构
   */
    const translateDirectory = useCallback(
      (data: MenuModel[]): TreeNode[] => {
        const loop = (items: any[]): TreeNode[] =>
          items.map((item) => {
            const iconNode = item.icon ? addIcon(item.icon) : null;
            const newItem: TreeNode = {
              ...item,
              key: item.id,
              title: (
                <Space>
                  {iconNode}
                  {t(item.title || item.name)}
                  {item.menuType === MenuType.PERMISSION_BUTTON && (
                    <Tag color="blue">
                      按钮
                    </Tag>
                  )}
                </Space>
              ),
              data: item.menuType === MenuType.PERMISSION_BUTTON ? item : null,
              isLeaf: item.menuType === MenuType.PERMISSION_BUTTON,
            };
  
            if (Array.isArray(item.children) && item.children.length > 0) {
              newItem.children = loop(item.children);
            }
  
            return newItem;
          });
  
        return loop(data);
      },
      [t],
    );

  /**
   * 构建树形数据
   */
  const treeData = useMemo(() => {
    if (!allDirectoryData) return [];

    // 直接使用菜单数据构建树形结构，后端返回的数据已经是树形结构
    return translateDirectory(allDirectoryData);
  }, [allDirectoryData, translateDirectory]);

  /**
   * 处理树节点选中
   * @param checkedKeysValue 选中的节点keys
   */
  const handleCheck: TreeProps['onCheck'] = useCallback(
    (checkedKeysValue: any) => {
      const keys = checkedKeysValue.checked;
      onCheck(keys);
    },
    [onCheck],
  );

  /**
   * 处理树节点展开
   * @param keys 展开的节点keys
   */
  const handleExpand = useCallback((keys: React.Key[]) => {
    setExpandedKeys(keys as string[]);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!treeData.length) {
    return <Empty description="暂无按钮权限数据" image={Empty.PRESENTED_IMAGE_SIMPLE} className="mt-8" />;
  }

  return (
    <div className="h-full overflow-auto">
      <Tree
        checkable
        checkedKeys={checkedKeys}
        onCheck={handleCheck}
        onExpand={handleExpand}
        expandedKeys={expandedKeys}
        treeData={treeData}
        showLine
        className="button-permission-tree"
      />
    </div>
  );
});

export default ButtonPermissionTree;
