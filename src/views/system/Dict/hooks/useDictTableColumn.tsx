import { ExclamationCircleFilled } from '@ant-design/icons';
import { App, Button, Space, type TableProps, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { DeleteDismiss24Filled } from '@/components/icons';
import type { DictModel } from '@/services/system/dict/type.d';
import { DICT_TYPE_OPTIONS } from '../constants';
import { useDictActions } from './useDictAction';
import type { DictModalType } from './useDictModals';
import { useDictPermissions } from './useDictPermissions';

interface UseDictTableColumnsProps {
  currentRow: Partial<DictModel> | null;
  openModal: (name: DictModalType, record?: DictModel) => void;
  onSuccess?: () => void;
}

/**
 * 字典表格列配置 hook。操作列直接展示编辑、删除按钮，不再使用 Dropdown。
 */
export const useDictTableColumns = (props: UseDictTableColumnsProps) => {
  const { modal } = App.useApp();
  const { currentRow, openModal, onSuccess } = props;
  const { canEdit, canDelete } = useDictPermissions();
  const { t } = useTranslation();
  const { deleteDict } = useDictActions({ currentRow, onSuccess });

  const columns: TableProps<DictModel>['columns'] = [
    {
      title: '字典编码',
      dataIndex: 'dictCode',
      key: 'dictCode',
      ellipsis: true,
      width: 140,
    },
    {
      title: '字典名称',
      dataIndex: 'dictName',
      key: 'dictName',
      ellipsis: true,
      width: 160,
    },
    {
      title: '类型',
      dataIndex: 'dictType',
      key: 'dictType',
      width: 100,
      render: (type: string) => {
        const opt = DICT_TYPE_OPTIONS.find((o) => o.value === type);
        const color = type === 'MANUAL' ? 'blue' : type === 'SQL' ? 'green' : 'orange';
        return <Tag color={color}>{opt?.label ?? type}</Tag>;
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '启用',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 72,
      render: (v: boolean) => (v ? '是' : '否'),
    },
    {
      title: '缓存',
      dataIndex: 'cacheEnabled',
      key: 'cacheEnabled',
      width: 72,
      render: (v: boolean) => (v ? '是' : '否'),
    },
    {
      title: t('common.operation.operation'),
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_: unknown, record: DictModel) => (
        <Space size="small">
          <Button type="link" size="small" disabled={!canEdit} onClick={() => canEdit && openModal('edit', record)}>
            {t('common.operation.edit')}
          </Button>
          <Button
            type="link"
            size="small"
            danger
            disabled={!canDelete}
            icon={<DeleteDismiss24Filled className="text-sm! align-middle" />}
            onClick={() => {
              if (!canDelete) {
                return;
              }
              modal.confirm({
                title: '删除字典',
                icon: <ExclamationCircleFilled />,
                content: '确定删除该字典吗？删除后其数据源、列映射与手工数据将一并处理。',
                okButtonProps: { danger: true },
                onOk: () => deleteDict(record.id),
              });
            }}
          >
            {t('common.operation.delete')}
          </Button>
        </Space>
      ),
    },
  ];

  return columns;
};
