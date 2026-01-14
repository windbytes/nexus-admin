import type { TableColumnsType } from 'antd';
import { Tag } from 'antd';
import type { PermissionTransferItem } from './useTransferData';

/**
 * 获取表格列配置
 * @returns 左侧和右侧表格列配置
 */
export const useTableColumns = () => {
  // 左侧表格列（显示所有权限点）
  const leftColumns: TableColumnsType<PermissionTransferItem> = [
    {
      title: '权限编码',
      dataIndex: 'permCode',
      key: 'permCode',
      width: 150,
    },
    {
      title: '权限名称',
      dataIndex: 'permName',
      key: 'permName',
      width: 180,
    },
    {
      title: '权限类型',
      dataIndex: 'permType',
      key: 'permType',
      width: 100,
      align: 'center',
      render: (value: 'ACTION' | 'DATA') => {
        const typeMap: Record<'ACTION' | 'DATA', { text: string; color: string }> = {
          ACTION: { text: '操作权限', color: 'blue' },
          DATA: { text: '数据权限', color: 'green' },
        };
        const type = typeMap[value] || { text: '未知', color: 'default' };
        return <Tag color={type.color}>{type.text}</Tag>;
      },
    },
    {
      title: '模块编码',
      dataIndex: 'moduleCode',
      key: 'moduleCode',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      align: 'center',
      render: (value: number) => <Tag color={value === 1 ? 'success' : 'error'}>{value === 1 ? '启用' : '停用'}</Tag>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
  ];

  // 右侧表格列（显示已分配的权限点）
  const rightColumns: TableColumnsType<PermissionTransferItem> = [
    {
      title: '权限编码',
      dataIndex: 'permCode',
      key: 'permCode',
      width: 150,
    },
    {
      title: '权限名称',
      dataIndex: 'permName',
      key: 'permName',
      width: 180,
    },
    {
      title: '权限类型',
      dataIndex: 'permType',
      key: 'permType',
      width: 100,
      align: 'center',
      render: (value: 'ACTION' | 'DATA') => {
        const typeMap: Record<'ACTION' | 'DATA', { text: string; color: string }> = {
          ACTION: { text: '操作权限', color: 'blue' },
          DATA: { text: '数据权限', color: 'green' },
        };
        const type = typeMap[value] || { text: '未知', color: 'default' };
        return <Tag color={type.color}>{type.text}</Tag>;
      },
    },
    {
      title: '模块编码',
      dataIndex: 'moduleCode',
      key: 'moduleCode',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      align: 'center',
      render: (value: number) => <Tag color={value === 1 ? 'success' : 'error'}>{value === 1 ? '启用' : '停用'}</Tag>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
  ];

  return { leftColumns, rightColumns };
};
