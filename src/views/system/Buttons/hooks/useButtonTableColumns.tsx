import { ExclamationCircleFilled } from '@ant-design/icons';
import { App, Button, Switch } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { PageButtonModel } from '@/services/system/pageButton/type';
import type { ButtonModalType } from '../types';
import { useButtonActions } from './useButtonActions';

interface UseButtonTableColumnsProps {
  openModal: (name: ButtonModalType, record?: Partial<PageButtonModel>) => void;
  onSuccess?: () => void;
  /** 未选菜单时禁用操作列按钮 */
  actionsDisabled?: boolean;
}

/**
 * 页面按钮表格列配置
 */
export const useButtonTableColumns = (props: UseButtonTableColumnsProps) => {
  const { modal } = App.useApp();
  const { openModal, onSuccess, actionsDisabled = false } = props;
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
      sorter: (a, b) => (a.sort ?? 0) - (b.sort ?? 0),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (_: boolean, record: PageButtonModel) => (
        <Switch
          size="small"
          checked={!!record.status}
          checkedChildren="启用"
          unCheckedChildren="禁用"
          disabled={actionsDisabled}
          onChange={(checked) => toggleStatus(record.id, checked)}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_: unknown, record: PageButtonModel) => (
        <div className="flex gap-1">
          <Button type="link" size="small" disabled={actionsDisabled} onClick={() => openModal('edit', record)}>
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            disabled={actionsDisabled}
            onClick={() => {
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
};
