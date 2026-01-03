import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import { Button, Space, Switch, Table, Tag, Tooltip } from 'antd';
import type React from 'react';
import { usePermission } from '@/hooks/usePermission';
import useTableScroll from '@/hooks/useTableScroll';
import type { SysParam } from '@/services/system/params';
import { CATEGORY_OPTIONS, DATA_TYPE_OPTIONS } from '@/services/system/params';
import '@/styles/table.full.scss';
interface ParamTableProps {
  data: SysParam[];
  loading: boolean;
  selectedRowKeys: React.Key[];
  onSelectionChange: (selectedRowKeys: React.Key[], selectedRows: SysParam[]) => void;
  onEdit: (record: SysParam) => void;
  onDelete: (record: SysParam) => void;
  onStatusChange: (record: SysParam, checked: boolean) => void;
  pagination?: TableProps<SysParam>['pagination'];
}

/**
 * 参数表格
 * @param data 数据
 * @param loading 加载状态
 * @param selectedRowKeys 选中行
 * @param onSelectionChange 选择行
 * @param onEdit 编辑
 * @param onDelete 删除
 * @param onStatusChange 状态改变
 * @param pagination 分页
 * @returns
 */
const ParamTable: React.FC<ParamTableProps> = ({
  data,
  loading,
  selectedRowKeys,
  onSelectionChange,
  onEdit,
  onDelete,
  onStatusChange,
  pagination,
}) => {
  // 权限判定
  const canEdit = usePermission(['param:edit']);
  const canDelete = usePermission(['param:delete']);
  const canChangeStatus = usePermission(['param:edit']);
  // 表格滚动配置
  const { scrollConfig, tableWrapperRef } = useTableScroll();

  // 获取数据类型标签
  const getDataTypeLabel = (value: string) => {
    const option = DATA_TYPE_OPTIONS.find((item) => item.value === value);
    return option?.label || value;
  };

  // 获取分类标签
  const getCategoryLabel = (value: string) => {
    const option = CATEGORY_OPTIONS.find((item) => item.value === value);
    return option?.label || value;
  };

  // 表格列配置
  const columns: TableProps<SysParam>['columns'] = [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
      fixed: 'left',
      width: 80,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: '参数名称',
      dataIndex: 'name',
      key: 'name',
      width: 160,
      fixed: 'left',
      ellipsis: true,
    },
    {
      title: '参数标识',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      ellipsis: true,
    },
    {
      title: '参数内容',
      dataIndex: 'value',
      key: 'value',
      width: 200,
      ellipsis: true,
      render: (value: string) => value || '-',
    },
    {
      title: '参数分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      align: 'center',
      render: (value: string) => <Tag color="blue">{getCategoryLabel(value)}</Tag>,
    },
    {
      title: '数据类型',
      dataIndex: 'dataType',
      key: 'dataType',
      width: 100,
      render: (value: string) => <Tag color="green">{getDataTypeLabel(value)}</Tag>,
    },
    {
      title: '必填',
      dataIndex: 'required',
      key: 'required',
      align: 'center',
      width: 80,
      render: (value: boolean) => <Tag color={value ? 'red' : 'default'}>{value ? '是' : '否'}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 100,
      render: (value: boolean, record: SysParam) =>
        canChangeStatus ? (
          <Switch
            checked={value}
            onChange={(checked) => onStatusChange(record, checked)}
            checkedChildren="启用"
            unCheckedChildren="禁用"
          />
        ) : (
          <Tag color={value ? 'green' : 'red'}>{value ? '启用' : '禁用'}</Tag>
        ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      align: 'center',
      width: 180,
      render: (value: string) => {
        if (!value) {
          return '-';
        }
        return new Date(value).toLocaleString('zh-CN');
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      align: 'center',
      fixed: 'right',
      render: (_: any, record: SysParam) => (
        <Space size="small">
          {canEdit && (
            <Tooltip title="编辑">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => onEdit(record)}
                className="text-blue-500 hover:text-blue-600"
              />
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title="删除">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => onDelete(record)}
                className="text-red-500 hover:text-red-600"
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectionChange,
  };

  return (
    <div className="grow min-h-0 min-w-0" ref={tableWrapperRef}>
      <Table
        bordered
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        rowSelection={rowSelection}
        pagination={pagination}
        scroll={{ x: '100%', y: scrollConfig.y }}
        classNames={{
          root: 'full-height-table',
        }}
      />
    </div>
  );
};

export default ParamTable;
