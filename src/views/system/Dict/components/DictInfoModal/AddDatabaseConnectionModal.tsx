import { Modal, Typography } from 'antd';
import { memo } from 'react';

interface AddDatabaseConnectionModalProps {
  open: boolean;
  onCancel: () => void;
}

/**
 * 新增数据库连接弹窗（占位：后续接表单与保存接口）
 */
function AddDatabaseConnectionModal({ open, onCancel }: AddDatabaseConnectionModalProps) {
  return (
    <Modal title="新增连接" open={open} onCancel={onCancel} footer={null} destroyOnClose width={560}>
      <Typography.Text type="secondary">配置表单与接口联调尚未接入，请稍后。</Typography.Text>
    </Modal>
  );
}

export default memo(AddDatabaseConnectionModal);
