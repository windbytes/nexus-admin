/**
 * @file 角色菜单授权抽屉
 */

import { CloseOutlined, DownOutlined, FolderFilled, FolderOpenFilled } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Checkbox, Drawer, Space, Tree, type TreeProps } from 'antd';
import { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { roleService } from '@/modules/system/api/role';
import { transformData } from '@/shared/utils/utils';

export type AssignRoleMenuDrawerProps = {
  open: boolean;
  /** 角色 id（通过角色 id 查询已分配菜单） */
  roleId: string;
  onOk: () => void;
  onCancel: () => void;
};

/**
 * 角色菜单授权界面。
 *
 * @param props - 开关、角色 id 与回调
 */
function AssignRoleMenuDrawer({ open, roleId, onOk, onCancel }: AssignRoleMenuDrawerProps) {
  const [treeData, setTreeData] = useState<Record<string, unknown>[]>([]);
  const [checked, setChecked] = useState<string[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const { t } = useTranslation();

  const {
    data: resp,
    isSuccess,
    isError,
    error,
  } = useQuery({
    queryKey: ['sys_role_assign_menu', roleId],
    queryFn: () => roleService.getRoleMenu(roleId),
    enabled: open,
  });

  const assignRoleMenuMutation = useMutation({
    mutationFn: (params: { roleId: string; menuIds: string[] }) =>
      roleService.assignRoleMenu(params.roleId, params.menuIds),
    onSuccess: () => {
      onOk();
    },
  });

  useEffect(() => {
    if (isSuccess && resp) {
      const expanded: string[] = [];
      const data = transformData(resp.menuList, expanded, t);
      setTreeData(data);
      setChecked(resp.menuIds);
      setExpandedKeys(expanded);
    }
  }, [isSuccess, resp, t]);

  /**
   * @param selectAllChecked - 是否全选
   */
  function selectAll(selectAllChecked: boolean) {
    if (!selectAllChecked) {
      setChecked([]);
      return;
    }
    const checkedKeys: string[] = [];
    const walk = (nodes: Record<string, unknown>[]) => {
      nodes.forEach((item) => {
        checkedKeys.push(String(item.id));
        if (Array.isArray(item.children) && item.children.length > 0) {
          walk(item.children as Record<string, unknown>[]);
        }
      });
    };
    walk(treeData);
    setChecked(checkedKeys);
  }

  function handleOk() {
    assignRoleMenuMutation.mutate({
      roleId,
      menuIds: checked,
    });
  }

  const handleChecked: TreeProps['onCheck'] = useCallback((checkedKeysValue: unknown) => {
    setChecked((checkedKeysValue as { checked: string[] }).checked);
  }, []);

  return (
    <Drawer
      title="授权菜单、按钮权限"
      size={400}
      open={open}
      closeIcon={false}
      extra={<Button type="text" icon={<CloseOutlined />} onClick={onCancel} />}
      onClose={onCancel}
      footer={
        <div className="flex justify-between items-center">
          <Checkbox
            onChange={(e) => {
              selectAll(e.target.checked);
            }}
          >
            {t('common.operation.selectAll')}
          </Checkbox>
          <Space>
            <Button onClick={onCancel}>{t('common.operation.cancel')}</Button>
            <Button type="primary" onClick={handleOk}>
              {t('common.operation.confirm')}
            </Button>
          </Space>
        </div>
      }
    >
      {isError && (
        <div>
          {t('common.errorMsg.requestFailed')}
          <br />
          {error.message}
        </div>
      )}
      {isSuccess && (
        <Tree
          blockNode
          checkable
          showIcon
          switcherIcon={<DownOutlined />}
          defaultExpandAll
          expandedKeys={expandedKeys}
          fieldNames={{ title: 'name', key: 'id', children: 'children' }}
          icon={(props: { data?: { isLeaf?: boolean; leaf?: boolean }; expanded?: boolean }) => {
            const leaf = props.data?.isLeaf ?? props.data?.leaf;
            if (!leaf) {
              return props.expanded ? (
                <FolderOpenFilled style={{ fontSize: '16px', color: 'orange' }} />
              ) : (
                <FolderFilled style={{ fontSize: '16px', color: 'orange' }} />
              );
            }
            return null;
          }}
          treeData={treeData as never}
          checkedKeys={checked}
          checkStrictly
          onCheck={handleChecked}
        />
      )}
    </Drawer>
  );
}

export default memo(AssignRoleMenuDrawer);
