import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Space, Typography } from 'antd';
import React from 'react';

const { Text } = Typography;

/**
 * JSON 动态表单组件
 * 用于结构化编辑 JSON 数据
 * 使用 Form.List 实现动态字段管理
 */
const JSONDynamicForm: React.FC<{
  properties?: any;
}> = ({ properties = {} }) => {
  return (
    <Card size="small" style={{ margin: 0 }}>
      <Text strong>JSON 数据编辑</Text>

      <Form.List name="fields">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Card key={key} size="small" style={{ marginBottom: 8 }}>
                <Space style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                  <Form.Item
                    {...restField}
                    name={[name, 'key']}
                    rules={[{ required: true, message: '请输入字段名' }]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input placeholder="字段名" disabled={properties.disabled} style={{ width: 120 }} />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'value']}
                    rules={[
                      {
                        validator: (_, value) => {
                          if (
                            properties.allowEmpty === false &&
                            (value === '' || value === null || value === undefined)
                          ) {
                            return Promise.reject(new Error('此字段不能为空'));
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                    style={{ marginBottom: 0, flex: 1 }}
                  >
                    <Input placeholder="请输入值" disabled={properties.disabled} />
                  </Form.Item>
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => remove(name)}
                    disabled={properties.disabled}
                  />
                </Space>
              </Card>
            ))}

            {fields.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                暂无数据，点击"添加字段"开始编辑
              </div>
            )}

            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} disabled={properties.disabled}>
                添加字段
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </Card>
  );
};

export default JSONDynamicForm;
