/**
 * @file 系统接口注册表列配置
 */

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { App, Button, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ApiModel } from '@/shared/api/system/api/type';
import { TABLE_ACTION_CELL_CLASSNAME, TABLE_ACTION_COLUMN_WIDTH } from '@/shared/constants/table';
import { getMethodColor, SOURCE_TAG } from '../constants';
import { useApiPermissions } from './useApiPermissions';

interface UseApiTableColumnsOptions {
  onEdit: (record: ApiModel) => void;
  onDelete: (record: ApiModel) => void;
}

/**
 * 系统接口注册表列配置。
 *
 * @param options - 编辑/删除回调
 * @returns antd Table `columns`
 */
export function useApiTableColumns(options: UseApiTableColumnsOptions): ColumnsType<ApiModel> {
  const { modal } = App.useApp();
  const { onEdit, onDelete } = options;
  const { canEdit, canDelete } = useApiPermissions();

  return [
    { title: '接口名称', dataIndex: 'apiName', key: 'apiName', width: 160, ellipsis: true },
    {
      title: '请求方法',
      dataIndex: 'method',
      key: 'method',
      width: 90,
      align: 'center',
      render: (method: string) => <Tag color={getMethodColor(method)}>{method ?? '-'}</Tag>,
    },
    {
      title: '接口路径',
      dataIndex: 'path',
      key: 'path',
      width: 220,
      ellipsis: true,
      sorter: (a, b) => (a.path ?? '').localeCompare(b.path ?? ''),
    },
    {
      title: '绑定权限点',
      dataIndex: 'permCode',
      key: 'permCode',
      width: 200,
      ellipsis: true,
      render: (_: string, record: ApiModel) =>
        record.permCode ? (
          <Typography.Text className="text-xs">{record.permCode}</Typography.Text>
        ) : (
          <Tag color="default">仅需认证</Tag>
        ),
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 90,
      align: 'center',
      render: (source: number) => {
        const tag = SOURCE_TAG[source] ?? { label: '未知', color: 'default' };
        return <Tag color={tag.color}>{tag.label}</Tag>;
      },
    },
    {
      title: '公开',
      dataIndex: 'isPublic',
      key: 'isPublic',
      align: 'center',
      width: 70,
      render: (v: boolean) => (v ? <Tag color="green">白名单</Tag> : '否'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 70,
      render: (v: boolean) => (v ? <Tag color="success">启用</Tag> : <Tag color="error">停用</Tag>),
    },
    { title: '描述', dataIndex: 'remark', key: 'remark', width: 140, ellipsis: true },
    {
      title: '操作',
      key: 'action',
      width: TABLE_ACTION_COLUMN_WIDTH,
      align: 'center',
      fixed: 'right',
      render: (_: unknown, record: ApiModel) => (
        <div className={TABLE_ACTION_CELL_CLASSNAME}>
          <Button
            type="link"
            size="small"
            disabled={!canEdit}
            icon={<EditOutlined className="text-(--ant-color-primary)!" />}
            onClick={() => {
              if (!canEdit) {
                modal.error({
                  title: '权限不足',
                  content: '您没有编辑接口的权限，请联系管理员获取相应权限。',
                });
                return;
              }
              onEdit(record);
            }}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            disabled={!canDelete}
            icon={<DeleteOutlined />}
            onClick={() => {
              if (!canDelete) {
                modal.error({
                  title: '权限不足',
                  content: '您没有删除接口的权限，请联系管理员获取相应权限。',
                });
                return;
              }
              onDelete(record);
            }}
          >
            删除
          </Button>
        </div>
      ),
    },
  ];
}
