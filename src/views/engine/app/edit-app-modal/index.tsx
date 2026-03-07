import { useKeyPress } from 'ahooks';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DragModal from '@/components/modal/DragModal';

/**
 * 编辑APP弹窗属性
 */
export interface EditAppModalProps {
  open: boolean;
  isEditModal?: boolean;
  appName: string;
  appDescription: string;
  appIcon: string;
  appMode: number;
  logLevel?: number;
  priority?: number;
  onConfirm: (info: {
    name: string;
    icon: string;
    description: string;
    logLevel: number;
    priority: number;
  }) => Promise<void>;
  onCancel: () => void;
}

/**
 * 编辑APP弹窗
 */
const EditAppModal: React.FC<EditAppModalProps> = ({
  open,
  isEditModal = false,
  appName,
  appDescription,
  appIcon: _appIcon,
  appMode,
  logLevel,
  priority,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();

  // 应用名称
  const [name, setName] = useState<string>(appName);
  // 应用图标
  const [appIcon, setAppIcon] = useState<string>(_appIcon);
  // 应用描述
  const [description, setDescription] = useState<string>(appDescription);

  // 保存操作
  const submit = useCallback(async () => {
    // 验证名称必填
  }, []);

  // 键盘操作
  useKeyPress(['meta.enter', 'ctrl.enter'], () => {});

  return (
    <DragModal open={open} title="编辑应用" onCancel={onCancel} onOk={submit}>
      描述信息
    </DragModal>
  );
};

export default EditAppModal;
