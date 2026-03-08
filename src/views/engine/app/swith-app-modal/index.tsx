import { Button } from 'antd';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import DragModal from '@/components/modal/DragModal';

type SwitchAppModalProps = {
  onConfirm?: (type?: number) => void;
  onClose?: () => void;
};

/**
 * 切换应用类型弹窗（阶段一占位）
 */
const SwitchAppModal: React.FC<SwitchAppModalProps> = ({ onConfirm, onClose }) => {
  const { t } = useTranslation();

  return (
    <DragModal
      open
      title={t('app.switch') ?? '切换应用类型'}
      onCancel={onClose}
      footer={
        <Button
          type="primary"
          onClick={() => {
            onConfirm?.();
            onClose?.();
          }}
        >
          {t('common.operation.confirm')}
        </Button>
      }
    >
      <div className="py-4 text-[#676f83]">{t('app.switch') ?? '切换功能敬请期待'}</div>
    </DragModal>
  );
};

export default SwitchAppModal;
