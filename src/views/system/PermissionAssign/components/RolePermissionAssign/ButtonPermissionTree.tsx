import { useQuery } from '@tanstack/react-query';
import { Tree, Spin, Empty, Tag } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import type React from 'react';
import { permissionButtonService } from '@/services/system/permission/PermissionButton/permissionButtonApi';
import type { TreeProps } from 'antd';

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
const ButtonPermissionTree: React.FC<ButtonPermissionTreeProps> = ({ checkedKeys, onCheck }) => {
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  /**
   * 查询权限按钮列表
   */
  const { data: buttonListResponse, isLoading } = useQuery({
    queryKey: ['permission-buttons'],
    queryFn: () => permissionButtonService.getButtonList({ pageNum: 1, pageSize: 1000 }),
  });

  /**
   * 构建树形数据
   */
  const treeData = useMemo(() => {
    if (!buttonListResponse?.records) return [];

    // 按菜单分组按钮
    const menuGroups = buttonListResponse.records.reduce(
      (acc, button) => {
        const menuId = button.parentMenuId || 'root';
        if (!acc[menuId]) {
          acc[menuId] = {
            menuId,
            menuName: button.parentMenuName || '根菜单',
            buttons: [],
          };
        }
        acc[menuId].buttons.push(button);
        return acc;
      },
      {} as Record<string, { menuId: string; menuName: string; buttons: any[] }>,
    );

    return Object.values(menuGroups).map((group) => ({
      key: group.menuId,
      title: (
        <div className="flex items-center justify-between">
          <span className="font-medium">{group.menuName}</span>
          <Tag color="blue">{group.buttons.length}</Tag>
        </div>
      ),
      children: group.buttons.map((button) => ({
        key: button.id,
        title: (
          <div className="flex items-center justify-between">
            <span className="text-sm">{button.name}</span>
            <Tag color={button.status ? 'green' : 'red'}>{button.status ? '启用' : '禁用'}</Tag>
          </div>
        ),
        isLeaf: true,
      })),
    }));
  }, [buttonListResponse?.records]);

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
        showIcon={false}
        className="button-permission-tree"
      />
    </div>
  );
};

export default ButtonPermissionTree;
