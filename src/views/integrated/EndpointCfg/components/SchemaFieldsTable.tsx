import React, { useState, useCallback, useImperativeHandle } from 'react';
import { Table, Button, Input, Select, Switch, Popconfirm, Space, Form, Tooltip, type TableProps } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, SaveOutlined, CloseOutlined, ArrowUpOutlined, ArrowDownOutlined, SettingOutlined } from '@ant-design/icons';
import type { SchemaField } from '@/services/integrated/endpointConfig/endpointConfigApi';
import { COMPONENT_TYPE_OPTIONS, MODE_OPTIONS } from '@/services/integrated/endpointConfig/endpointConfigApi';
import ComponentConfigModal from './ComponentConfigModal';

const { TextArea } = Input;

export interface SchemaFieldsTableRef {
  /** 取消编辑 */
  cancelEdit: () => void;
}

interface SchemaFieldsTableProps {
  /** 数据源 */
  fields: SchemaField[];
  /** 是否禁用 */
  disabled?: boolean;
  /** 数据变更回调 */
  onChange: (fields: SchemaField[]) => void;
  /** ref 引用 (React 19 支持直接作为 prop) */
  ref?: React.Ref<SchemaFieldsTableRef>;
}

/**
 * Schema字段编辑表格组件（右下）
 * 使用 React.memo 避免不必要的重渲染
 * React 19 支持函数组件直接接收 ref prop
 */
const SchemaFieldsTable: React.FC<SchemaFieldsTableProps> = ({ fields, disabled = false, onChange, ref }) => {
  const [editingKey, setEditingKey] = useState<string>('');
  const [form] = Form.useForm();
  const [isNewRecord, setIsNewRecord] = useState(false);
  
  // 组件配置弹窗状态
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [configModalData, setConfigModalData] = useState<{
    componentType: string;
    properties: any;
    fieldId: string;
  }>({ componentType: '', properties: {}, fieldId: '' });

  /**
   * 是否正在编辑
   */
  const isEditing = (record: SchemaField) => record.id === editingKey;

  /**
   * 开始编辑
   */
  const edit = (record: SchemaField, isNew = false) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.id || '');
    setIsNewRecord(isNew);
  };

  /**
   * 取消编辑
   */
  const cancel = useCallback(() => {
    if (isNewRecord) {
      // 如果是新增记录，删除该记录
      const newData = fields.filter((item) => item.id !== editingKey);
      onChange(newData);
    }
    setEditingKey('');
    setIsNewRecord(false);
  }, [isNewRecord, fields, editingKey, onChange]);

  /**
   * 暴露给父组件的方法
   * React 19 支持直接使用 useImperativeHandle
   */
  useImperativeHandle(ref, () => ({
    cancelEdit: cancel,
  }), [cancel]);

  /**
   * 保存编辑
   */
  const save = async (id: string) => {
    try {
      const row = await form.validateFields();
      const newData = [...fields];
      const index = newData.findIndex((item) => id === item.id);

      if (index > -1) {
        const item = newData[index];
        if (item) {
          // 如果是新增记录，生成新的ID
          const newId = isNewRecord ? `field_${Date.now()}` : item.id;
          newData.splice(index, 1, { ...item, ...row, id: newId });
          onChange(newData);
          setEditingKey('');
          setIsNewRecord(false);
        }
      }
    } catch (errInfo) {
      console.log('验证失败:', errInfo);
    }
  };

  /**
   * 新增字段
   */
  const handleAdd = useCallback(() => {
    const newField: SchemaField = {
      id: `temp_${Date.now()}`,
      field: '',
      label: '',
      component: 'Input',
      required: false,
      sortOrder: fields.length + 1,
      mode: 'IN_OUT',
      properties: {},
    };
    onChange([...fields, newField]);
    setTimeout(() => {
      edit(newField, true); // 标记为新增记录
    }, 100);
  }, [fields, onChange]);

  /**
   * 删除字段
   */
  const handleDelete = useCallback(
    (id: string) => {
      const newData = fields.filter((item) => item.id !== id);
      onChange(newData);
    },
    [fields, onChange]
  );

  /**
   * 上移
   */
  const handleMoveUp = useCallback(
    (index: number) => {
      if (index === 0) return;
      const newData = [...fields];
      const item1 = newData[index - 1];
      const item2 = newData[index];
      if (item1 && item2) {
        [newData[index - 1], newData[index]] = [item2, item1];
        // 更新排序号
        newData.forEach((item, idx) => {
          item.sortOrder = idx + 1;
        });
        onChange(newData);
      }
    },
    [fields, onChange]
  );

  /**
   * 下移
   */
  const handleMoveDown = useCallback(
    (index: number) => {
      if (index === fields.length - 1) return;
      const newData = [...fields];
      const item1 = newData[index];
      const item2 = newData[index + 1];
      if (item1 && item2) {
        [newData[index], newData[index + 1]] = [item2, item1];
        // 更新排序号
        newData.forEach((item, idx) => {
          item.sortOrder = idx + 1;
        });
        onChange(newData);
      }
    },
    [fields, onChange]
  );

  /**
   * 打开组件配置弹窗
   */
  const handleOpenConfig = useCallback((record: SchemaField) => {
    // 如果当前正在编辑这一行，优先使用表单中的组件类型
    let componentType = record.component;
    if (isEditing(record)) {
      const formValues = form.getFieldsValue();
      componentType = formValues.component || record.component;
    }
    
    setConfigModalData({
      componentType,
      properties: record.properties || {},
      fieldId: record.id || '',
    });
    setConfigModalVisible(true);
  }, [form]);

  /**
   * 保存组件配置
   */
  const handleSaveConfig = useCallback((properties: any) => {
    const newData = fields.map(field => {
      if (field.id === configModalData.fieldId) {
        return { ...field, properties };
      }
      return field;
    });
    onChange(newData);
  }, [fields, onChange, configModalData.fieldId]);

  /**
   * 表格列配置
   */
  const columns: TableProps<SchemaField>['columns'] = [
    {
      title: '序号',
      width: 60,
      align: 'center',
      render: (_: any, __: SchemaField, index: number) => index + 1,
    },
    {
      title: '字段名',
      dataIndex: 'field',
      width: 80,
      render: (text: string, record: SchemaField) => {
        if (isEditing(record)) {
          return (
            <Form.Item
              name="field"
              style={{ margin: 0 }}
              rules={[
                { required: true, message: '请输入字段名' },
                {
                  pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
                  message: '字段名必须以字母开头，只能包含字母、数字和下划线',
                },
              ]}
            >
              <Input placeholder="请输入字段名" />
            </Form.Item>
          );
        }
        return text;
      },
    },
    {
      title: '字段标签',
      dataIndex: 'label',
      width: 150,
      render: (text: string, record: SchemaField) => {
        if (isEditing(record)) {
          return (
            <Form.Item
              name="label"
              style={{ margin: 0 }}
              rules={[{ required: true, message: '请输入字段标签' }]}
            >
              <Input placeholder="请输入字段标签" />
            </Form.Item>
          );
        }
        return text;
      },
    },
    {
      title: '组件类型',
      dataIndex: 'component',
      width: 150,
      render: (text: string, record: SchemaField) => {
        if (isEditing(record)) {
          return (
            <Form.Item
              name="component"
              style={{ margin: 0 }}
              rules={[{ required: true, message: '请选择组件类型' }]}
            >
              <Select options={COMPONENT_TYPE_OPTIONS as any} placeholder="请选择组件类型" />
            </Form.Item>
          );
        }
        const option = COMPONENT_TYPE_OPTIONS.find((opt) => opt.value === text);
        return option?.label || text;
      },
    },
    {
      title: '属性配置',
      width: 100,
      align: 'center',
      render: (_: any, record: SchemaField) => {
        const hasProperties = record.properties && Object.keys(record.properties).length > 0;
        
        // 获取当前组件类型（编辑状态下从表单获取）
        let currentComponentType = record.component;
        if (isEditing(record)) {
          const formValues = form.getFieldsValue();
          currentComponentType = formValues.component || record.component;
        }
        
        const tooltipTitle = isEditing(record) 
          ? `配置组件属性 (当前: ${currentComponentType})` 
          : '配置组件属性';
        
        return (
          <Tooltip title={tooltipTitle}>
            <Button
              type="link"
              size="small"
              icon={<SettingOutlined />}
              disabled={(!isEditing(record))}
              onClick={() => handleOpenConfig(record)}
              style={{ 
                color: hasProperties ? '#1890ff' : '#999',
                fontWeight: hasProperties ? 'bold' : 'normal'
              }}
            >
              {hasProperties ? '已配置' : '配置'}
            </Button>
          </Tooltip>
        );
      },
    },
    {
      title: '是否必填',
      dataIndex: 'required',
      width: 80,
      align: 'center' ,
      render: (checked: boolean, record: SchemaField) => {
        if (isEditing(record)) {
          return (
            <Form.Item name="required" valuePropName="checked" style={{ margin: 0 }}>
              <Switch />
            </Form.Item>
          );
        }
        return <Switch checked={checked} disabled />;
      },
    },
    {
      title: '默认值',
      dataIndex: 'defaultValue',
      width: 120,
      render: (text: any, record: SchemaField) => {
        if (isEditing(record)) {
          return (
            <Form.Item name="defaultValue" style={{ margin: 0 }}>
              <Input placeholder="默认值" />
            </Form.Item>
          );
        }
        return text || '-';
      },
    },
    {
      title: '作用模式',
      dataIndex: 'mode',
      width: 120,
      render: (text: string, record: SchemaField) => {
        if (isEditing(record)) {
          return (
            <Form.Item name="mode" style={{ margin: 0 }}>
              <Select options={MODE_OPTIONS as any} placeholder="请选择作用模式" />
            </Form.Item>
          );
        }
        return text || '-';
      },
    },
    {
      title: '说明',
      dataIndex: 'description',
      ellipsis: true,
      render: (text: string, record: SchemaField) => {
        if (isEditing(record)) {
          return (
            <Form.Item name="description" style={{ margin: 0 }}>
              <TextArea placeholder="请输入说明" rows={1} />
            </Form.Item>
          );
        }
        return text || '-';
      },
    },
    {
      title: '操作',
      width: 180,
      align: 'center',
      fixed: 'right',
      render: (_: any, record: SchemaField, index: number) => {
        const editable = isEditing(record);

        if (editable) {
          return (
            <Space size="small">
              <Button
                type="link"
                size="small"
                icon={<SaveOutlined />}
                onClick={() => save(record.id || '')}
              >
                保存
              </Button>
              <Button type="link" size="small" icon={<CloseOutlined />} onClick={cancel}>
                取消
              </Button>
            </Space>
          );
        }

        return (
          <Space size="small">
            <Tooltip title="编辑">
              <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              disabled={disabled || editingKey !== ''}
              onClick={() => edit(record, false)} // 编辑现有记录
            />
            </Tooltip>

            <Tooltip title="上移">
              <Button
              type="link"
              size="small"
              icon={<ArrowUpOutlined />}
              disabled={disabled || index === 0 || editingKey !== ''}
              onClick={() => handleMoveUp(index)}
              />
            </Tooltip>

            <Tooltip title="下移">
              <Button
              type="link"
              size="small"
              icon={<ArrowDownOutlined />}
              disabled={disabled || index === fields.length - 1 || editingKey !== ''}
              onClick={() => handleMoveDown(index)}
              />
            </Tooltip>
            <Popconfirm
              title="确定要删除这个字段吗？"
              onConfirm={() => handleDelete(record.id || '')}
              okText="确定"
              cancelText="取消"
            >
              <Tooltip title="删除">
                <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                disabled={disabled || editingKey !== ''}
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          共 {fields.length} 个字段配置
        </div>
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          disabled={disabled || editingKey !== ''}
        >
          添加字段
        </Button>
      </div>

      <Form form={form} component={false}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={fields}
          pagination={false}
          size="small"
          scroll={{ x: 1300, y: 'calc(100vh - 500px)' }}
          bordered
        />
      </Form>

      {/* 组件配置弹窗 */}
      <ComponentConfigModal
        open={configModalVisible}
        onCancel={() => setConfigModalVisible(false)}
        onOk={handleSaveConfig}
        componentType={configModalData.componentType}
        currentProperties={configModalData.properties}
      />
    </div>
  );
};

// 使用 React.memo 进行深度比较优化
export default React.memo(SchemaFieldsTable, (prevProps, nextProps) => {
  // 只在 fields 引用、disabled 状态或 onChange 回调真正改变时才重新渲染
  return (
    prevProps.fields === nextProps.fields &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.onChange === nextProps.onChange
  );
});

