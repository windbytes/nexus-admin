import type { UserModel } from '@/shared/api/system/user/type';
import DragModal from '@/shared/components/modal/DragModal';

interface OperationProps {
  userInfo: Partial<UserModel> | null;
  open: boolean;
  onCancel: () => void;
}

/**
 * 操作记录弹窗（占位实现，后续接入）。
 *
 * @returns 操作记录 DragModal
 */
const Operation: React.FC<OperationProps> = ({ userInfo, open, onCancel }) => {
  void userInfo;
  return (
    <DragModal open={open} onCancel={onCancel} title="操作记录" width={800} height={600}>
      这是操作记录弹窗
    </DragModal>
  );
};

export default Operation;
