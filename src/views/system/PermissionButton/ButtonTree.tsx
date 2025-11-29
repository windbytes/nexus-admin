import { usePermission } from '@/hooks/usePermission';
import type { MenuModel } from '@/services/system/menu/type';
import { permissionButtonService } from '@/services/system/permission/PermissionButton/permissionButtonApi';
import { addIcon } from '@/utils/optimized-icons';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Card, Empty, Input, Space, Spin, Tag, Tree } from 'antd';
import type React from 'react';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import ButtonModal from './ButtonModal';

// 菜单类型枚举
const MenuType = {
  TOP_LEVEL: 0,
  SUB_MENU: 1,
  SUB_ROUTE: 2,
  PERMISSION_BUTTON: 3,
} as const;
type MenuType = (typeof MenuType)[keyof typeof MenuType];

/**
 * 按钮树组件Props
 */
interface ButtonTreeProps {
  onSelectButton: (button: MenuModel | null) => void;
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
  data: MenuModel | null;
}

/**
 * 按钮树组件
 * 以树形结构展示权限按钮，按菜单分组
 */
const ButtonTree: React.FC<ButtonTreeProps> = ({ onSelectButton, selectedButtonId }) => {
  const [searchText, setSearchText] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editingButton, setEditingButton] = useState<MenuModel | null>(null);
  const { t } = useTranslation();

  // 权限检查
  const canAdd = usePermission(['system:permission:button:add']);

  /**
   * 查询菜单目录数据
   */
  const { data: allDirectoryData, isLoading: menuLoading, refetch } = useQuery({
    queryKey: ['sys_menu_directory'],
    queryFn: async () => {
      return await permissionButtonService.getButtonList({ name: searchText });
    },
  });

  /**
   * 处理刷新
   */
  const handleRefresh = useCallback(() => {
    // 刷新菜单数据
    refetch();
  }, [refetch]);

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
   * 处理搜索
   * @param value 搜索值
   */
  const handleSearch = useCallback((value: string) => {
    setSearchText(value);
  }, []);

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
      if (node?.data && node.data.menuType === MenuType.PERMISSION_BUTTON) {
        // 如果选中的是按钮节点，调用onSelectButton
        onSelectButton(node.data);
      } else {
        // 如果选中的是其他类型节点，清空选择
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
    if (!allDirectoryData) return [];

    // 直接使用菜单数据构建树形结构，后端返回的数据已经是树形结构
    return translateDirectory(allDirectoryData);
  }, [allDirectoryData, translateDirectory]);

  /**
   * 渲染树节点标题
   * @param nodeData 节点数据
   */
  const renderTreeNode = useCallback((nodeData: TreeNode) => {
    return nodeData.title;
  }, []);

  if (menuLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Card
      title="按钮列表"
      className="h-full flex flex-col w-80"
      styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0 } }}
      extra={
        <Space>
          <Button type="default" icon={<ReloadOutlined />} onClick={handleRefresh} loading={menuLoading} size="small">
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
      <Space.Compact>
        <Input placeholder='请输入按钮名称' value={searchText} onChange={(e) => setSearchText(e.target.value)} allowClear />
        <Button type="primary" icon={<SearchOutlined />} onClick={() => handleSearch(searchText)} />
      </Space.Compact>

      <div className="flex-1 overflow-auto" style={{ minHeight: 0 }}>
        {treeData.length === 0 ? (
          <Empty description="暂无权限按钮" image={Empty.PRESENTED_IMAGE_SIMPLE} className="mt-8" />
        ) : (
          <Tree
            treeData={treeData}
            onSelect={handleSelect}
            onExpand={handleExpand}
            defaultExpandAll
            blockNode
            expandedKeys={expandedKeys}
            selectedKeys={selectedButtonId ? [selectedButtonId] : []}
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
