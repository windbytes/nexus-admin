import { useQuery } from '@tanstack/react-query';
import { Tree, Input, Spin, Empty, Tag, Space, Button, Card, theme } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState, useCallback, useMemo } from 'react';
import type React from 'react';
import type { PermissionButtonModel } from '@/services/system/permission/PermissionButton/permissionButtonApi';
import { permissionButtonService } from '@/services/system/permission/PermissionButton/permissionButtonApi';
import { usePermission } from '@/hooks/usePermission';

/**
 * 按钮树组件Props
 */
interface ButtonTreeProps {
  onSelectButton: (button: PermissionButtonModel | null) => void;
  selectedButtonId?: string;
  loading?: boolean;
}

/**
 * 树节点数据类型
 */
interface TreeNode {
  key: string;
  title: React.ReactNode;
  children?: TreeNode[];
  isLeaf?: boolean;
  data: PermissionButtonModel | null;
}

/**
 * 按钮树组件
 * 以树形结构展示权限按钮，按菜单分组
 */
const ButtonTree: React.FC<ButtonTreeProps> = ({ onSelectButton, selectedButtonId }) => {
  const [searchText, setSearchText] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const { token } = theme.useToken();
  // 权限检查
  const canAdd = usePermission(['system:permission:button:add']);
  const canEdit = usePermission(['system:permission:button:edit']);
  const canDelete = usePermission(['system:permission:button:delete']);

  /**
   * 查询权限按钮列表
   */
  const {
    data: buttonListResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['permission-buttons', searchText],
    queryFn: () =>
      permissionButtonService.getButtonList({
        name: searchText || undefined,
        pageNum: 1,
        pageSize: 1000, // 获取所有数据用于树形展示
      }),
  });

  /**
   * 处理搜索
   * @param value 搜索值
   */
  const handleSearch = useCallback((value: string) => {
    setSearchText(value);
  }, []);

  /**
   * 处理刷新
   */
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  /**
   * 处理树节点选择
   * @param selectedKeys 选中的节点keys
   * @param info 选择信息
   */
  const handleSelect = useCallback(
    (_selectedKeys: React.Key[], info: any) => {
      const { node } = info;
      if (node?.data && node.data.menuType === 3) {
        // 如果选中的是按钮节点
        onSelectButton(node.data);
      } else {
        // 如果选中的是菜单节点，清空选择
        onSelectButton(null);
      }
    },
    [onSelectButton],
  );

  /**
   * 处理树节点展开
   * @param keys 展开的节点keys
   */
  const handleExpand = useCallback((keys: React.Key[]) => {
    setExpandedKeys(keys as string[]);
  }, []);

  /**
   * 构建树形数据
   */
  const treeData = useMemo(() => {
    if (!buttonListResponse?.records) return [];

    // 按菜单分组
    const menuGroups = buttonListResponse.records.reduce(
      (acc, button: PermissionButtonModel) => {
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
      {} as Record<string, { menuId: string; menuName: string; buttons: PermissionButtonModel[] }>,
    );

    // 转换为树形结构
    const nodes: TreeNode[] = Object.values(menuGroups).map((group) => ({
      key: group.menuId,
      title: (
        <div className="flex items-center justify-between space-x-2">
          <span className="font-medium">{group.menuName}</span>
          <Tag color={token.colorPrimary}>{group.buttons.length}</Tag>
        </div>
      ),
      data: null,
      children: group.buttons.map((button: PermissionButtonModel) => ({
        key: button.id,
        title: (
          <div className="flex items-center justify-between group">
            <div className="flex items-center space-x-2">
              <span className="text-sm">{button.name}</span>
              <Tag color={button.status ? 'green' : 'red'}>{button.status ? '启用' : '禁用'}</Tag>
            </div>
            <div className="opacity-0 group-hover:opacity-100">
              <Space size="small">
                {canEdit && <Button color="primary" variant="link" size="small" icon={<EditOutlined />} />}
                {canDelete && <Button color="danger" variant="link" size="small" icon={<DeleteOutlined />} />}
              </Space>
            </div>
          </div>
        ),
        data: button,
        isLeaf: true,
      })),
    }));

    return nodes;
  }, [buttonListResponse?.records, canEdit, canDelete]);

  /**
   * 渲染树节点标题
   * @param nodeData 节点数据
   */
  const renderTreeNode = useCallback((nodeData: TreeNode) => {
    return nodeData.title;
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Card
      title="按钮列表"
      className="h-full flex flex-col"
      styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0 } }}
      extra={
        <Space>
          <Button type="text" icon={<ReloadOutlined />} onClick={handleRefresh} loading={isLoading} size="small">
            刷新
          </Button>
          {canAdd && (
            <Button type="primary" size="small" icon={<PlusOutlined />}>
              新增按钮
            </Button>
          )}
        </Space>
      }
    >
      <Input.Search
        placeholder="请输入按钮名称"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onSearch={handleSearch}
        allowClear
        enterButton={<SearchOutlined />}
      />

      <div className="flex-1 overflow-auto" style={{ minHeight: 0 }}>
        {treeData.length === 0 ? (
          <Empty description="暂无权限按钮" image={Empty.PRESENTED_IMAGE_SIMPLE} className="mt-8" />
        ) : (
          <Tree
            treeData={treeData}
            onSelect={handleSelect}
            onExpand={handleExpand}
            defaultExpandAll
            expandedKeys={expandedKeys}
            selectedKeys={selectedButtonId ? [selectedButtonId] : []}
            showLine
            showIcon={false}
            titleRender={renderTreeNode}
            className="permission-button-tree"
          />
        )}
      </div>
    </Card>
  );
};

export default ButtonTree;
