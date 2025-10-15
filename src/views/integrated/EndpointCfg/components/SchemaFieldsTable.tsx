import React, { useState, useCallback, useImperativeHandle, lazy } from 'react';
import { Table, Button, Input, Select, Popconfirm, Space, Form, Tooltip, type TableProps } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, SaveOutlined, CloseOutlined, ArrowUpOutlined, ArrowDownOutlined, SettingOutlined, ToolOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import type { SchemaField } from '@/services/integrated/endpointConfig/endpointConfigApi';
import { COMPONENT_TYPE_OPTIONS, MODE_OPTIONS } from '@/services/integrated/endpointConfig/endpointConfigApi';

const ComponentConfigModal = lazy(() => import('./ComponentConfigModal'));
const AdvancedConfigModal = lazy(() => import('./AdvancedConfigModal'));


const { TextArea } = Input;

export interface SchemaFieldsTableRef {
  /** 取消编辑 */
  cancelEdit: () => void;
  /** 保存当前编辑的行（如果有） */
  saveCurrentEdit: () => Promise<boolean>;
  /** 检查是否有行正在编辑 */
  isEditing: () => boolean;
  /** 获取当前最新的字段数据（包括正在编辑的行） */
  getCurrentFields: () => Promise<SchemaField[] | null>;
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
  
  // 表格容器的 ref，用于滚动操作
  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  // 组件配置弹窗状态
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [configModalData, setConfigModalData] = useState<{
    componentType: string;
    properties: any;
    fieldId: string;
  }>({ componentType: '', properties: {}, fieldId: '' });

  // 高级配置弹窗状态
  const [advancedModalVisible, setAdvancedModalVisible] = useState(false);
  const [advancedModalData, setAdvancedModalData] = useState<{
    fieldId: string;
    fieldLabel: string;
    rules?: string;
    showCondition?: string;
  }>({ fieldId: '', fieldLabel: '' });

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
   * 保存当前正在编辑的行
   * 返回是否保存成功
   */
  const saveCurrentEdit = useCallback(async (): Promise<boolean> => {
    if (!editingKey) {
      return true; // 没有正在编辑的行，返回成功
    }
    
    try {
      const row = await form.validateFields();
      const newData = [...fields];
      const index = newData.findIndex((item) => editingKey === item.id);

      if (index > -1) {
        const item = newData[index];
        if (item) {
          // 如果是新增记录，生成新的ID
          const newId = isNewRecord ? `field_${Date.now()}` : item.id;
          newData.splice(index, 1, { ...item, ...row, id: newId });
          onChange(newData);
          setEditingKey('');
          setIsNewRecord(false);
          return true;
        }
      }
      return false;
    } catch (errInfo) {
      console.log('表格行验证失败:', errInfo);
      return false;
    }
  }, [editingKey, isNewRecord, form, fields, onChange]);

  /**
   * 检查是否有行正在编辑
   */
  const checkIsEditing = useCallback((): boolean => {
    return !!editingKey;
  }, [editingKey]);

  /**
   * 获取当前最新的字段数据（包括正在编辑的行）
   * 如果有行正在编辑，会先验证并合并编辑的数据
   * 返回 null 表示验证失败
   */
  const getCurrentFields = useCallback(async (): Promise<SchemaField[] | null> => {
    // 如果没有正在编辑的行，直接返回当前字段数据
    if (!editingKey) {
      return fields;
    }

    // 如果有正在编辑的行，先验证表单
    try {
      const row = await form.validateFields();
      const newData = [...fields];
      const index = newData.findIndex((item) => editingKey === item.id);

      if (index > -1) {
        const item = newData[index];
        if (item) {
          // 如果是新增记录，生成新的ID
          const newId = isNewRecord ? `field_${Date.now()}` : item.id;
          // 返回合并后的数据（不修改状态）
          newData.splice(index, 1, { ...item, ...row, id: newId });
          return newData;
        }
      }
      return null;
    } catch (errInfo) {
      console.log('表格行验证失败:', errInfo);
      return null; // 验证失败返回 null
    }
  }, [editingKey, isNewRecord, form, fields]);

  /**
   * 暴露给父组件的方法
   * React 19 支持直接使用 useImperativeHandle
   */
  useImperativeHandle(ref, () => ({
    cancelEdit: cancel,
    saveCurrentEdit,
    isEditing: checkIsEditing,
    getCurrentFields,
  }), [cancel, saveCurrentEdit, checkIsEditing, getCurrentFields]);

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
   * 滚动到指定的表格行
   */
  const scrollToRow = useCallback((rowId: string) => {
    // 等待 DOM 更新后再滚动
    setTimeout(() => {
      try {
        // 查找新增的行元素
        const tableContainer = tableContainerRef.current;
        if (!tableContainer) return;

        // 找到对应的 tr 元素（使用 data-row-key 属性）
        const rowElement = tableContainer.querySelector(`tr[data-row-key="${rowId}"]`);
        
        if (rowElement) {
          // 使用 scrollIntoView 滚动到该行
          rowElement.scrollIntoView({
            behavior: 'smooth',  // 平滑滚动
            block: 'center',     // 滚动到视口中央
            inline: 'nearest'    // 水平方向最近位置
          });
        }
      } catch (error) {
        console.warn('滚动到新增行失败:', error);
      }
    }, 150); // 延迟等待表格渲染和编辑状态生效
  }, []);

  /**
   * 新增字段
   */
  const handleAdd = useCallback(() => {
    const newField: SchemaField = {
      id: `field_${Date.now()}`,
      field: '',
      label: '',
      component: 'Input',
      sortOrder: fields.length + 1,
      mode: ['IN_OUT'],
      properties: {},
    };
    onChange([...fields, newField]);
    
    // 进入编辑模式并滚动到新增的行
    setTimeout(() => {
      edit(newField, true); // 标记为新增记录
      scrollToRow(newField.id || ''); // 滚动到新增的行
    }, 100);
  }, [fields, onChange, scrollToRow]);

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
    // 直接判断 record.id === editingKey，避免闭包问题
    if (record.id === editingKey) {
      const formValues = form.getFieldsValue();
      componentType = formValues.component || record.component;
    }

    setConfigModalData({
      componentType,
      properties: record.properties || {},
      fieldId: record.id || '',
    });
    setConfigModalVisible(true);
  }, [form, editingKey]);

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
   * 打开高级配置弹窗
   */
  const handleOpenAdvancedConfig = useCallback((record: SchemaField) => {
    // 如果正在编辑，从表单获取最新的label
    let fieldLabel = record.label;
    if (record.id === editingKey) {
      const formValues = form.getFieldsValue();
      fieldLabel = formValues.label || record.label;
    }

    const modalData: {
      fieldId: string;
      fieldLabel: string;
      rules?: string;
      showCondition?: string;
    } = {
      fieldId: record.id || '',
      fieldLabel: fieldLabel || '字段',
    };

    if (record.rules) {
      modalData.rules = record.rules;
    }
    if (record.showCondition) {
      modalData.showCondition = record.showCondition;
    }

    setAdvancedModalData(modalData);
    setAdvancedModalVisible(true);
  }, [form, editingKey]);

  /**
   * 保存高级配置
   */
  const handleSaveAdvancedConfig = useCallback((config: { rules?: string; showCondition?: string }) => {
    const newData = fields.map(field => {
      if (field.id === advancedModalData.fieldId) {
        const updatedField: SchemaField = { ...field };
        if (config.rules) {
          updatedField.rules = config.rules;
        } else {
          delete updatedField.rules;
        }
        if (config.showCondition) {
          updatedField.showCondition = config.showCondition;
        } else {
          delete updatedField.showCondition;
        }
        return updatedField;
      }
      return field;
    });
    onChange(newData);
    setAdvancedModalVisible(false);
  }, [fields, onChange, advancedModalData.fieldId]);

  /**
   * 表格列配置 - 使用 useMemo 优化，避免每次渲染都重新创建
   */
  const columns: TableProps<SchemaField>['columns'] = React.useMemo(() => [
    {
      title: '序号',
      width: 60,
      align: 'center',
      render: (_: any, __: SchemaField, index: number) => index + 1,
    },
    {
      title: '字段',
      dataIndex: 'field',
      width: 120,
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
      title: '标签',
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
      title: '组件属性',
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
      title: '验证与显示',
      width: 100,
      align: 'center',
      render: (_: any, record: SchemaField) => {
        const hasRules = record.rules && record.rules.trim().length > 0;
        const hasCondition = record.showCondition && record.showCondition.trim().length > 0;
        const hasAdvancedConfig = hasRules || hasCondition;

        let tooltipTitle = '配置验证规则和显示条件';
        if (hasRules && hasCondition) {
          tooltipTitle = '已配置验证规则和显示条件';
        } else if (hasRules) {
          tooltipTitle = '已配置验证规则';
        } else if (hasCondition) {
          tooltipTitle = '已配置显示条件';
        }

        return (
          <Tooltip title={tooltipTitle}>
            <Button
              type="link"
              size="small"
              icon={<ToolOutlined />}
              disabled={(!isEditing(record))}
              onClick={() => handleOpenAdvancedConfig(record)}
              style={{
                color: hasAdvancedConfig ? '#52c41a' : '#999',
                fontWeight: hasAdvancedConfig ? 'bold' : 'normal'
              }}
            >
              {hasAdvancedConfig ? '已配置' : '配置'}
            </Button>
          </Tooltip>
        );
      },
    },
    {
      title: (<div>作用模式<Tooltip title={<span>• IN、IN_OUT用于暴露入口给其他地方调用 <br /> • OUT、OUT_IN用于调用其他地方的入口</span>}><QuestionCircleOutlined className='ml-1 cursor-help' /></Tooltip></div>),
      dataIndex: 'mode',
      width: 120,
      render: (text: string[], record: SchemaField) => {
        if (isEditing(record)) {
          return (
            <Form.Item name="mode" style={{ margin: 0 }}>
              <Select mode='multiple' options={MODE_OPTIONS as any} placeholder="请选择作用模式" />
            </Form.Item>
          );
        }
        return text.join('|') || '-';
      },
    },
    {
      title: <div>说明<Tooltip title="用于显示模块的说明信息"><QuestionCircleOutlined className='ml-1 cursor-help' /></Tooltip></div>,
      dataIndex: 'description',
      ellipsis: true,
      width: 180,
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
  ], [
    editingKey,
    disabled,
    form,
    fields.length,
    cancel,
    save,
    handleMoveUp,
    handleMoveDown,
    handleDelete,
    handleOpenConfig,
    handleOpenAdvancedConfig,
  ]);

  return (
    <div className="flex-1 flex flex-col min-h-0 gap-2 mt-4">
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

      <Form form={form} component={false} autoComplete="off">
        <div ref={tableContainerRef}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={fields}
            pagination={false}
            size="small"
            scroll={{ x: 'max-content', y: 'calc(100vh - 546px)' }}
            bordered
          />
        </div>
      </Form>

      {/* 组件配置弹窗 */}
      <ComponentConfigModal
        open={configModalVisible}
        onCancel={() => setConfigModalVisible(false)}
        onOk={handleSaveConfig}
        componentType={configModalData.componentType}
        currentProperties={configModalData.properties}
      />

      {/* 高级配置弹窗 */}
      <AdvancedConfigModal
        open={advancedModalVisible}
        onCancel={() => setAdvancedModalVisible(false)}
        onOk={handleSaveAdvancedConfig}
        {...(advancedModalData.rules && { currentRules: advancedModalData.rules })}
        {...(advancedModalData.showCondition && { currentShowCondition: advancedModalData.showCondition })}
        fieldLabel={advancedModalData.fieldLabel}
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

