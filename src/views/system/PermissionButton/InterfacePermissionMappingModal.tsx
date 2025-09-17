import { useState, useEffect, useCallback, useId } from 'react';
import { App, Tag } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { PermissionButtonModel } from '@/services/system/permission/PermissionButton/permissionButtonApi';
import { permissionButtonService } from '@/services/system/permission/PermissionButton/permissionButtonApi';
import type { InterfacePermission } from '@/services/system/menu/menuApi';
import DragModal from '@/components/modal/DragModal';
import { TableSelect } from '@/components/select/TableSelect';
import type { TableColumnConfig } from '@/components/select/TableSelect/types';

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
  const [selectedPermissions, setSelectedPermissions] = useState<InterfacePermission[]>([]);
  const interfaceSelectorId = useId();

  // 获取接口权限数据
  const fetchInterfaceData = async (
    _id: string,
  ): Promise<{ columns: TableColumnConfig<InterfacePermission>[]; data: InterfacePermission[] }> => {
    const data = await permissionButtonService.getAllInterfaces();

    const columns: TableColumnConfig<InterfacePermission>[] = [
      {
        title: '接口名称',
        dataIndex: 'name',
        searchable: true,
        width: 150,
      },
      {
        title: '所属菜单',
        dataIndex: 'menuName',
        searchable: true,
        width: 150,
      },
      {
        title: '接口编码',
        dataIndex: 'code',
        searchable: true,
        width: 120,
      },
      {
        title: '请求路径',
        dataIndex: 'path',
        searchable: true,
        width: 200,
        ellipsis: true,
      },
      {
        title: '请求方法',
        dataIndex: 'method',
        width: 80,
        render: (method: string) => <Tag color={getMethodColor(method)}>{method}</Tag>,
      },
      {
        title: '备注',
        dataIndex: 'remark',
        width: 150,
        ellipsis: true,
      },
    ];

    return {
      columns,
      data,
    };
  };

  // 获取请求方法对应的颜色
  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'blue';
      case 'POST':
        return 'green';
      case 'PUT':
        return 'orange';
      case 'DELETE':
        return 'red';
      default:
        return 'default';
    }
  };

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
    if (selectedPermissions.length === 0) {
      modal.warning({
        title: '请选择接口权限',
        content: '请至少选择一个接口权限进行映射',
      });
      return;
    }
    const permissionIds = selectedPermissions.map((p) => p.id);
    addMappingMutation.mutate(permissionIds);
  }, [selectedPermissions, addMappingMutation, modal]);

  // 处理取消
  const handleCancel = useCallback(() => {
    setSelectedPermissions([]);
    onCancel();
  }, [onCancel]);

  // 重置选择状态
  useEffect(() => {
    if (!open) {
      setSelectedPermissions([]);
    }
  }, [open]);

  return (
    <DragModal
      title="添加接口权限映射"
      open={open}
      onOk={handleConfirmAddMapping}
      onCancel={handleCancel}
      width={800}
      confirmLoading={addMappingMutation.isPending}
    >
      <div className="flex flex-col gap-4">
        <div className="text-sm text-gray-600">请选择要映射到按钮 "{button?.name}" 的接口权限：</div>
        <TableSelect<InterfacePermission>
          id={interfaceSelectorId}
          placeholder="请选择接口权限"
          value={selectedPermissions.length > 0 ? selectedPermissions[0] : undefined}
          onChange={(value) => {
            if (value) {
              setSelectedPermissions([value]);
            } else {
              setSelectedPermissions([]);
            }
          }}
          displayField="name"
          keyField="id"
          dataSource={fetchInterfaceData}
          dropdownWidth={750}
          dropdownHeight={400}
          pagination={{ pageSize: 10 }}
          styles={{
            input: { width: '100%' },
          }}
          displayValueFormatter={(permission) =>
            `${permission.name} (${permission.code}) - ${permission.method} ${permission.path}`
          }
        />
        <div className="text-xs text-gray-500 mt-4">提示：接口权限的编辑需要在专门的接口权限管理模块中进行</div>
      </div>
    </DragModal>
  );
};

export default InterfacePermissionMappingModal;
