/**
 * @file 页面按钮表格列配置
 */

import { DeleteOutlined, EditOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { App, Button, Switch } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { PageButtonModel } from '@/shared/api/system/pageButton/type';
import { TABLE_ACTION_CELL_CLASSNAME, TABLE_ACTION_COLUMN_WIDTH } from '@/shared/constants/table';
import type { ButtonModalType } from '../types';
import { useButtonActions } from './useButtonActions';
import { useButtonPermissions } from './useButtonPermissions';

interface UseButtonTableColumnsProps {
  /**
   * 打开弹窗。
   * @param name - 弹窗类型
   * @param record - 关联按钮行
   */
  openModal: (name: ButtonModalType, record?: Partial<PageButtonModel>) => void;
  /** 写操作成功回调 */
  onSuccess?: () => void;
  /** 未选菜单时禁用操作列按钮 */
  actionsDisabled?: boolean;
}

/**
 * 构建页面按钮表格列（含状态开关、编辑/删除）。
 *
 * @param props - 列行为依赖的回调与权限上下文
 * @returns antd Table `columns`
 */
export function useButtonTableColumns(props: UseButtonTableColumnsProps) {
  const { modal } = App.useApp();
  const { openModal, onSuccess, actionsDisabled = false } = props;
  const { canUpdate, canDelete, canToggleStatus } = useButtonPermissions();
  const { deleteButton, toggleStatus } = useButtonActions({ currentRow: null, onSuccess });

  const columns: ColumnsType<PageButtonModel> = [
    { title: '按钮编码', dataIndex: 'code', key: 'code', width: 140, ellipsis: true },
    { title: '按钮名称', dataIndex: 'name', key: 'name', width: 140, ellipsis: true },
    { title: '权限标识', dataIndex: 'permCode', key: 'permCode', width: 160, ellipsis: true },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 80,
      align: 'center',
      sorter: (a, b) => (a.sort ?? 0) - (b.sort ?? 0),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 90,
      render: (_: boolean, record: PageButtonModel) => (
        <Switch
          size="small"
          checked={!!record.status}
          checkedChildren="启用"
          unCheckedChildren="禁用"
          disabled={actionsDisabled || !canToggleStatus}
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
      render: (_: unknown, record: PageButtonModel) => (
        <div className={TABLE_ACTION_CELL_CLASSNAME}>
          <Button
            type="link"
            size="small"
            disabled={actionsDisabled || !canUpdate}
            icon={<EditOutlined className="text-(--ant-color-primary)!" />}
            onClick={() => openModal('edit', record)}
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
                  content: '您没有删除按钮的权限，请联系管理员获取相应权限。',
                });
                return;
              }
              modal.confirm({
                title: '删除按钮',
                icon: <ExclamationCircleFilled />,
                content: `确定删除按钮「${record.name}」吗？`,
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
