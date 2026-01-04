import type { TableProps } from 'antd';
import { Button, Switch, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
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
      title: '参数内容',
      dataIndex: 'value',
      key: 'value',
      ellipsis: true,
      render: (value: string) => value || '-',
    },
    {
      title: '参数分类',
      dataIndex: 'category',
      key: 'category',
      align: 'center',
      width: 100,
      render: (value: string) => <Tag color="blue">{getCategoryLabel(value)}</Tag>,
    },
    {
      title: '数据类型',
      dataIndex: 'dataType',
      key: 'dataType',
      width: 120,
      render: (value: string) => <Tag color="green">{getDataTypeLabel(value)}</Tag>,
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
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
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
      width: 140,
      align: 'center',
      fixed: 'end',
      render: (_: any, record: SysParam) => (
        <>
          {canEdit && (
            <Button size="small" type="link" onClick={() => onEdit(record)}>
              {t('common.operation.edit')}
            </Button>
          )}
          {canDelete && (
            <Button size="small" type="link" danger onClick={() => onDelete(record)}>
              {t('common.operation.delete')}
            </Button>
          )}
        </>
      ),
    },
  ];

  return columns;
};
