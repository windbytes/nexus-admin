import type React from 'react';
import { memo } from 'react';
import { Form, Input, Button, Card, Select } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { PARAMETER_TYPES } from '@/services/resource/webservice/webServiceApi';

const { TextArea } = Input;

interface ManualWsdlEditorProps {
  disabled: boolean;
}

/**
 * 手动WSDL编辑器组件
 */
const ManualWsdlEditor: React.FC<ManualWsdlEditorProps> = memo(({ disabled }) => {
  return (
    <div className="space-y-4">
      {/* 基本信息 */}
      <Form.Item
        name="namespace"
        label="命名空间"
        rules={[{ required: true, message: '请输入命名空间' }]}
      >
        <Input placeholder="例如：http://example.com/services" disabled={disabled} />
      </Form.Item>

      <Form.Item name="serviceAnnotation" label="服务注解">
        <TextArea
          placeholder="请输入服务注解/描述"
          rows={2}
          maxLength={500}
          showCount
          disabled={disabled}
        />
      </Form.Item>

      {/* 操作列表 */}
      <Form.Item label="操作列表" required>
        <Form.List
          name="operations"
          rules={[
            {
              validator: async (_, operations) => {
                if (!operations || operations.length === 0) {
                  return Promise.reject(new Error('至少添加一个操作'));
                }
              },
            },
          ]}
        >
          {(fields, { add, remove }) => (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card
                  key={`operation-${field.key}`}
                  size="small"
                  title={`操作 ${index + 1}`}
                  extra={
                    !disabled && (
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(field.name)}
                      >
                        删除
                      </Button>
                    )
                  }
                  classNames={{
                    header: 'bg-gray-100!',
                  }}
                  className="bg-gray-50 mb-4!"
                >
                  <div className="space-y-3">
                    {/* 操作名称 */}
                    <Form.Item
                      name={[field.name, 'name']}
                      label="操作名称"
                      rules={[{ required: true, message: '请输入操作名称' }]}
                      className="mb-0"
                    >
                      <Input placeholder="例如：getUserInfo" disabled={disabled} />
                    </Form.Item>

                    {/* 操作注解 */}
                    <Form.Item
                      name={[field.name, 'annotation']}
                      label="操作注解"
                      className="mb-0"
                    >
                      <Input
                        placeholder="请输入操作注解"
                        disabled={disabled}
                      />
                    </Form.Item>

                    {/* 输入参数 */}
                    <div className="border-t border-gray-200 pt-3">
                      <div className="font-medium mb-2 text-sm">输入参数</div>
                      <Form.List name={[field.name, 'inputParameters']}>
                        {(paramFields, { add: addParam, remove: removeParam }) => (
                          <div className="space-y-2">
                            {paramFields.map((paramField) => (
                              <div key={`input-${field.key}-${paramField.key}`} className="flex gap-2">
                                <Form.Item
                                  name={[paramField.name, 'name']}
                                  className="mb-0 flex-1"
                                  rules={[{ required: true, message: '参数名称必填' }]}
                                >
                                  <Input placeholder="参数名称" disabled={disabled} />
                                </Form.Item>
                                <Form.Item
                                  name={[paramField.name, 'type']}
                                  className="mb-0"
                                  style={{ width: '140px' }}
                                  rules={[{ required: true, message: '类型必填' }]}
                                >
                                  <Select
                                    placeholder="类型"
                                    options={PARAMETER_TYPES}
                                    disabled={disabled}
                                  />
                                </Form.Item>
                                <Form.Item
                                  name={[paramField.name, 'description']}
                                  className="mb-0 flex-1"
                                >
                                  <Input placeholder="描述" disabled={disabled} />
                                </Form.Item>
                                {!disabled && (
                                  <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => removeParam(paramField.name)}
                                  />
                                )}
                              </div>
                            ))}
                            {!disabled && (
                              <Button
                                type="dashed"
                                icon={<PlusOutlined />}
                                onClick={() => addParam()}
                                block
                              >
                                添加输入参数
                              </Button>
                            )}
                          </div>
                        )}
                      </Form.List>
                    </div>

                    {/* 输出参数 */}
                    <div className="border-t border-gray-200 pt-3">
                      <div className="font-medium mb-2 text-sm">输出参数</div>
                      <Form.List name={[field.name, 'outputParameters']}>
                        {(paramFields, { add: addParam, remove: removeParam }) => (
                          <div className="space-y-2">
                            {paramFields.map((paramField) => (
                              <div key={`output-${field.key}-${paramField.key}`} className="flex gap-2">
                                <Form.Item
                                  name={[paramField.name, 'name']}
                                  className="mb-0 flex-1"
                                  rules={[{ required: true, message: '参数名称必填' }]}
                                >
                                  <Input placeholder="参数名称" disabled={disabled} />
                                </Form.Item>
                                <Form.Item
                                  name={[paramField.name, 'type']}
                                  className="mb-0"
                                  style={{ width: '140px' }}
                                  rules={[{ required: true, message: '类型必填' }]}
                                >
                                  <Select
                                    placeholder="类型"
                                    options={PARAMETER_TYPES}
                                    disabled={disabled}
                                  />
                                </Form.Item>
                                <Form.Item
                                  name={[paramField.name, 'description']}
                                  className="mb-0 flex-1"
                                >
                                  <Input placeholder="描述" disabled={disabled} />
                                </Form.Item>
                                {!disabled && (
                                  <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => removeParam(paramField.name)}
                                  />
                                )}
                              </div>
                            ))}
                            {!disabled && (
                              <Button
                                type="dashed"
                                icon={<PlusOutlined />}
                                onClick={() => addParam()}
                                block
                              >
                                添加输出参数
                              </Button>
                            )}
                          </div>
                        )}
                      </Form.List>
                    </div>
                  </div>
                </Card>
              ))}
              {!disabled && (
                <Button type="dashed" className='mt-4' icon={<PlusOutlined />} onClick={() => add()} block>
                  添加操作
                </Button>
              )}
            </div>
          )}
        </Form.List>
      </Form.Item>
    </div>
  );
});

ManualWsdlEditor.displayName = 'ManualWsdlEditor';

export default ManualWsdlEditor;

