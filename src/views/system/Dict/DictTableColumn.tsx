import { useTranslation } from 'react-i18next';
import type { UseMutationResult } from '@tanstack/react-query';
import { EditOutlined, DeleteOutlined, ExclamationCircleFilled, MoreOutlined } from '@ant-design/icons';
import { type TableProps, App, Button, Dropdown, Space } from 'antd';
import { useCallback } from 'react';

// 定义表格列方法获取属性
interface DictTableColumnProps {
  dispatch: React.Dispatch<Partial<any>>;
  logicDeleteUserMutation: UseMutationResult<any, any, any, unknown>;
}

// 定义表格列
const getDictTableColumns = ({ dispatch, logicDeleteUserMutation }: DictTableColumnProps): TableProps['columns'] => {
  const { modal } = App.useApp();
  const { t } = useTranslation();

  // 更多操作
  const more = useCallback(
    (row: any) => [
      {
        key: 'edit',
        label: t('common.operation.edit'),
        icon: <EditOutlined className="text-orange-400" />,
        onClick: () => {
          dispatch({
            openEditModal: true,
            currentRow: row,
            action: 'edit',
          });
        },
      },
      {
        key: 'delete',
        label: t('common.operation.delete'),
        icon: <DeleteOutlined className="text-red-400" />,
        onClick: () => {
          modal.confirm({
            title: '删除字典',
            icon: <ExclamationCircleFilled />,
            content: '确定删除该字典吗？数据删除后将无法恢复！',
            onOk() {
              logicDeleteUserMutation.mutate([row.id]);
            },
          });
        },
      },
    ],
    []
  );

  /**
   * 表格列配置
   */
  const columns: TableProps['columns'] = [
    {
      title: '编码',
      dataIndex: 'code',
      width: 200,
    },
    {
      title: '名称',
      dataIndex: 'name',
      width: 200,
    },
    {
      title: '描述',
      dataIndex: 'description',
      width: 200,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render(_, record) {
        return (
          <Space size={8}>
            <Button
              type="link"
              size="small"
              onClick={() => {
                dispatch({
                  openEditModal: true,
                  currentRow: record,
                  action: 'view',
                });
              }}
            >
              {t('common.operation.detail')}
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => {
                dispatch({
                  openEditModal: false,
                  currentRow: record,
                  action: 'user',
                  openRoleUserModal: true,
                });
              }}
            >
              {t('common.operation.edit')}
            </Button>
            <Dropdown menu={{ items: more(record) }} placement="bottom" trigger={['click']}>
              <Button type="link" size="small" icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  return columns;
};
export default getDictTableColumns;
