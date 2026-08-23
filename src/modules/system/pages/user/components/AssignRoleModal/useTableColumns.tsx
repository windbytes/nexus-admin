import type { TableColumnsType } from 'antd';
import { Tag } from 'antd';
import { useMemo } from 'react';
import type { TransferItem } from './useTransferData';

/**
 * 获取表格列配置（左侧与右侧角色表格）。
 *
 * @returns 左右两侧表格列
 */
export const useTableColumns = () => {
  // 左侧表格列（显示所有角色）
  const leftColumns: TableColumnsType<TransferItem> = useMemo(
    () => [
      {
        title: '角色编码',
        dataIndex: 'roleCode',
        key: 'roleCode',
        width: 80,
      },
      {
        title: '角色名称',
        dataIndex: 'roleName',
        key: 'roleName',
        width: 120,
      },
      {
        title: '角色类型',
        dataIndex: 'roleType',
        key: 'roleType',
        width: 80,
        align: 'center',
        render: (value: string | number) => {
          const typeMap: Record<string | number, { text: string; color: string }> = {
            0: { text: '系统角色', color: 'red' },
            1: { text: '普通角色', color: 'blue' },
          };
          const type = typeMap[value] || { text: '未知', color: 'default' };
          return <Tag color={type.color}>{type.text}</Tag>;
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 80,
        align: 'center',
        render: (value: boolean) => <Tag color={value ? 'success' : 'error'}>{value ? '启用' : '禁用'}</Tag>,
      },
    ],
    []
  );

  // 右侧表格列（显示已分配的角色）
  const rightColumns: TableColumnsType<TransferItem> = useMemo(
    () => [
      {
        title: '角色编码',
        dataIndex: 'roleCode',
        key: 'roleCode',
        width: 80,
      },
      {
        title: '角色名称',
        dataIndex: 'roleName',
        key: 'roleName',
        width: 120,
      },
      {
        title: '角色类型',
        dataIndex: 'roleType',
        key: 'roleType',
        width: 80,
        align: 'center',
        render: (value: string | number) => {
          const typeMap: Record<string | number, { text: string; color: string }> = {
            0: { text: '系统角色', color: 'red' },
            1: { text: '普通角色', color: 'blue' },
          };
          const type = typeMap[value] || { text: '未知', color: 'default' };
          return <Tag color={type.color}>{type.text}</Tag>;
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 80,
        align: 'center',
        render: (value: boolean) => <Tag color={value ? 'success' : 'error'}>{value ? '启用' : '禁用'}</Tag>,
      },
    ],
    []
  );

  return { leftColumns, rightColumns };
};
