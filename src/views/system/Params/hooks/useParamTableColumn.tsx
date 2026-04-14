import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import { Button, Switch, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { TABLE_ACTION_CELL_CLASSNAME, TABLE_ACTION_COLUMN_WIDTH } from '@/constants/table';
import type { SysParam } from '@/services/system/params';
import { CATEGORY_OPTIONS, DATA_TYPE_OPTIONS } from '@/services/system/params';
import { useParamPermissions } from './useParamPermissions';

interface UseParamTableColumnProps {
  // 编辑回调
  onEdit: (record: SysParam) => void;
  // 删除回调
  onDelete: (record: SysParam) => void;
  // 状态变更回调
  onStatusChange: (record: SysParam, checked: boolean) => void;
}

/**
 * @description: 参数表格列配置hook
 */
export const useParamTableColumns = (props: UseParamTableColumnProps) => {
  const { onEdit, onDelete, onStatusChange } = props;
  const { t } = useTranslation();
  const { canEdit, canDelete } = useParamPermissions();

  // 获取数据类型标签
  const getDataTypeLabel = (value: string) => {
    const option = DATA_TYPE_OPTIONS.find((item) => item.value === value);
    return option?.label || value;
  };

  // 获取分类标签
  const getCategoryLabel = (value: string) => {
    const option = CATEGORY_OPTIONS.find((item) => item.value === value);
    return option?.label || value;
  };

  const columns: TableProps<SysParam>['columns'] = [
    {
      title: '参数名称',
      dataIndex: 'name',
      key: 'name',
      width: 160,
      fixed: 'start',
      ellipsis: true,
    },
    {
      title: '参数标识',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      ellipsis: true,
    },
    {
      title: '参数值',
      dataIndex: 'value',
      key: 'value',
      width: 220,
      ellipsis: true,
      render: (value: string) => value || '-',
    },
    {
      title: '默认值',
      dataIndex: 'defaultValue',
      key: 'defaultValue',
      width: 220,
      ellipsis: true,
      render: (value: string) => value || '-',
    },
    {
      title: '参数分类',
      dataIndex: 'category',
      key: 'category',
      align: 'center',
      width: 100,
      render: (value: string) => (
        <Tag variant="solid" color="blue">
          {getCategoryLabel(value)}
        </Tag>
      ),
    },
    {
      title: '数据类型',
      dataIndex: 'dataType',
      key: 'dataType',
      width: 120,
      align: 'center',
      render: (value: string) => (
        <Tag variant="solid" color="green">
          {getDataTypeLabel(value)}
        </Tag>
      ),
    },
    {
      title: '必填',
      dataIndex: 'required',
      key: 'required',
      align: 'center',
      width: 80,
      render: (value: boolean) => <Tag color={value ? 'red' : 'default'}>{value ? '是' : '否'}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 120,
      render: (value: boolean, record: SysParam) =>
        canEdit ? (
          <Switch
            checked={value}
            onChange={(checked) => onStatusChange(record, checked)}
            checkedChildren="启用"
            unCheckedChildren="禁用"
          />
        ) : (
          <Tag color={value ? 'green' : 'red'}>{value ? '启用' : '禁用'}</Tag>
        ),
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      align: 'center',
      width: 180,
      render: (value: string) => {
        if (!value) {
          return '-';
        }
        return value;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: TABLE_ACTION_COLUMN_WIDTH,
      align: 'center',
      fixed: 'end',
      render: (_: unknown, record: SysParam) => (
        <div className={TABLE_ACTION_CELL_CLASSNAME}>
          <Button
            size="small"
            type="link"
            disabled={!canEdit}
            icon={<EditOutlined className="text-(--ant-color-primary)!" />}
            onClick={() => onEdit(record)}
          >
            {t('common.operation.edit')}
          </Button>
          <Button
            size="small"
            type="link"
            danger
            disabled={!canDelete}
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record)}
          >
            {t('common.operation.delete')}
          </Button>
        </div>
      ),
    },
  ];

  return columns;
};
