import { useState, useEffect, useCallback } from 'react';
import { Select, App } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { PermissionButtonModel } from '@/services/system/permission/PermissionButton/permissionButtonApi';
import { permissionButtonService } from '@/services/system/permission/PermissionButton/permissionButtonApi';
import DragModal from '@/components/modal/DragModal';

/**
 * 接口权限映射Modal组件Props
 */
interface InterfacePermissionMappingModalProps {
  open: boolean;
  button: PermissionButtonModel | null;
  onOk: () => void;
  onCancel: () => void;
}

/**
 * 接口权限映射Modal组件
 * 用于添加按钮与接口权限的映射关系
 */
const InterfacePermissionMappingModal: React.FC<InterfacePermissionMappingModalProps> = ({
  open,
  button,
  onOk,
  onCancel,
}) => {
  const { modal } = App.useApp();
  const queryClient = useQueryClient();
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);

  // 查询可用的接口权限列表
  const { data: availablePermissionsData, isLoading: availablePermissionsLoading } = useQuery({
    queryKey: ['available-interface-permissions'],
    queryFn: async () => {
      return permissionButtonService.getAllInterfaces();
    },
    enabled: open,
  });

  // 添加映射的mutation
  const addMappingMutation = useMutation({
    mutationFn: async (permissionIds: string[]) => {
      if (!button?.id) throw new Error('按钮ID不能为空');
      return await permissionButtonService.assignButtonInterfaces(button.id, permissionIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['button-interface-permission', button?.id],
      });
      onOk();
    },
  });

  // 处理确认添加映射
  const handleConfirmAddMapping = useCallback(() => {
    if (selectedPermissionIds.length === 0) {
      modal.warning({
        title: '请选择接口权限',
        content: '请至少选择一个接口权限进行映射',
      });
      return;
    }
    addMappingMutation.mutate(selectedPermissionIds);
  }, [selectedPermissionIds, addMappingMutation, modal]);

  // 处理取消
  const handleCancel = useCallback(() => {
    setSelectedPermissionIds([]);
    onCancel();
  }, [onCancel]);

  // 重置选择状态
  useEffect(() => {
    if (!open) {
      setSelectedPermissionIds([]);
    }
  }, [open]);

  return (
    <DragModal
      title="添加接口权限映射"
      open={open}
      onOk={handleConfirmAddMapping}
      onCancel={handleCancel}
      width={600}
      confirmLoading={addMappingMutation.isPending}
    >
      <div className="flex flex-col gap-4">
        <div className="text-sm text-gray-600">请选择要映射到按钮 "{button?.name}" 的接口权限：</div>
        <Select
          mode="multiple"
          placeholder="请选择接口权限"
          value={selectedPermissionIds}
          onChange={setSelectedPermissionIds}
          style={{ width: '100%' }}
          loading={availablePermissionsLoading}
          options={
            availablePermissionsData?.map((permission) => ({
              label: `${permission.name} (${permission.code})`,
              value: permission.id,
            })) || []
          }
          showSearch
          filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
        />
        <div className="text-xs text-gray-500 mt-4">提示：接口权限的编辑需要在专门的接口权限管理模块中进行</div>
      </div>
    </DragModal>
  );
};

export default InterfacePermissionMappingModal;
