import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tree, Input, Spin, Empty, Tag, Space, Button, Card, theme } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined, FolderOutlined, FileOutlined } from '@ant-design/icons';
import { useState, useCallback, useMemo, type ReactNode } from 'react';
import type React from 'react';
import type { PermissionButtonModel } from '@/services/system/permission/PermissionButton/permissionButtonApi';
import { permissionButtonService } from '@/services/system/permission/PermissionButton/permissionButtonApi';
import { usePermission } from '@/hooks/usePermission';
import ButtonModal from './ButtonModal';

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
  icon?: ReactNode | ((props: any) => ReactNode);
  children?: TreeNode[];
  isLeaf?: boolean;
  data: PermissionButtonModel | null;
}

/**
 * 按钮树组件
 * 以树形结构展示权限按钮，按菜单分组
 */
const ButtonTree: React.FC<ButtonTreeProps> = ({ onSelectButton, selectedButtonId }) => {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editingButton, setEditingButton] = useState<PermissionButtonModel | null>(null);
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

  // 保存按钮的mutation
  const saveButtonMutation = useMutation({
    mutationFn: (formData: any) => {
      if (editingButton?.id) {
        return permissionButtonService.updateButton({ ...formData, id: editingButton.id });
      } else {
        return permissionButtonService.addButton(formData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permission-buttons'] });
      setFormVisible(false);
      setEditingButton(null);
      refetch();
    },
  });

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
   * 处理新增按钮
   */
  const handleAdd = useCallback(() => {
    setEditingButton(null);
    setFormVisible(true);
  }, []);

  /**
   * 处理表单提交
   */
  const handleFormSubmit = useCallback(
    (formData: any) => {
      saveButtonMutation.mutate(formData);
    },
    [saveButtonMutation],
  );

  /**
   * 处理表单取消
   */
  const handleFormCancelClick = useCallback(() => {
    setFormVisible(false);
    setEditingButton(null);
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
      icon: <FolderOutlined />,
      title: (
        <>
          <span className="font-medium">{group.menuName}</span>
          <Tag className='ml-4!' color={token.colorPrimary}>
            {group.buttons.length}
          </Tag>
        </>
      ),
      data: null,
      children: group.buttons.map((button: PermissionButtonModel) => ({
        key: button.id,
        icon: <FileOutlined />,
        title: <span className={`text-sm ${!button.status ? 'line-through text-gray-400' : ''}`}>{button.name}</span>,
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
          <Button type="default" icon={<ReloadOutlined />} onClick={handleRefresh} loading={isLoading} size="small">
            刷新
          </Button>
          {canAdd && (
            <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleAdd}>
              新增
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
            showIcon
            blockNode
            titleRender={renderTreeNode}
            className="permission-button-tree"
          />
        )}
      </div>

      {/* 按钮表单Modal */}
      <ButtonModal
        open={formVisible}
        button={editingButton}
        onOk={handleFormSubmit}
        onCancel={handleFormCancelClick}
        loading={saveButtonMutation.isPending}
      />
    </Card>
  );
};

export default ButtonTree;
