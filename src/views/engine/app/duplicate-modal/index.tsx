import type React from 'react';
import DragModal from '@/components/modal/DragModal';
import type { AppIconType } from '@/services/engine/app/types';

export type DuplicateAppModalProps = {
  show: boolean;
  appName: string;
  icon_type: AppIconType | null;
  icon: string;
  icon_url: string | null;
  icon_background?: string | null;
  onConfirm: (info: {
    name: string;
    icon_type: AppIconType;
    icon: string;
    icon_url?: string;
    icon_background?: string | null;
  }) => Promise<void>;
  onCancel: () => void;
};

/**
 * 复制项目弹窗
 * @returns
 */

const DuplicateAppModal: React.FC<DuplicateAppModalProps> = ({
  show,
  appName,
  icon_type,
  icon,
  icon_url,
  icon_background,
  onConfirm,
  onCancel,
}) => {
  /**
   * 确认
   */
  const onConfirmClick = async () => {};

  return (
    <DragModal open={show} onCancel={onCancel} title="复制应用">
      内容
    </DragModal>
  );
};
export default DuplicateAppModal;
