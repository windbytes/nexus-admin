import type { GetProp, TableColumnsType, TableProps, TransferProps } from 'antd';
import { useState } from 'react';
import DragModal from '@/components/modal/DragModal';
import type { RoleModel } from '@/services/system/role/type';

/**
 * 角色分配弹窗（使用表格穿梭框）
 * @param param0
 * @returns
 */
const AssignRoleModal: React.FC<AssignRoleModalProps> = (props) => {
  const { open, dataSource, userRoleIds, onCancel, onOk } = props;
  // 显示在右侧的数据key集合
  const [targetKeys, setTargetKeys] = useState<string[]>([]);

  // 点击确定
  const handleOk = () => {
    onOk(targetKeys);
  };

  // 穿梭框数据变更
  const handleChange = (targetKeys: string[]) => {
    setTargetKeys(targetKeys);
  };
  return (
    <DragModal open={open} onCancel={onCancel} title="角色分配" width={800} height={600}>
      <div>角色分配表格穿梭框</div>
    </DragModal>
  );
};
export default AssignRoleModal;

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

type TransferItem = GetProp<TransferProps, 'dataSource'>[number];
type TableRowSelection<T extends object> = TableProps<T>['rowSelection'];

/**
 * 角色数据
 */
interface DataType {
  key: string;
  title: string;
  description: string;
  tag: string;
}

interface TableTransferProps extends TransferProps<TransferItem> {
  dataSource: DataType[];
  leftColumns: TableColumnsType<DataType>;
  rightColumns: TableColumnsType<DataType>;
}
