import { Card, Descriptions, Tag, Space, Button, Switch, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, CopyOutlined, PlusOutlined } from '@ant-design/icons';
import { useState, useCallback } from 'react';
import type React from 'react';
import {
  permissionButtonService,
  type PermissionButtonModel,
} from '@/services/system/permission/PermissionButton/permissionButtonApi';
import { usePermission } from '@/hooks/usePermission';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import ButtonForm from './ButtonForm';

/**
 * 按钮详情组件Props
 */
interface ButtonDetailProps {
  button: PermissionButtonModel | null;
}

/**
 * 按钮详情组件
 * 展示权限按钮的详细信息
 */
const ButtonDetail: React.FC<ButtonDetailProps> = ({ button }) => {
  const { modal } = App.useApp();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  // 权限检查
  const canAdd = usePermission(['system:permission:button:add']);
  const canEdit = usePermission(['system:permission:button:edit']);
  const canDelete = usePermission(['system:permission:button:delete']);
  const canCopy = usePermission(['system:permission:button:copy']);

  // 切换按钮状态的mutation
  const toggleButtonStatusMutation = useMutation({
    mutationFn: ({ buttonId, status }: { buttonId: string; status: boolean }) =>
      permissionButtonService.toggleButtonStatus(buttonId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permission-buttons'] });
    },
  });

  // 删除按钮的mutation
  const deleteButtonMutation = useMutation({
    mutationFn: (buttonId: string) => permissionButtonService.deleteButton(buttonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permission-buttons'] });
    },
  });

  /**
   * 处理编辑
   */
  const handleEdit = useCallback(() => {
    setEditing(true);
  }, []);

  /**
   * 处理取消编辑
   */
  const handleCancelEdit = useCallback(() => {
    setEditing(false);
  }, []);

  /**
   * 处理保存编辑
   */
  const handleSaveEdit = useCallback(() => {
    setEditing(false);
    queryClient.invalidateQueries({ queryKey: ['permission-buttons'] });
  }, [queryClient]);

  /**
   * 处理删除
   */
  const handleDelete = useCallback(() => {
    if (!button) return;
    
    modal.confirm({
      title: '删除按钮',
      content: '确定删除按钮吗？数据删除后将无法恢复！',
      onOk: async () => {
        try {
          await deleteButtonMutation.mutateAsync(button.id);
        } catch (error) {
          console.error('删除失败:', error);
        }
      },
    });
  }, [button, deleteButtonMutation, modal]);

  /**
   * 处理复制
   */
  const handleCopy = useCallback(() => {
    // TODO: 实现复制逻辑
    console.log('复制按钮:', button?.id);
  }, [button?.id]);

  if (editing && button) {
    return <ButtonForm button={button} onSave={handleSaveEdit} onCancel={handleCancelEdit} />;
  }

  if (!button) {
    return (
      <Card className="min-h-1/3 max-h-1/2">
        <div className="flex flex-col items-center justify-center h-32 text-gray-400">
          <div className="text-4xl mb-2">📋</div>
          <div>请选择权限按钮</div>
        </div>
      </Card>
    );
  }

  // 按钮详情的描述列表
  const items = [
    {
      key: '1',
      label: '按钮类型',
      children: <Tag color="blue">权限按钮</Tag>,
    },
    {
      key: '2',
      label: '按钮状态',
      children: (
        <Popconfirm
          title="切换按钮状态"
          description={`确定${button.status ? '禁用' : '启用'}按钮吗？`}
          onConfirm={() => {
            toggleButtonStatusMutation.mutate({ buttonId: button.id, status: !button.status });
          }}
        >
          <Switch size="small" checked={button.status} disabled={!canEdit} />
        </Popconfirm>
      ),
    },
    {
      key: '3',
      label: '按钮名称',
      children: button.name,
    },
    {
      key: '4',
      label: '权限标识',
      children: <Tag color="blue">{button.code}</Tag>,
    },
    {
      key: '5',
      label: '所属菜单',
      children: button.parentMenuName,
    },
    {
      key: '6',
      label: '排序',
      children: button.sortNo,
    },
    {
      key: '7',
      label: '创建时间',
      children: button.createTime,
    },
    {
      key: '8',
      label: '更新时间',
      children: button.updateTime,
    },
    ...(button.description ? [{
      key: '9',
      label: '描述',
      children: button.description,
    }] : []),
  ];

  return (
    <Card className="min-h-1/3 max-h-1/2 button-detail-card">
      <Descriptions
        column={2}
        size="small"
        bordered
        items={items}
        title="按钮详情"
        extra={
          <Space>
            {canAdd && (
              <Button type="primary" icon={<PlusOutlined />}>
                新增子按钮
              </Button>
            )}
            {canEdit && (
              <Button
                color="orange"
                variant="outlined"
                icon={<EditOutlined />}
                onClick={handleEdit}
              >
                编辑
              </Button>
            )}
            {canCopy && (
              <Button color="cyan" variant="outlined" icon={<CopyOutlined />} onClick={handleCopy}>
                复制
              </Button>
            )}
            {canDelete && (
              <Button color="danger" variant="outlined" icon={<DeleteOutlined />} onClick={handleDelete}>
                删除
              </Button>
            )}
          </Space>
        }
      />
    </Card>
  );
};

export default ButtonDetail;
