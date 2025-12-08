import { CloseOutlined, DownOutlined, FolderFilled, FolderOpenFilled } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Checkbox, Drawer, Space, Tree, type TreeProps } from 'antd';
import { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { roleService } from '@/services/system/role/roleApi';
import { transformData } from '@/utils/utils';

/**
 * 角色菜单授权界面
 * @returns
 */
const RoleMenuDrawer: React.FC<RoleMenuDrawerProps> = ({ open, roleId, onOk, onCancel }) => {
  // 树组件的数据
  const [treeData, setTreeData] = useState<any[]>([]);
  // 选中的节点
  const [checked, setChecked] = useState<string[]>([]);
  // 展开的节点
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const { t } = useTranslation();
  // 使用useQuery获取数据
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

  // 分配角色菜单
  const assignRoleMenuMutation = useMutation({
    mutationFn: (params: any) => roleService.assignRoleMenu(params.roleId, params.menuIds),
    onSuccess: () => {
      onOk();
    },
  });

  useEffect(() => {
    if (isSuccess) {
      const expanded: string[] = [];
      const data = transformData(resp.menuList, expanded, t);
      setTreeData(data);
      setChecked(resp.menuIds);
      setExpandedKeys(expanded);
    }
  }, [isSuccess, resp]);

  /**
   * 全选/取消全选
   * @param checked 是否全选
   */
  const selectAll = (checked: boolean) => {
    if (!checked) {
      setChecked([]);
      return;
    }
    const checkedKeys: string[] = [];
    const transform = (treeData: any, checkedKeys: string[]) => {
      treeData.map((item: any) => {
        checkedKeys.push(item.id);
        if (item.children?.length > 0) {
          transform(item.children, checkedKeys);
        }
        return item;
      });
    };
    transform(treeData, checkedKeys);
    setChecked(checkedKeys);
  };

  /**
   * 点击确定的时候的操作
   */
  const handleOk = () => {
    // 保存分配的菜单数据
    assignRoleMenuMutation.mutate({
      roleId: roleId,
      menuIds: checked,
    });
  };

  /**
   * 处理节点选中
   * @param checkedKeys 选中的节点
   * @param e
   */
  const handleChecked: TreeProps['onCheck'] = useCallback((checkedKeysValue: any) => {
    setChecked((checkedKeysValue as any).checked);
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
          icon={(props: any) => {
            // 没有isLeaf这个属性表明是一级菜单
            const { isLeaf } = props.data;
            if (!isLeaf) {
              return props.expanded ? (
                <FolderOpenFilled style={{ fontSize: '16px', color: 'orange' }} />
              ) : (
                <FolderFilled style={{ fontSize: '16px', color: 'orange' }} />
              );
            }
            return <></>;
          }}
          treeData={treeData}
          checkedKeys={checked}
          checkStrictly
          onCheck={handleChecked}
        />
      )}
    </Drawer>
  );
};
export default memo(RoleMenuDrawer);

export type RoleMenuDrawerProps = {
  open: boolean;
  // 角色id（通过角色id查询角色已经分配的菜单）
  roleId: string;
  // 点击确定的回调
  onOk: () => void;
  // 点击取消的回调
  onCancel: (e: any) => void;
};
