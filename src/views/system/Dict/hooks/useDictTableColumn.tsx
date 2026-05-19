import { DeleteOutlined, EditOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { App, Button, type TableProps, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { TABLE_ACTION_CELL_CLASSNAME, TABLE_ACTION_COLUMN_WIDTH } from '@/constants/table';
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
      align: 'center',
      render: (type: string) => {
        const opt = DICT_TYPE_OPTIONS.find((o) => o.value === type);
        const color = type === 'MANUAL' ? 'blue' : type === 'SQL' ? 'green' : 'orange';
        return (
          <Tag variant="solid" color={color}>
            {opt?.label ?? type}
          </Tag>
        );
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
      width: 88,
      align: 'center',
      render: (v: boolean) => (
        <Tag variant="solid" color={v ? 'success' : 'default'}>
          {v ? '是' : '否'}
        </Tag>
      ),
    },
    {
      title: '缓存',
      dataIndex: 'cacheEnabled',
      key: 'cacheEnabled',
      width: 88,
      align: 'center',
      render: (v: boolean) => (
        <Tag variant="solid" color={v ? 'processing' : 'default'}>
          {v ? '是' : '否'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: TABLE_ACTION_COLUMN_WIDTH,
      fixed: 'end',
      align: 'center',
      render: (_: unknown, record: DictModel) => (
        <div className={TABLE_ACTION_CELL_CLASSNAME}>
          <Button
            type="link"
            size="small"
            disabled={!canEdit}
            icon={<EditOutlined className="text-(--ant-color-primary)!" />}
            classNames={{ content: 'text-(--ant-color-primary)' }}
            onClick={() => canEdit && openModal('edit', record)}
          >
            {t('common.operation.edit')}
          </Button>
          <Button
            type="link"
            size="small"
            danger
            disabled={!canDelete}
            icon={<DeleteOutlined />}
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
        </div>
      ),
    },
  ];

  return columns;
};
