/**
 * @file 角色统一授权抽屉
 * @description 菜单/按钮/接口合并授权树；勾选 keys（menu:{id} / perm:{id}）全量覆盖保存。
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import { App, Button, Drawer, Empty, Space, Spin, Tree } from 'antd';
import type { TreeDataNode, TreeProps } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { roleService } from '@/modules/system/api/role';
import type { RoleGrantTreeNode } from '@/shared/api/system/role/type';

export interface AssignGrantDrawerProps {
  open: boolean;
  /** 目标角色主键 */
  roleId: string;
  /** 目标角色名称（标题展示） */
  roleName?: string;
  onCancel: () => void;
  /** 保存成功回调 */
  onSaved?: () => void;
}

/**
 * 授权树节点转 antd TreeDataNode。
 *
 * @param nodes - 后端授权树节点
 * @returns antd TreeDataNode
 */
function buildTreeData(nodes: RoleGrantTreeNode[]): TreeDataNode[] {
  return nodes.map((node) => ({
    key: node.key,
    title: node.title,
    children: node.children?.length ? buildTreeData(node.children) : undefined,
  }));
}

/**
 * 角色统一授权抽屉：checkStrictly 精确勾选，保存时全量覆盖角色菜单与权限点。
 *
 * @param props - 开关、角色上下文与回调
 * @returns 抽屉 + 授权树
 */
function AssignGrantDrawer({ open, roleId, roleName, onCancel, onSaved }: AssignGrantDrawerProps) {
  const { modal, message } = App.useApp();
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);

  const { data, isFetching } = useQuery({
    queryKey: ['sys_role_grant_tree', roleId],
    queryFn: () => roleService.getGrantTree(roleId),
    enabled: open && !!roleId,
  });

  const treeData = useMemo(() => buildTreeData(data?.tree ?? []), [data?.tree]);

  useEffect(() => {
    if (open && data) {
      setCheckedKeys(data.checkedKeys ?? []);
    }
  }, [open, data]);

  const saveMutation = useMutation({
    mutationFn: (keys: string[]) => roleService.saveGrants(roleId, keys),
    onSuccess: () => {
      message.success('授权保存成功');
      onSaved?.();
    },
    onError: (error: Error) => {
      modal.error({ title: '授权保存失败', content: error.message || '未知错误' });
    },
  });

  /**
   * 勾选变更（checkStrictly 返回对象形态）。
   * @param keys - 勾选 keys
   */
  const handleCheck: TreeProps['onCheck'] = (keys) => {
    const checked = Array.isArray(keys) ? keys : keys.checked;
    setCheckedKeys(checked.map(String));
  };

  /**
   * 保存授权：仅提交 menu:/perm: keys（root: 虚拟根由后端忽略，这里也提前剔除）。
   */
  function handleSave() {
    const keys = checkedKeys.filter((key) => key.startsWith('menu:') || key.startsWith('perm:'));
    saveMutation.mutate(keys);
  }

  return (
    <Drawer
      title={`统一授权${roleName ? ` - ${roleName}` : ''}`}
      open={open}
      width={480}
      onClose={onCancel}
      destroyOnHidden
      extra={
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" loading={saveMutation.isPending} disabled={isFetching} onClick={handleSave}>
            保存
          </Button>
        </Space>
      }
    >
      <Spin spinning={isFetching}>
        {treeData.length > 0 ? (
          <Tree
            checkable
            checkStrictly
            defaultExpandAll
            selectable={false}
            treeData={treeData}
            checkedKeys={checkedKeys}
            onCheck={handleCheck}
          />
        ) : (
          !isFetching && <Empty description="暂无可授权数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Spin>
    </Drawer>
  );
}

export default AssignGrantDrawer;
