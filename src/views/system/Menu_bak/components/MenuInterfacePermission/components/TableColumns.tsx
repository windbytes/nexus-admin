import { CheckOutlined, CloseOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, type InputRef, Space, type TableProps, Tag, Tooltip } from 'antd';
import type React from 'react';
import type { InterfacePermission } from '@/services/system/menu/menuApi';
import EditCell from './EditCell';

interface TableColumnsProps {
  state: {
    editingId: string | null;
    editForm: {
      id: string;
      code: string;
      remark: string;
      path: string;
      method: string;
      name: string;
    };
    errors: {
      code?: string;
      remark?: string;
      path?: string;
      method?: string;
      name?: string;
    };
  };
  hasEditPermission: boolean;
  hasDeletePermission: boolean;
  isPending: boolean;
  codeInputRef: React.RefObject<InputRef | null>;
  remarkInputRef: React.RefObject<InputRef | null>;
  onUpdateForm: (
    updates: Partial<{ code: string; remark: string; path: string; method: string; name: string }>
  ) => void;
  onConfirmEdit: (id: string) => void;
  onCancelEdit: (id: string) => void;
  onEdit: (record: InterfacePermission) => void;
  onDelete: (record: InterfacePermission) => void;
}

/**
 * 表格列定义 Hook
 */
export const useTableColumns = ({
  state,
  hasEditPermission,
  hasDeletePermission,
  isPending,
  codeInputRef,
  remarkInputRef,
  onUpdateForm,
  onConfirmEdit,
  onCancelEdit,
  onEdit,
  onDelete,
}: TableColumnsProps): TableProps<InterfacePermission>['columns'] => {
  return [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center',
      render: (_text: string, _record: InterfacePermission, index: number) => index + 1,
    },
    {
      title: '权限标识',
      dataIndex: 'code',
      width: 220,
      key: 'code',
      render: (text: string, record: InterfacePermission) => {
        if (state.editingId === record.id) {
          return (
            <EditCell
              value={state.editForm.code}
              error={state.errors.code}
              inputRef={codeInputRef}
              placeholder="请输入权限标识"
              onChange={(value) => onUpdateForm({ code: value })}
            />
          );
        }
        return <Tag color="blue">{text}</Tag>;
      },
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: InterfacePermission) => {
        if (state.editingId === record.id) {
          return (
            <EditCell
              value={state.editForm.name}
              error={state.errors.name}
              placeholder="请输入名称"
              onChange={(value) => onUpdateForm({ name: value })}
            />
          );
        }
        return <Tag color="blue">{text}</Tag>;
      },
    },
    {
      title: '路径',
      dataIndex: 'path',
      key: 'path',
      render: (text: string, record: InterfacePermission) => {
        if (state.editingId === record.id) {
          return (
            <EditCell
              value={state.editForm.path}
              error={state.errors.path}
              placeholder="请输入路径"
              onChange={(value) => onUpdateForm({ path: value })}
            />
          );
        }
        return <Tag color="blue">{text}</Tag>;
      },
    },
    {
      title: '方法',
      dataIndex: 'method',
      width: 100,
      align: 'center',
      key: 'method',
      render: (text: string, record: InterfacePermission) => {
        if (state.editingId === record.id) {
          return (
            <EditCell
              value={state.editForm.method}
              error={state.errors.method}
              placeholder="请选择方法"
              type="select"
              options={[
                { label: 'GET', value: 'GET' },
                { label: 'POST', value: 'POST' },
                { label: 'PUT', value: 'PUT' },
                { label: 'DELETE', value: 'DELETE' },
              ]}
              onChange={(value) => onUpdateForm({ method: value })}
            />
          );
        }
        return <Tag color="blue">{text}</Tag>;
      },
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
      render: (text: string, record: InterfacePermission) => {
        if (state.editingId === record.id) {
          return (
            <EditCell
              value={state.editForm.remark}
              error={state.errors.remark}
              inputRef={remarkInputRef}
              placeholder="请输入备注"
              onChange={(value) => onUpdateForm({ remark: value })}
            />
          );
        }
        return text;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_text: string, record: InterfacePermission) => {
        if (state.editingId === record.id) {
          return (
            <Space size="small">
              <Tooltip title="确定">
                <Button
                  type="link"
                  icon={<CheckOutlined />}
                  size="small"
                  onClick={() => onConfirmEdit(record.id)}
                  style={{ color: '#52c41a' }}
                  loading={isPending}
                />
              </Tooltip>
              <Tooltip title="取消">
                <Button
                  type="link"
                  icon={<CloseOutlined />}
                  size="small"
                  onClick={() => onCancelEdit(record.id)}
                  style={{ color: '#ff4d4f' }}
                />
              </Tooltip>
            </Space>
          );
        }

        return (
          <Space size="small">
            {hasEditPermission && (
              <Tooltip title="编辑">
                <Button type="link" icon={<EditOutlined />} size="small" onClick={() => onEdit(record)} />
              </Tooltip>
            )}
            {hasDeletePermission && (
              <Tooltip title="删除">
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                  onClick={() => onDelete(record)}
                  loading={isPending}
                />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];
};
