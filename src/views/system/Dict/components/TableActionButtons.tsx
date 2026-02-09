import { PlusOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import type { DictModel } from '@/services/system/dict/type.d';
import type { DictModalType } from '../hooks/useDictModals';
import { useDictPermissions } from '../hooks/useDictPermissions';

interface TableActionButtonsProps {
  openModal: (name: DictModalType, record?: DictModel) => void;
  refetch: () => void;
}

/**
 * 字典列表表格上方操作区：新增、刷新等
 */
const TableActionButtons: React.FC<TableActionButtonsProps> = ({ openModal, refetch }) => {
  const { t } = useTranslation();
  const { canAdd } = useDictPermissions();

  return (
    <div className="flex grow items-center justify-between">
      <Space size="middle">
        {canAdd && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal('add')}>
            {t('common.operation.add')}
          </Button>
        )}
        <Button onClick={() => refetch()}>{t('common.operation.refresh')}</Button>
      </Space>
    </div>
  );
};

export default TableActionButtons;
