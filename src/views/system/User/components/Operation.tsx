import DragModal from '@/components/modal/DragModal';
import type { UserModel } from '@/services/system/user/type';

interface OperationProps {
  userInfo: Partial<UserModel>;
  visible: boolean;
  onCancel: () => void;
}

/**
 * 操作记录弹窗
 * @returns
 */
const Operation: React.FC<OperationProps> = ({ userInfo, visible, onCancel }) => {
  return (
    <DragModal open={visible} onCancel={onCancel} title="操作记录" width={800} height={600}>
      这是操作记录弹窗
    </DragModal>
  );
};

export default Operation;
