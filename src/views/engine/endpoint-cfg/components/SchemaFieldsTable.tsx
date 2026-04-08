import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  SaveOutlined,
  SettingOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { Button, Form, Input, Popconfirm, Select, Skeleton, Space, Table, type TableProps, Tooltip } from 'antd';
import type { Ref } from 'react';
import { lazy, Suspense, useMemo } from 'react';
import type { SchemaField } from '@/services/engine';
import { COMPONENT_TYPE_OPTIONS, MODE_OPTIONS } from '@/services/engine';
import { useSchemaFieldsEditor } from '../hooks/useSchemaFieldsEditor';

const ComponentConfigModal = lazy(() => import('./ComponentConfigModal'));
const AdvancedConfigModal = lazy(() => import('./AdvancedConfigModal'));

const { TextArea } = Input;
type OptionItem = { value: string; label: string };

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
  /** 加载中 */
  loading?: boolean;
  /** 数据变更回调 */
  onChange: (fields: SchemaField[]) => void;
  /** ref 引用 (React 19 支持直接作为 prop) */
  ref?: Ref<SchemaFieldsTableRef>;
}

/**
 * Schema字段编辑表格组件（右下）
 * 使用 React.memo 避免不必要的重渲染
 * React 19 支持函数组件直接接收 ref prop
 */
const SchemaFieldsTableComponent: React.FC<SchemaFieldsTableProps> = ({
  fields = [],
  disabled = false,
  loading = false,
  onChange,
  ref,
}) => {
  const {
    form,
    tableContainerRef,
    editingKey,
    configModalVisible,
    configModalData,
    advancedModalVisible,
    advancedModalData,
    setConfigModalVisible,
    setAdvancedModalVisible,
    isEditing,
    edit,
    cancel,
    saveRow,
    handleAdd,
    handleDelete,
    handleMoveUp,
    handleMoveDown,
    handleOpenConfig,
    handleSaveConfig,
    handleOpenAdvancedConfig,
    handleSaveAdvancedConfig,
  } = useSchemaFieldsEditor({ fields, onChange, ref });

  /**
   * 表格列配置 - 使用 useMemo 优化，避免每次渲染都重新创建
   * 减少依赖项，只保留真正会影响列配置的关键依赖
   */
  const columns: TableProps<SchemaField>['columns'] = useMemo(
    () => [
      {
        title: '序号',
        width: 60,
        align: 'center',
        render: (_: unknown, __: SchemaField, index: number) => index + 1,
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
              <Form.Item name="label" style={{ margin: 0 }} rules={[{ required: true, message: '请输入字段标签' }]}>
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
              <Form.Item name="component" style={{ margin: 0 }} rules={[{ required: true, message: '请选择组件类型' }]}>
                <Select options={COMPONENT_TYPE_OPTIONS as unknown as OptionItem[]} placeholder="请选择组件类型" />
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
        render: (_: unknown, record: SchemaField) => {
          const hasProperties = record.properties && Object.keys(record.properties).length > 0;

          // 获取当前组件类型（编辑状态下从表单获取）
          let currentComponentType = record.component;
          if (isEditing(record)) {
            const formValues = form.getFieldsValue();
            currentComponentType = formValues.component || record.component;
          }

          const tooltipTitle = isEditing(record) ? `配置组件属性 (当前: ${currentComponentType})` : '配置组件属性';

          return (
            <Tooltip title={tooltipTitle}>
              <Button
                type="link"
                size="small"
                icon={<SettingOutlined />}
                disabled={!isEditing(record)}
                onClick={() => handleOpenConfig(record)}
                style={{
                  color: hasProperties ? '#1890ff' : '#999',
                  fontWeight: hasProperties ? 'bold' : 'normal',
                }}
              >
                {hasProperties ? '已配置' : '配置'}
              </Button>
            </Tooltip>
          );
        },
      },
      {
        title: '校验/显示',
        width: 100,
        align: 'center',
        render: (_: unknown, record: SchemaField) => {
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
                disabled={!isEditing(record)}
                onClick={() => handleOpenAdvancedConfig(record)}
                style={{
                  color: hasAdvancedConfig ? '#52c41a' : '#999',
                  fontWeight: hasAdvancedConfig ? 'bold' : 'normal',
                }}
              >
                {hasAdvancedConfig ? '已配置' : '配置'}
              </Button>
            </Tooltip>
          );
        },
      },
      {
        title: (
          <div>
            模式
            <Tooltip
              title={
                <span>
                  • IN、IN_OUT用于暴露入口给其他地方调用 <br /> • OUT、OUT_IN用于调用其他地方的入口
                </span>
              }
            >
              <QuestionCircleOutlined className="ml-1 cursor-help" />
            </Tooltip>
          </div>
        ),
        dataIndex: 'mode',
        width: 120,
        render: (text: string[], record: SchemaField) => {
          if (isEditing(record)) {
            return (
              <Form.Item name="mode" style={{ margin: 0 }}>
                <Select
                  mode="multiple"
                  options={MODE_OPTIONS as unknown as OptionItem[]}
                  placeholder="请选择作用模式"
                />
              </Form.Item>
            );
          }
          return text.join('|') || '-';
        },
      },
      {
        title: (
          <div>
            说明
            <Tooltip title="用于显示模块的说明信息">
              <QuestionCircleOutlined className="ml-1 cursor-help" />
            </Tooltip>
          </div>
        ),
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
        width: 120,
        align: 'center',
        fixed: 'right',
        render: (_: unknown, record: SchemaField, index: number) => {
          const editable = isEditing(record);

          if (editable) {
            return (
              <Space size="small">
                <Button type="link" size="small" icon={<SaveOutlined />} onClick={() => saveRow(record.id || '')}>
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
    ],
    [
      // 只保留真正影响列配置的关键依赖
      editingKey, // 影响编辑状态显示
      disabled, // 影响按钮禁用状态
    ]
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 gap-2 mt-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">共 {fields.length} 个字段配置</div>
      </div>
      <Suspense fallback={<Skeleton />}>
        <Form form={form} component={false} autoComplete="off">
          <div ref={tableContainerRef}>
            <Table
              loading={loading}
              rowKey="id"
              columns={columns}
              dataSource={fields}
              pagination={false}
              size="small"
              scroll={{ x: 'max-content', y: 'calc(100vh - 598px)' }}
              bordered
              footer={() => {
                return (
                  <Button
                    color="primary"
                    variant="dashed"
                    disabled={disabled || editingKey !== ''}
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                    style={{ width: '100%' }}
                  >
                    添加字段
                  </Button>
                );
              }}
            />
          </div>
        </Form>
      </Suspense>

      {/* 组件配置弹窗 */}
      {configModalVisible && (
        <Suspense fallback={<Skeleton active />}>
          <ComponentConfigModal
            open={configModalVisible}
            onCancel={() => setConfigModalVisible(false)}
            onOk={handleSaveConfig}
            componentType={configModalData.componentType}
            currentProperties={configModalData.properties}
          />
        </Suspense>
      )}

      {/* 高级配置弹窗 */}
      {advancedModalVisible && (
        <Suspense fallback={<Skeleton active />}>
          <AdvancedConfigModal
            open={advancedModalVisible}
            onCancel={() => setAdvancedModalVisible(false)}
            onOk={handleSaveAdvancedConfig}
            {...(advancedModalData.rules && { currentRules: advancedModalData.rules })}
            {...(advancedModalData.showCondition && { currentShowCondition: advancedModalData.showCondition })}
            fieldLabel={advancedModalData.fieldLabel}
          />
        </Suspense>
      )}
    </div>
  );
};

export default SchemaFieldsTableComponent;
