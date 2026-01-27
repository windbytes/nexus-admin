import { Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Tag } from 'antd';
import type { ApiModel } from '@/services/system/api/type';
import { getMethodColor } from '../constants';

interface UseApiTableColumnOptions {
  onEdit: (record: ApiModel) => void;
  onDelete: (record: ApiModel) => void;
}

/**
 * 系统接口表格列配置
 */
export function useApiTableColumn(options: UseApiTableColumnOptions): ColumnsType<ApiModel> {
  const { onEdit, onDelete } = options;

  return [
    { title: '接口名称', dataIndex: 'name', key: 'name', width: 160, ellipsis: true },
    {
      title: '请求方法',
      dataIndex: 'method',
      key: 'method',
      width: 100,
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
    { title: '权限标识', dataIndex: 'permCode', key: 'permCode', width: 160, ellipsis: true },
    { title: '描述', dataIndex: 'remark', key: 'remark', width: 140, ellipsis: true },
    {
      title: '公开',
      dataIndex: 'isPublic',
      key: 'isPublic',
      width: 70,
      render: (v: boolean) => (v ? '是' : '否'),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_: unknown, record: ApiModel) => (
        <div className="flex gap-1">
          <Button type="link" size="small" onClick={() => onEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" danger onClick={() => onDelete(record)}>
            删除
          </Button>
        </div>
      ),
    },
  ];
}
