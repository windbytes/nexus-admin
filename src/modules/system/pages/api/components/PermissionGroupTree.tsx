/**
 * @file 接口权限分组树
 * @description 展示 permType=0 分组与 permType=2 接口权限点；支持分组增删改，点选接口权限点过滤右侧注册表。
 */

import {
  ApiOutlined,
  DeleteOutlined,
  EditOutlined,
  FolderOutlined,
  MoreOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import type { TreeDataNode, TreeProps } from 'antd';
import { App, Button, Card, Dropdown, Empty, Form, Input, InputNumber, Spin, Switch, Tree, Typography } from 'antd';
import { type Key, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { permissionService } from '@/modules/system/api/permission';
import type { PermissionModel, PermissionSaveParams } from '@/shared/api/system/permission/type';
import DragModal from '@/shared/components/modal/DragModal';
import { useApiPermissions } from '../hooks/useApiPermissions';

/** 权限编码规则：{domain}:{resource}:{action} */
const PERM_CODE_PATTERN = /^[a-z][a-z0-9]*(:[a-z][a-z0-9-]*){1,3}$/;

/**
 * 在权限点树中查找节点：返回接口权限点 ID，分组返回 null。
 * @param nodes - 权限点节点
 * @param key - 节点 key
 */
function findPermIdByKey(nodes: PermissionModel[], key: string): string | null {
  for (const node of nodes) {
    if (node.id === key) {
      return node.permType === 2 ? node.id : null;
    }
    if (node.children?.length) {
      const found = findPermIdByKey(node.children, key);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

export interface PermissionGroupTreeProps {
  /** 权限点树原始数据 */
  tree: PermissionModel[];
  loading: boolean;
  /**
   * 页面打开时默认选中的树节点 key（通常为第一个根节点）。
   * 用于实现「打开页面默认选中根节点、表格按其加载」。
   */
  defaultSelectedKey?: string | null;
  /**
   * 点选接口权限点（过滤）或分组（清除过滤）。
   * @param permId - 接口权限点 ID；`null` 表示不过滤
   */
  onSelectPerm: (permId: string | null) => void;
  /** 分组增删改成功后刷新树 */
  onTreeChanged: () => void;
}

/**
 * 接口权限分组树：左侧导航 + 分组维护。
 *
 * @param props - 树数据、默认选中与回调
 * @returns 卡片包裹的 Tree + 分组表单弹窗
 */
function PermissionGroupTree({
  tree,
  loading,
  defaultSelectedKey,
  onSelectPerm,
  onTreeChanged,
}: PermissionGroupTreeProps) {
  const { modal, message } = App.useApp();
  const { canAddGroup, canEditGroup, canDeleteGroup } = useApiPermissions();
  const [form] = Form.useForm();
  const [formOpen, setFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<PermissionModel | null>(null);
  const parentGroupRef = useRef<PermissionModel | null>(null);

  // 树当前高亮的节点 key（含分组，支持默认选中根节点）
  const [selectedKey, setSelectedKey] = useState<string | null>(defaultSelectedKey ?? null);

  // 树异步加载完成后，同步默认选中第一个根节点
  useEffect(() => {
    if (defaultSelectedKey) {
      setSelectedKey(defaultSelectedKey);
    }
  }, [defaultSelectedKey]);

  const saveMutation = useMutation({
    mutationFn: (params: PermissionSaveParams) =>
      params.id ? permissionService.update(params) : permissionService.add(params),
    onSuccess: () => {
      message.success('保存分组成功');
      setFormOpen(false);
      setEditingGroup(null);
      parentGroupRef.current = null;
      form.resetFields();
      onTreeChanged();
    },
    onError: (error: Error) => {
      modal.error({ title: '保存分组失败', content: error.message || '未知错误' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) => permissionService.delete(ids),
    onSuccess: () => {
      message.success('删除分组成功');
      onTreeChanged();
    },
    onError: (error: Error) => {
      modal.error({ title: '删除分组失败', content: error.message || '未知错误' });
    },
  });

  /**
   * 打开新增分组弹窗。
   * @param parent - 父分组；空表示根级
   */
  const openAdd = useCallback(
    (parent: PermissionModel | null) => {
      setEditingGroup(null);
      parentGroupRef.current = parent;
      form.setFieldsValue({ parentId: parent?.id ?? '0', sort: 0, status: true });
      setFormOpen(true);
    },
    [form]
  );

  /**
   * 打开编辑分组弹窗。
   * @param group - 目标分组
   */
  const openEdit = useCallback(
    (group: PermissionModel) => {
      setEditingGroup(group);
      parentGroupRef.current = null;
      form.setFieldsValue({
        permCode: group.permCode,
        permName: group.permName,
        sort: group.sort ?? 0,
        status: group.status ?? true,
        remark: group.remark,
      });
      setFormOpen(true);
    },
    [form]
  );

  /**
   * 删除分组前二次确认。
   * @param group - 目标分组
   */
  const handleDelete = useCallback(
    (group: PermissionModel) => {
      modal.confirm({
        title: '删除分组',
        content: `确定删除分组「${group.permName}」吗？存在子分组或接口权限点时将删除失败。`,
        okButtonProps: { danger: true },
        onOk: () => deleteMutation.mutate([group.id]),
      });
    },
    [modal, deleteMutation]
  );

  /**
   * 校验并提交分组表单。
   */
  async function handleSubmit() {
    const values = await form.validateFields();
    const payload: PermissionSaveParams = {
      id: editingGroup?.id,
      parentId: editingGroup?.parentId ?? parentGroupRef.current?.id ?? '0',
      permCode: values.permCode?.trim(),
      permName: values.permName?.trim(),
      permType: 0,
      sort: values.sort ?? 0,
      status: values.status ?? true,
      remark: values.remark?.trim(),
    };
    saveMutation.mutate(payload);
  }

  const treeData = useMemo<TreeDataNode[]>(() => {
    /**
     * 权限点树转 antd TreeDataNode（仅保留分组与接口权限点）。
     * @param nodes - 权限点节点
     */
    function build(nodes: PermissionModel[]): TreeDataNode[] {
      return nodes.flatMap((node) => {
        if (node.permType === 1) {
          return [];
        }
        const isGroup = node.permType === 0;
        return [
          {
            key: node.id,
            icon: isGroup ? <FolderOutlined /> : <ApiOutlined />,
            isLeaf: !node.children?.length,
            title: isGroup ? (
              <span className="group inline-flex items-center justify-between gap-2 min-w-0">
                <Typography.Text ellipsis={{ tooltip: node.permName }} className="flex-1 min-w-0">
                  {node.permName}
                </Typography.Text>
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'addChild',
                        label: '新增子分组',
                        icon: <PlusOutlined />,
                        disabled: !canAddGroup,
                        onClick: ({ domEvent }) => {
                          domEvent.stopPropagation();
                          openAdd(node);
                        },
                      },
                      {
                        key: 'edit',
                        label: '编辑分组',
                        icon: <EditOutlined />,
                        disabled: !canEditGroup,
                        onClick: ({ domEvent }) => {
                          domEvent.stopPropagation();
                          openEdit(node);
                        },
                      },
                      {
                        key: 'delete',
                        label: '删除分组',
                        icon: <DeleteOutlined />,
                        danger: true,
                        disabled: !canDeleteGroup,
                        onClick: ({ domEvent }) => {
                          domEvent.stopPropagation();
                          handleDelete(node);
                        },
                      },
                    ],
                  }}
                  trigger={['click']}
                >
                  <Button
                    type="text"
                    size="small"
                    icon={<MoreOutlined />}
                    className="opacity-0 group-hover:opacity-100 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  />
                </Dropdown>
              </span>
            ) : (
              <span className="truncate min-w-0">{node.permName}</span>
            ),
            children: node.children?.length ? build(node.children) : undefined,
          },
        ];
      });
    }
    return build(tree);
  }, [tree, canAddGroup, canEditGroup, canDeleteGroup, openAdd, openEdit, handleDelete]);

  /**
   * 点选节点：接口权限点触发过滤，分组清除过滤。
   * @param keys - 选中 key 列表
   * @param info - 节点信息
   */
  const handleSelect: TreeProps['onSelect'] = (keys, info) => {
    if (!keys.length) {
      setSelectedKey(null);
      onSelectPerm(null);
      return;
    }
    const key: Key = info.node.key;
    // 高亮当前点选节点（含分组），再通过 key 定位节点类型并传过滤条件
    setSelectedKey(String(key));
    onSelectPerm(findPermIdByKey(tree, String(key)));
  };

  return (
    <Card
      title="接口权限"
      className="w-72 shrink-0"
      classNames={{ body: 'h-[calc(100%-57px)] overflow-auto' }}
      extra={
        <Button type="text" size="small" icon={<PlusOutlined />} disabled={!canAddGroup} onClick={() => openAdd(null)}>
          分组
        </Button>
      }
    >
      <Spin spinning={loading}>
        {treeData.length > 0 ? (
          <Tree
            showIcon
            blockNode
            showLine
            defaultExpandAll
            treeData={treeData}
            selectedKeys={selectedKey ? [selectedKey] : []}
            onSelect={handleSelect}
          />
        ) : (
          <Empty description="暂无权限点，点击右上角新增分组" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Spin>
      <DragModal
        title={editingGroup ? '编辑分组' : '新增分组'}
        open={formOpen}
        width={480}
        centered
        onCancel={() => {
          setFormOpen(false);
          setEditingGroup(null);
          parentGroupRef.current = null;
          form.resetFields();
        }}
        destroyOnHidden
        onOk={handleSubmit}
        confirmLoading={saveMutation.isPending}
      >
        <Form form={form} labelCol={{ span: 5 }}>
          <Form.Item
            name="permCode"
            label="分组编码"
            rules={[
              { required: true, message: '请输入分组编码' },
              { pattern: PERM_CODE_PATTERN, message: '格式为 {域}:{资源}[:{操作}]，如 system:user' },
              { max: 100, message: '最多100个字符' },
            ]}
          >
            <Input placeholder="如 system:user" maxLength={100} showCount disabled={!!editingGroup} />
          </Form.Item>
          <Form.Item
            name="permName"
            label="分组名称"
            rules={[
              { required: true, message: '请输入分组名称' },
              { max: 100, message: '最多100个字符' },
            ]}
          >
            <Input placeholder="如 用户管理" maxLength={100} showCount />
          </Form.Item>
          <Form.Item name="sort" label="排序" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="状态" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="启用" unCheckedChildren="停用" />
          </Form.Item>
          <Form.Item name="remark" label="备注" rules={[{ max: 256, message: '最多256个字符' }]}>
            <Input.TextArea rows={2} maxLength={256} showCount placeholder="选填" />
          </Form.Item>
        </Form>
      </DragModal>
    </Card>
  );
}

export default PermissionGroupTree;
