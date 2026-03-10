import React from 'react';
import { Form, Switch, Radio, InputNumber, Alert, Divider } from 'antd';
import type { ComponentConfigProps } from './index';

/**
 * JSON编辑器组件配置
 */
const JSONConfig: React.FC<ComponentConfigProps> = ({ value = {}, onChange }) => {
  const [form] = Form.useForm();

  // 处理配置变更
  const handleChange = (changedValues: any) => {
    const newConfig = { ...value, ...changedValues };
    onChange(newConfig);
  };

  // 初始化表单值
  React.useEffect(() => {
    form.setFieldsValue(value);
  }, [value, form]);

  return (
    <div>
      <Alert
        message="JSON编辑器配置说明"
        description="配置JSON数据的编辑方式，支持表单模式（结构化编辑）和编辑器模式（自由编辑）"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onValuesChange={handleChange}
        initialValues={{
          editorMode: 'form', // 默认表单模式
          showLineNumbers: true, // 显示行号
          showMinimap: false, // 不显示小地图
          height: 400, // 编辑器高度
          theme: 'vs', // 主题
          formatOnSave: true, // 保存时格式化
          validateOnChange: true, // 实时验证
          allowEmpty: false, // 是否允许空值
          defaultExpanded: true, // 表单模式：默认展开
          enableAddDelete: true, // 是否允许添加/删除
        }}
      >
        {/* 编辑模式选择 */}
        <Form.Item
          name="editorMode"
          label="编辑模式"
          tooltip="选择JSON数据的编辑方式"
          rules={[{ required: true, message: '请选择编辑模式' }]}
        >
          <Radio.Group>
            <Radio.Button value="form">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>📝 表单模式</span>
            </Radio.Button>
            <Radio.Button value="editor">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>💻 编辑器模式</span>
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => prevValues.editorMode !== currentValues.editorMode}
        >
          {({ getFieldValue }) => {
            const editorMode = getFieldValue('editorMode');

            return (
              <>
                <Divider orientation="left" plain>
                  {editorMode === 'form' ? '表单模式配置' : '编辑器模式配置'}
                </Divider>

                {editorMode === 'form' ? (
                  // 表单模式配置
                  <>
                    <Form.Item
                      name="defaultExpanded"
                      label="默认展开"
                      valuePropName="checked"
                      tooltip="是否默认展开所有JSON节点"
                    >
                      <Switch checkedChildren="展开" unCheckedChildren="折叠" />
                    </Form.Item>

                    <Form.Item
                      name="allowEmpty"
                      label="允许空值"
                      valuePropName="checked"
                      tooltip="是否允许JSON对象或数组为空"
                    >
                      <Switch checkedChildren="允许" unCheckedChildren="不允许" />
                    </Form.Item>

                    <Form.Item
                      name="showTypeLabel"
                      label="显示类型标签"
                      valuePropName="checked"
                      tooltip="是否在表单中显示字段类型（string、number等）"
                    >
                      <Switch checkedChildren="显示" unCheckedChildren="隐藏" />
                    </Form.Item>

                    <Form.Item
                      name="enableAddDelete"
                      label="允许添加/删除"
                      valuePropName="checked"
                      tooltip="是否允许在表单中添加或删除字段"
                    >
                      <Switch checkedChildren="允许" unCheckedChildren="禁止" />
                    </Form.Item>
                  </>
                ) : (
                  // 编辑器模式配置
                  <>
                    <Form.Item name="height" label="编辑器高度" tooltip="CodeEditor的高度（像素）">
                      <InputNumber min={200} max={800} step={50} style={{ width: '100%' }} addonAfter="px" />
                    </Form.Item>

                    <Form.Item name="theme" label="编辑器主题" tooltip="CodeEditor的主题样式">
                      <Radio.Group>
                        <Radio value="vs">明亮主题</Radio>
                        <Radio value="vs-dark">暗黑主题</Radio>
                      </Radio.Group>
                    </Form.Item>

                    <Form.Item
                      name="showLineNumbers"
                      label="显示行号"
                      valuePropName="checked"
                      tooltip="是否显示代码行号"
                    >
                      <Switch checkedChildren="显示" unCheckedChildren="隐藏" />
                    </Form.Item>

                    <Form.Item
                      name="showMinimap"
                      label="显示小地图"
                      valuePropName="checked"
                      tooltip="是否显示代码小地图（右侧预览）"
                    >
                      <Switch checkedChildren="显示" unCheckedChildren="隐藏" />
                    </Form.Item>

                    <Form.Item
                      name="formatOnSave"
                      label="保存时格式化"
                      valuePropName="checked"
                      tooltip="保存时自动格式化JSON代码"
                    >
                      <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                    </Form.Item>

                    <Form.Item
                      name="validateOnChange"
                      label="实时验证"
                      valuePropName="checked"
                      tooltip="编辑时实时验证JSON格式"
                    >
                      <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                    </Form.Item>
                  </>
                )}

                {/* 通用配置 */}
                <Divider orientation="left" plain>
                  通用配置
                </Divider>

                <Form.Item name="placeholder" label="占位符提示" tooltip="输入框为空时的提示文本">
                  <Radio.Group>
                    <Radio value="">无提示</Radio>
                    <Radio value="请输入JSON数据">请输入JSON数据</Radio>
                    <Radio value="请输入有效的JSON格式">请输入有效的JSON格式</Radio>
                  </Radio.Group>
                </Form.Item>

                <Form.Item name="disabled" label="禁用状态" valuePropName="checked" tooltip="是否禁用JSON编辑器">
                  <Switch checkedChildren="禁用" unCheckedChildren="启用" />
                </Form.Item>
              </>
            );
          }}
        </Form.Item>
      </Form>

      {/* 配置预览 */}
      <Alert
        message="当前配置预览"
        description={<pre style={{ margin: 0, fontSize: '12px' }}>{JSON.stringify(value, null, 2)}</pre>}
        type="success"
        style={{ marginTop: 16 }}
      />
    </div>
  );
};

export default JSONConfig;
