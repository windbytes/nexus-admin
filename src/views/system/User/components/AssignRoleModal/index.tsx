import { Button, Space } from 'antd';
import { type Key, useCallback, useEffect, useState } from 'react';
import DragModal from '@/components/modal/DragModal';
import type { RoleModel } from '@/services/system/role/type';
import TableTransfer from './TableTransfer';
import { useTableColumns } from './useTableColumns';
import { useTransferData } from './useTransferData';

/**
 * 角色分配弹窗属性
 */
interface AssignRoleModalProps {
  open: boolean;
  // 所有角色数据
  dataSource: RoleModel[];
  // 用户拥有的角色ID集合
  userRoleIds: string[];
  // 窗口点击取消回调
  onCancel: () => void;
  // 窗口点击确定回调
  onOk: (targetKeys: string[]) => void;
}

/**
 * 角色分配弹窗（使用表格穿梭框）
 */
const AssignRoleModal: React.FC<AssignRoleModalProps> = (props) => {
  const { open, dataSource, userRoleIds, onCancel, onOk } = props;

  // 显示在右侧的数据key集合
  const [targetKeys, setTargetKeys] = useState<string[]>([]);

  // 获取表格列配置
  const { leftColumns, rightColumns } = useTableColumns();

  // 处理穿梭框数据
  const { transferData, initialTargetKeys } = useTransferData(dataSource, userRoleIds);

  // 初始化目标keys
  useEffect(() => {
    if (open) {
      setTargetKeys(initialTargetKeys);
    }
  }, [open, initialTargetKeys]);

  // 弹窗关闭时重置状态
  useEffect(() => {
    if (!open) {
      setTargetKeys([]);
    }
  }, [open]);

  // 点击确定
  const handleOk = useCallback(() => {
    onOk(targetKeys);
  }, [onOk, targetKeys]);

  // 搜索过滤函数
  const filterOption = useCallback((inputValue: string, item: (typeof transferData)[number]) => {
    const lowerInputValue = inputValue.toLowerCase();
    return (
      item.roleCode?.toLowerCase().includes(lowerInputValue) ||
      item.roleName?.toLowerCase().includes(lowerInputValue) ||
      item.remark?.toLowerCase().includes(lowerInputValue)
    );
  }, []);

  return (
    <DragModal
      open={open}
      onCancel={onCancel}
      title="角色分配"
      width={1000}
      maskClosable={false}
      footer={
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={handleOk}>
            确定
          </Button>
        </Space>
      }
      styles={{
        body: {
          padding: '16px',
        },
      }}
    >
      <div className="flex flex-col gap-4">
        <div className="text-sm text-gray-600">
          已选择 <span className="font-semibold text-blue-600">{targetKeys.length}</span> 个角色
        </div>
        <TableTransfer
          dataSource={transferData}
          targetKeys={targetKeys}
          onChange={(targetKeys: Key[]) => {
            setTargetKeys(targetKeys.map((key) => key.toString()));
          }}
          leftColumns={leftColumns}
          rightColumns={rightColumns}
          titles={['未分配角色', '已分配角色']}
          showSearch
          filterOption={(inputValue, item, _direction) => !!filterOption(inputValue, item)}
          styles={{
            section: {
              width: '100%',
              height: 500,
            },
          }}
          actions={['分配', '移除']}
        />
      </div>
    </DragModal>
  );
};

export default AssignRoleModal;
