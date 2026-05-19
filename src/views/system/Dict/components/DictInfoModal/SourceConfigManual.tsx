import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { FormListFieldData } from 'antd';
import { Button, Form, Input, InputNumber, Switch, Table } from 'antd';
import { memo } from 'react';

interface SourceConfigManualProps {
  disabled?: boolean;
}

/** 手工数据单行结构：data 为 key-value，常用 code/label；orderIndex、enabled */
export interface ManualDataRow {
  id?: string;
  data?: Record<string, unknown>;
  orderIndex?: number;
  enabled?: boolean;
}

function defaultManualRow(): ManualDataRow {
  return {
    data: { code: '', label: '' },
    orderIndex: 0,
    enabled: true,
  };
}

/**
 * 手工维护：说明 + 手工数据可编辑表格（仅 MANUAL 类型显示）
 * 所有单元格直接可编辑，支持新增/删除行
 */
const SourceConfigManual: React.FC<SourceConfigManualProps> = ({ disabled }) => (
  <div className="flex flex-col gap-4">
    <Form.List name="manualData">
      {(fields, { add, remove }) => (
        <div className="flex flex-col gap-2">
          <div className="flex justify-start items-center gap-2">
            <span className="text-sm text-gray-500">共 {fields.length} 条</span>
            {!disabled && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => add(defaultManualRow())}>
                新增行
              </Button>
            )}
          </div>
          <Table
            size="middle"
            bordered
            rowKey="key"
            pagination={false}
            scroll={{ x: 500 }}
            dataSource={fields}
            columns={[
              {
                title: 'code',
                width: 120,
                render: (_: unknown, field: FormListFieldData) => (
                  <Form.Item
                    name={[field.name, 'data', 'code']}
                    rules={[{ required: true, message: '必填' }]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input placeholder="编码" disabled={disabled} />
                  </Form.Item>
                ),
              },
              {
                title: 'label',
                width: 140,
                render: (_: unknown, field: FormListFieldData) => (
                  <Form.Item name={[field.name, 'data', 'label']} style={{ marginBottom: 0 }}>
                    <Input placeholder="显示名" disabled={disabled} />
                  </Form.Item>
                ),
              },
              {
                title: '顺序',
                width: 80,
                align: 'center',
                render: (_: unknown, field: FormListFieldData) => (
                  <div className="flex justify-center">
                    <Form.Item name={[field.name, 'orderIndex']} style={{ marginBottom: 0 }}>
                      <InputNumber min={0} disabled={disabled} />
                    </Form.Item>
                  </div>
                ),
              },
              {
                title: '启用',
                width: 64,
                align: 'center',
                render: (_: unknown, field: FormListFieldData) => (
                  <div className="flex justify-center">
                    <Form.Item name={[field.name, 'enabled']} valuePropName="checked" style={{ marginBottom: 0 }}>
                      <Switch size="small" disabled={disabled} />
                    </Form.Item>
                  </div>
                ),
              },
              ...(disabled
                ? []
                : [
                    {
                      title: '操作',
                      width: 56,
                      align: 'center',
                      fixed: 'right' as const,
                      render: (_: unknown, field: FormListFieldData) => (
                        <div className="flex justify-center">
                          <Button
                            type="link"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(field.name)}
                          />
                        </div>
                      ),
                    },
                  ]),
            ]}
          />
        </div>
      )}
    </Form.List>
  </div>
);

export default memo(SourceConfigManual);
