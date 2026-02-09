import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { FormListFieldData } from 'antd';
import { Button, Form, Input, InputNumber, Select, Switch, Table } from 'antd';
import { memo } from 'react';
import type { DictColumnRecord } from '@/services/system/dict/type.d';
import { COLUMN_DATA_TYPE_OPTIONS } from '../../constants';

interface ColumnMappingEditableTableProps {
  disabled?: boolean;
}

/**
 * 列映射可编辑表格（仅 SQL/API 类型显示）
 * 基于 antd Table + Form.List，所有列直接可编辑，支持新增/删除行
 */
const ColumnMappingEditableTable: React.FC<ColumnMappingEditableTableProps> = ({ disabled }) => {
  return (
    <Form.List name="columns">
      {(fields, { add, remove }) => (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">共 {fields.length} 列</span>
            {!disabled && (
              <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={() => add(defaultColumnRow())}>
                新增列
              </Button>
            )}
          </div>
          <Table
            size="small"
            rowKey="key"
            pagination={false}
            scroll={{ x: 900 }}
            dataSource={fields}
            columns={[
              {
                title: '列键名',
                dataIndex: 'columnKey',
                width: 120,
                render: (_: unknown, field: FormListFieldData) => (
                  <Form.Item name={[field.name, 'columnKey']} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                    <Input placeholder="如 code" disabled={disabled} />
                  </Form.Item>
                ),
              },
              {
                title: '显示名',
                width: 100,
                render: (_: unknown, field: FormListFieldData) => (
                  <Form.Item name={[field.name, 'columnName']} style={{ marginBottom: 0 }}>
                    <Input placeholder="选填" disabled={disabled} />
                  </Form.Item>
                ),
              },
              {
                title: '数据类型',
                width: 100,
                render: (_: unknown, field: FormListFieldData) => (
                  <Form.Item name={[field.name, 'dataType']} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                    <Select
                      placeholder="选择"
                      size="small"
                      options={COLUMN_DATA_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
                      disabled={disabled}
                    />
                  </Form.Item>
                ),
              },
              {
                title: '数据源字段',
                width: 120,
                render: (_: unknown, field: FormListFieldData) => (
                  <Form.Item name={[field.name, 'sourceField']} style={{ marginBottom: 0 }}>
                    <Input placeholder="SQL/API 字段名" disabled={disabled} />
                  </Form.Item>
                ),
              },
              {
                title: '主键',
                width: 64,
                align: 'center',
                render: (_: unknown, field: FormListFieldData) => (
                  <Form.Item name={[field.name, 'isPrimary']} valuePropName="checked" style={{ marginBottom: 0 }}>
                    <Switch size="small" disabled={disabled} />
                  </Form.Item>
                ),
              },
              {
                title: '展示列',
                width: 64,
                align: 'center',
                render: (_: unknown, field: FormListFieldData) => (
                  <Form.Item name={[field.name, 'isLabel']} valuePropName="checked" style={{ marginBottom: 0 }}>
                    <Switch size="small" disabled={disabled} />
                  </Form.Item>
                ),
              },
              {
                title: '可排序',
                width: 64,
                align: 'center',
                render: (_: unknown, field: FormListFieldData) => (
                  <Form.Item name={[field.name, 'sortable']} valuePropName="checked" style={{ marginBottom: 0 }}>
                    <Switch size="small" disabled={disabled} />
                  </Form.Item>
                ),
              },
              {
                title: '可检索',
                width: 64,
                align: 'center',
                render: (_: unknown, field: FormListFieldData) => (
                  <Form.Item name={[field.name, 'searchable']} valuePropName="checked" style={{ marginBottom: 0 }}>
                    <Switch size="small" disabled={disabled} />
                  </Form.Item>
                ),
              },
              {
                title: '顺序',
                width: 72,
                render: (_: unknown, field: FormListFieldData) => (
                  <Form.Item name={[field.name, 'orderIndex']} style={{ marginBottom: 0 }}>
                    <InputNumber min={0} size="small" className="w-full" disabled={disabled} />
                  </Form.Item>
                ),
              },
              ...(disabled
                ? []
                : [
                    {
                      title: '操作',
                      width: 56,
                      fixed: 'right' as const,
                      render: (_: unknown, field: FormListFieldData) => (
                        <Button
                          type="link"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(field.name)}
                        />
                      ),
                    },
                  ]),
            ]}
          />
        </div>
      )}
    </Form.List>
  );
};

function defaultColumnRow(): Partial<DictColumnRecord> {
  return {
    columnKey: '',
    dataType: 'string',
    isPrimary: false,
    isLabel: false,
    sortable: false,
    searchable: false,
    orderIndex: 0,
  };
}

export default memo(ColumnMappingEditableTable);
