/**
 * @file 菜单按钮表格列配置
 */

import { DeleteOutlined, EditOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { App, Button, Switch } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { PermissionModel } from '@/shared/api/system/permission/type';
import { TABLE_ACTION_CELL_CLASSNAME, TABLE_ACTION_COLUMN_WIDTH } from '@/shared/constants/table';
import { useMenuButtonActions } from './useMenuButtonActions';
import { useMenuButtonPermissions } from './useMenuButtonPermissions';

interface UseMenuButtonColumnsProps {
  /**
   * 打开按钮表单弹窗。
   * @param record - 编辑时传入当前行
   */
  onEdit: (record: PermissionModel) => void;
  /** 写操作成功回调 */
  onSuccess?: () => void;
}

/**
 * 构建菜单按钮表格列（编码/名称/排序/状态/操作）。
 *
 * @param props - 列行为依赖的回调与权限上下文
 * @returns antd Table `columns`
 */
export function useMenuButtonColumns(props: UseMenuButtonColumnsProps) {
  const { modal } = App.useApp();
  const { onEdit, onSuccess } = props;
  const { canEdit, canDelete } = useMenuButtonPermissions();
  const { deleteButton, toggleStatus } = useMenuButtonActions({ currentRow: null, onSuccess });

  const columns: ColumnsType<PermissionModel> = [
    { title: '权限编码', dataIndex: 'permCode', key: 'permCode', width: 180, ellipsis: true },
    { title: '按钮名称', dataIndex: 'permName', key: 'permName', width: 140, ellipsis: true },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 70,
      align: 'center',
      sorter: (a, b) => (a.sort ?? 0) - (b.sort ?? 0),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 90,
      render: (_: boolean, record: PermissionModel) => (
        <Switch
          size="small"
          checked={!!record.status}
          checkedChildren="启用"
          unCheckedChildren="禁用"
          disabled={!canEdit}
          onChange={(checked) => toggleStatus(record.id, checked)}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: TABLE_ACTION_COLUMN_WIDTH,
      align: 'center',
      fixed: 'right',
      render: (_: unknown, record: PermissionModel) => (
        <div className={TABLE_ACTION_CELL_CLASSNAME}>
          <Button
            type="link"
            size="small"
            disabled={!canEdit}
            icon={<EditOutlined className="text-(--ant-color-primary)!" />}
            onClick={() => onEdit(record)}
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
              modal.confirm({
                title: '删除按钮',
                icon: <ExclamationCircleFilled />,
                content: `确定删除按钮「${record.permName}」吗？删除后已授权角色将失去该按钮权限。`,
                okButtonProps: { danger: true },
                onOk: () => deleteButton(record.id),
              });
            }}
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  return columns;
}
