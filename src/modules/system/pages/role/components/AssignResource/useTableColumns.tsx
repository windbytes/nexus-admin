/**
 * @file 授权资源穿梭框表格列
 */

import type { TableColumnsType } from 'antd';
import { Tag } from 'antd';
import type { PermissionTransferItem } from './useTransferData';

/**
 * 获取穿梭框左右表格列配置。
 *
 * @returns 表格列
 */
export function useTableColumns() {
  const columns: TableColumnsType<PermissionTransferItem> = [
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
      dataIndex: 'resourceType',
      key: 'resourceType',
      width: 100,
      align: 'center',
      render: (value: number) => {
        return (
          <Tag variant="solid" color={value === 1 ? 'blue' : value === 2 ? 'green' : 'orange'}>
            {value === 1 ? '按钮' : value === 2 ? '接口' : '其他'}
          </Tag>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      align: 'center',
      render: (value: boolean) => (
        <Tag variant="solid" color={value ? 'success' : 'error'}>
          {value ? '启用' : '停用'}
        </Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
  ];

  return columns;
}
