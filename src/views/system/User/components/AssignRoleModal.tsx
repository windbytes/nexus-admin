import type { GetProp, TableColumnsType, TableProps, TransferProps } from 'antd';
import DragModal from '@/components/modal/DragModal';

/**
 * 角色分配弹窗（使用表格穿梭框）
 * @param param0
 * @returns
 */
const AssignRoleModal: React.FC<AssignRoleModalProps> = ({ visible, onCancel, onOk }) => {
  return (
    <DragModal open={visible} onCancel={onCancel} onOk={onOk} title="角色分配" width={800} height={600}>
      <div>角色分配表格穿梭框</div>
    </DragModal>
  );
};
export default AssignRoleModal;

interface AssignRoleModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: () => void;
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
