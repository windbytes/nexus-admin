import { Modal, Tag } from 'antd';
import { useMemo, memo } from 'react';
import type React from 'react';
import type { RoleModel } from '@/services/system/role/type';
import type { MenuModel } from '@/services/system/menu/type';

/**
 * 批量操作确认弹窗组件Props
 */
interface BatchOperationModalProps {
  /** 是否显示弹窗 */
  visible: boolean;
  /** 操作类型 */
  operationType: 'assign' | 'revoke';
  /** 选中的角色ID列表 */
  selectedRoles: string[];
  /** 选中的权限ID列表 */
  selectedPermissions: string[];
  /** 角色列表 */
  roleList?: RoleModel[];
  /** 权限列表 */
  permissionList?: MenuModel[];
  /** 是否正在确认操作 */
  confirmLoading?: boolean;
  /** 确认回调 */
  onConfirm: () => void;
  /** 取消回调 */
  onCancel: () => void;
}

/**
 * 批量操作确认弹窗组件
 * 负责显示批量操作的确认信息
 */
const BatchOperationModal: React.FC<BatchOperationModalProps> = memo(({
  visible,
  operationType,
  selectedRoles,
  selectedPermissions,
  roleList = [],
  permissionList = [],
  confirmLoading = false,
  onConfirm,
  onCancel,
}) => {
  /**
   * 获取操作显示文本
   */
  const operationText = useMemo(() => {
    return operationType === 'assign' ? '分配' : '回收';
  }, [operationType]);

  /**
   * 获取选中的角色信息
   */
  const selectedRoleInfo = useMemo(() => {
    return selectedRoles.map((roleId) => {
      const role = roleList.find((r: RoleModel) => r.id === roleId);
      return { id: roleId, name: role?.roleName || '未知角色' };
    });
  }, [selectedRoles, roleList]);

  /**
   * 获取选中的权限信息
   */
  const selectedPermissionInfo = useMemo(() => {
    return selectedPermissions.map((permissionId) => {
      const permission = permissionList.find((p: MenuModel) => p.id === permissionId);
      return { id: permissionId, name: permission?.name || permission?.perms || '未知权限' };
    });
  }, [selectedPermissions, permissionList]);

  return (
    <Modal
      title="确认批量操作"
      open={visible}
      onOk={onConfirm}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      width={600}
    >
      <div className="py-4">
        <p className="mb-4">确定要{operationText}以下权限吗？</p>
        <div className="space-y-2">
          <div>
            <strong>操作角色：</strong>
            <div className="mt-1">
              {selectedRoleInfo.map((role) => (
                <Tag key={role.id} color="blue" className="mr-1">
                  {role.name}
                </Tag>
              ))}
            </div>
          </div>
          <div>
            <strong>操作权限：</strong>
            <div className="mt-1">
              {selectedPermissionInfo.map((permission) => (
                <Tag key={permission.id} color="green" className="mr-1">
                  {permission.name}
                </Tag>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
});

BatchOperationModal.displayName = 'BatchOperationModal';

export default BatchOperationModal;
