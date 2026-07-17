/**
 * @file 系统接口表格列配置
 */

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { App, Button, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ApiModel } from '@/shared/api/system/api/type';
import { TABLE_ACTION_CELL_CLASSNAME, TABLE_ACTION_COLUMN_WIDTH } from '@/shared/constants/table';
import { getMethodColor } from '../constants';
import { useApiPermissions } from './useApiPermissions';

interface UseApiTableColumnsOptions {
  onEdit: (record: ApiModel) => void;
  onDelete: (record: ApiModel) => void;
  /** 未选菜单时禁用操作列按钮 */
  actionsDisabled?: boolean;
}

/**
 * 系统接口表格列配置。
 *
 * @param options - 编辑/删除回调与禁用态
 * @returns antd Table `columns`
 */
export function useApiTableColumns(options: UseApiTableColumnsOptions): ColumnsType<ApiModel> {
  const { modal } = App.useApp();
  const { onEdit, onDelete, actionsDisabled = false } = options;
  const { canUpdate, canDelete } = useApiPermissions();

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
      align: 'center',
      width: 70,
      render: (v: boolean) => (v ? '是' : '否'),
    },
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
            disabled={actionsDisabled || !canUpdate}
            icon={<EditOutlined className="text-(--ant-color-primary)!" />}
            onClick={() => {
              if (!canUpdate) {
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
            disabled={actionsDisabled || !canDelete}
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
