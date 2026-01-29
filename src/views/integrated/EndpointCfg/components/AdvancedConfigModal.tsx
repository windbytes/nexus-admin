import { CodeEditor } from '@/components/CodeEditor';
import DragModal from '@/components/modal/DragModal';
import { DeleteOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { App, Button, Card, Form, Input, Radio, Select, Space, Switch, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';

/**
 * Ant Design Form 支持的验证类型
 */
const VALIDATION_TYPES = [
  { value: 'string', label: 'string - 字符串' },
  { value: 'number', label: 'number - 数字' },
  { value: 'boolean', label: 'boolean - 布尔值' },
  { value: 'integer', label: 'integer - 整数' },
  { value: 'float', label: 'float - 浮点数' },
  { value: 'email', label: 'email - 邮箱' },
  { value: 'url', label: 'url - 网址' },
  { value: 'date', label: 'date - 日期' },
  { value: 'array', label: 'array - 数组' },
  { value: 'object', label: 'object - 对象' },
  { value: 'enum', label: 'enum - 枚举' },
  { value: 'method', label: 'method - 函数' },
  { value: 'regexp', label: 'regexp - 正则表达式' },
  { value: 'hex', label: 'hex - 十六进制' },
];

interface RuleItem {
  type?: string;
  message?: string;
  required?: boolean;
  pattern?: string;
  min?: number;
  max?: number;
  len?: number;
  validator?: string;
  [key: string]: any;
}

interface AdvancedConfigModalProps {
  /** 是否显示弹窗 */
  open: boolean;
  /** 取消回调 */
  onCancel: () => void;
  /** 确认回调 */
  onOk: (config: { rules?: string; showCondition?: string }) => void;
  /** 当前验证规则（JSON字符串） */
  currentRules?: string;
  /** 当前显示条件（JS表达式） */
  currentShowCondition?: string;
  /** 字段名称（用于提示） */
  fieldLabel?: string;
}

/**
 * 高级配置弹窗组件
 * 用于配置字段的验证规则和显示条件
 */
const AdvancedConfigModal: React.FC<AdvancedConfigModalProps> = ({
  open,
  onCancel,
  onOk,
  currentRules = '',
  currentShowCondition = '',
  fieldLabel = '字段',
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [rulesMode, setRulesMode] = useState<'visual' | 'json'>('visual');
  const [rulesJson, setRulesJson] = useState<string>('');
  const [visualRules, setVisualRules] = useState<RuleItem[]>([]);
  const [conditionType, setConditionType] = useState<'expression' | 'function'>('expression');

  useEffect(() => {
    if (open) {
      // 初始化显示条件
      const showConditionValue = currentShowCondition || '';
      form.setFieldsValue({
        showCondition: showConditionValue,
      });

      // 判断显示条件类型（表达式还是函数）
      if (showConditionValue.trim()) {
        const trimmed = showConditionValue.trim();
        // 检测是否为函数格式
        if (trimmed.startsWith('function') || trimmed.startsWith('(') && trimmed.includes('=>')) {
          setConditionType('function');
        } else {
          setConditionType('expression');
        }
      } else {
        setConditionType('expression');
      }

      // 初始化验证规则
      if (currentRules) {
        setRulesJson(currentRules);
        try {
          const parsed = JSON.parse(currentRules);
          if (Array.isArray(parsed)) {
            setVisualRules(parsed);
            setRulesMode('visual');
          } else {
            setRulesMode('json');
          }
        } catch {
          setRulesMode('json');
        }
      } else {
        setRulesJson('');
        setVisualRules([]);
        setRulesMode('visual');
      }
    }
  }, [open, currentRules, currentShowCondition, form]);

  /**
   * 添加验证规则
   */
  const handleAddRule = () => {
    setVisualRules([...visualRules, { type: 'string', message: '', required: false }]);
  };

  /**
   * 删除验证规则
   */
  const handleDeleteRule = (index: number) => {
    const newRules = visualRules.filter((_, i) => i !== index);
    setVisualRules(newRules);
  };

  /**
   * 更新验证规则
   */
  const handleUpdateRule = (index: number, field: string, value: any) => {
    const newRules = [...visualRules];
    newRules[index] = { ...newRules[index], [field]: value };
    setVisualRules(newRules);
  };

  /**
   * 切换到JSON模式
   */
  const handleSwitchToJson = () => {
    try {
      const jsonStr = JSON.stringify(visualRules, null, 2);
      setRulesJson(jsonStr);
      setRulesMode('json');
    } catch (error: any) {
      message.error('转换失败：' + error.message);
    }
  };

  /**
   * 切换到可视化模式
   */
  const handleSwitchToVisual = () => {
    try {
      if (rulesJson.trim()) {
        const parsed = JSON.parse(rulesJson);
        if (Array.isArray(parsed)) {
          setVisualRules(parsed);
          setRulesMode('visual');
        } else {
          message.error('验证规则必须是数组格式');
        }
      } else {
        setVisualRules([]);
        setRulesMode('visual');
      }
    } catch (error: any) {
      message.error('JSON格式错误：' + error.message);
    }
  };

  /**
   * 验证验证规则的完整性
   */
  const validateRules = (rules: RuleItem[]): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    rules.forEach((rule, index) => {
      const ruleNum = index + 1;
      
      // 1. 必须有错误提示信息
      if (!rule.message || !rule.message.trim()) {
        errors.push(`规则${ruleNum}：缺少错误提示信息（message字段为必填项）`);
      }
      
      // 2. 如果配置了min/max，验证其有效性
      if (rule.min !== undefined && rule.max !== undefined) {
        if (rule.min > rule.max) {
          errors.push(`规则${ruleNum}：最小值(${rule.min})不能大于最大值(${rule.max})`);
        }
      }
      
      // 3. 如果配置了正则表达式，验证其有效性
      if (rule.pattern && rule.pattern.trim()) {
        try {
          new RegExp(rule.pattern);
        } catch (e) {
          errors.push(`规则${ruleNum}：正则表达式格式错误 - ${rule.pattern}`);
        }
      }
      
      // 4. 如果type是enum，应该配置enum数组（虽然在当前界面没有配置项，但可以通过JSON配置）
      if (rule.type === 'enum' && !rule['enum']) {
        errors.push(`规则${ruleNum}：验证类型为enum时，需要配置enum数组`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  };

  /**
   * 验证显示条件的有效性
   */
  const validateShowCondition = (condition: string): { valid: boolean; error?: string } => {
    if (!condition || !condition.trim()) {
      return { valid: true };
    }
    
    const trimmed = condition.trim();
    
    // 1. 检查危险代码
    if (trimmed.includes('eval(') || trimmed.includes('Function(')) {
      return { valid: false, error: '显示条件中不允许使用 eval 或 Function' };
    }
    
    // 2. 如果是函数模式，验证基本格式
    if (conditionType === 'function') {
      const isFunctionFormat = trimmed.startsWith('function') || 
                              (trimmed.startsWith('(') && trimmed.includes('=>'));
      
      if (!isFunctionFormat) {
        return { 
          valid: false, 
          error: '函数模式下，应使用 function(formValues) {...} 或 (formValues) => {...} 格式' 
        };
      }
      
      // 验证是否有返回语句
      if (!trimmed.includes('return')) {
        return { 
          valid: false, 
          error: '函数必须包含 return 语句以返回布尔值' 
        };
      }
    }
    
    return { valid: true };
  };

  /**
   * 验证并保存配置
   */
  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      // 处理验证规则
      let rulesStr = '';
      let rulesToValidate: RuleItem[] = [];
      
      if (rulesMode === 'json') {
        // JSON模式：验证JSON格式和内容
        if (rulesJson.trim()) {
          try {
            const parsed = JSON.parse(rulesJson);
            
            // 验证是否为数组
            if (!Array.isArray(parsed)) {
              message.error('验证规则必须是数组格式');
              return;
            }
            
            rulesToValidate = parsed;
            rulesStr = rulesJson.trim();
          } catch (error: any) {
            message.error('JSON格式错误：' + error.message);
            return;
          }
        }
      } else {
        // 可视化模式：验证并转换
        if (visualRules.length > 0) {
          // 过滤掉完全空的规则（没有任何有效配置的）
          const nonEmptyRules = visualRules.filter(rule => 
            rule.message || rule.type || rule.required || 
            rule.min !== undefined || rule.max !== undefined || rule.pattern
          );
          
          if (nonEmptyRules.length > 0) {
            rulesToValidate = nonEmptyRules;
            rulesStr = JSON.stringify(nonEmptyRules);
          }
        }
      }

      // 如果有验证规则，进行详细验证
      if (rulesToValidate.length > 0) {
        const { valid, errors } = validateRules(rulesToValidate);
        if (!valid) {
          message.error({
            content: (
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>验证规则配置错误：</div>
                {errors.map((err, idx) => (
                  <div key={idx} style={{ marginLeft: '8px', fontSize: '12px' }}>• {err}</div>
                ))}
              </div>
            ),
            duration: 5,
          });
          return;
        }
      }

      // 验证显示条件
      const showCondition = values.showCondition?.trim() || '';
      if (showCondition) {
        const { valid, error } = validateShowCondition(showCondition);
        if (!valid) {
          message.error(`显示条件配置错误：${error}`);
          return;
        }
      }

      // 所有验证通过，保存配置
      onOk({
        rules: rulesStr,
        showCondition,
      });

      // 重置状态
      form.resetFields();
      setVisualRules([]);
      setRulesJson('');
      setConditionType('expression');
    } catch (error: any) {
      if (error.errorFields) {
        message.error('请检查表单填写');
      } else {
        message.error('配置验证失败：' + error.message);
      }
    }
  };

  /**
   * 取消操作
   */
  const handleCancel = () => {
    form.resetFields();
    setVisualRules([]);
    setRulesJson('');
    setConditionType('expression');
    onCancel();
  };

  /**
   * 获取显示条件占位符
   */
  const getConditionPlaceholder = () => {
    if (conditionType === 'expression') {
      return 'formValues.type === "database" && formValues.protocol === "mysql"';
    }
    return `function(formValues) {
  // 在这里编写判断逻辑
  return formValues.type === "custom";
}`;
  };

  /**
   * 获取显示条件高度
   */
  const getConditionHeight = () => {
    return conditionType === 'expression' ? '100px' : '200px';
  };

  return (
    <DragModal
      centered
      title={`高级配置 - ${fieldLabel}`}
      open={open}
      onCancel={handleCancel}
      onOk={handleOk}
      width={800}
      styles={{
        body: {
          maxHeight: '70vh',
          overflowY: 'auto',
        },
      }}
    >
      <div className="flex flex-col gap-4">
        {/* 验证规则配置 */}
        <Card
          title={
            <Space>
              <span>验证规则</span>
              {rulesMode === 'json' && (
                <Tooltip
                  title={
                    <div style={{ fontSize: '12px' }}>
                      <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>JSON格式示例：</div>
                      <pre style={{ margin: 0, fontSize: '11px', lineHeight: '1.4' }}>
                        {`[
  {
    "required": true,
    "message": "此字段为必填项"
  },
  {
    "type": "string",
    "min": 3,
    "max": 20,
    "message": "请输入3-20个字符"
  },
  {
    "type": "email",
    "message": "请输入有效的邮箱地址"
  },
  {
    "type": "url",
    "message": "请输入有效的网址"
  },
  {
    "pattern": "^[a-zA-Z0-9]+$",
    "message": "只能包含字母和数字"
  }
]`}
                      </pre>
                    </div>
                  }
                  styles={{
                    root: {
                      maxWidth: '400px',
                    },
                  }}
                >
                  <QuestionCircleOutlined style={{ color: '#1890ff', cursor: 'help' }} />
                </Tooltip>
              )}
            </Space>
          }
          size="small"
          extra={
            <Space>
              {rulesMode === 'visual' ? (
                <Button size="small" onClick={handleSwitchToJson}>
                  切换到JSON模式
                </Button>
              ) : (
                <Button size="small" onClick={handleSwitchToVisual}>
                  切换到可视化模式
                </Button>
              )}
            </Space>
          }
        >
          {rulesMode === 'visual' ? (
            <div className="space-y-2">
              <div className="text-sm text-gray-500 mb-2">
                配置Ant Design Form的验证规则。支持配置：是否必填、验证类型、错误提示、长度限制、正则表达式等。（
                <a
                  href="https://ant.design/components/form-cn#rule"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  查看文档
                </a>
                ）
              </div>
              {visualRules.map((rule, index) => (
                <Card key={index} size="small" className="mb-4!">
                  <div className="flex gap-4 items-start">
                    <div className="flex-1 flex flex-col gap-3">
                      {/* 是否必填 */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium w-24 text-right">是否必填：</span>
                        <Switch
                          checked={rule.required || false}
                          onChange={(checked) => handleUpdateRule(index, 'required', checked)}
                        />
                        <span className="text-xs text-gray-400">
                          {rule.required ? '必填项' : '非必填'}
                        </span>
                      </div>

                      {/* 验证类型 */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium w-24 text-right">验证类型：</span>
                        <Select
                          className="flex-1"
                          placeholder="请选择验证类型"
                          value={rule.type || undefined}
                          onChange={(value) => handleUpdateRule(index, 'type', value)}
                          options={VALIDATION_TYPES}
                          allowClear
                          showSearch
                          filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                          }
                        />
                      </div>

                      {/* 错误提示 */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium w-24 text-right">
                          <span className="text-red-500">*</span> 错误提示：
                        </span>
                        <Input
                          className="flex-1"
                          placeholder="请输入验证失败时的错误提示信息"
                          value={rule.message}
                          onChange={(e) => handleUpdateRule(index, 'message', e.target.value)}
                        />
                      </div>

                      {/* 长度/值范围 */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium w-24 text-right">长度范围：</span>
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <Space.Compact className="w-full">
                            <Space.Addon>≥</Space.Addon>
                            <Input
                              placeholder="最小值 (min)"
                              type="number"
                              value={rule.min}
                              onChange={(e) => handleUpdateRule(index, 'min', e.target.value ? Number(e.target.value) : undefined)}
                            />
                          </Space.Compact>
                          <Space.Compact>
                            <Space.Addon>≤</Space.Addon>
                              <Input
                                placeholder="最大值 (max)"
                                type="number"
                                value={rule.max}
                                onChange={(e) => handleUpdateRule(index, 'max', e.target.value ? Number(e.target.value) : undefined)}
                              />
                          </Space.Compact>
                        </div>
                      </div>

                      {/* 正则表达式 */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium w-24 text-right">正则表达式：</span>
                        <Space.Compact className="flex-1">
                          <Space.Addon>/</Space.Addon>
                          <Input
                            placeholder="如: ^[a-zA-Z0-9]+$"
                            value={rule.pattern}
                            onChange={(e) => handleUpdateRule(index, 'pattern', e.target.value)}
                          />
                          <Space.Addon>/</Space.Addon>
                        </Space.Compact>
                      </div>
                    </div>
                    <Button
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteRule(index)}
                      title="删除此规则"
                    />
                  </div>
                </Card>
              ))}
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleAddRule}
                block
                size="small"
              >
                添加验证规则
              </Button>
            </div>
          ) : (
            <div>
              <div className="text-sm text-gray-500 mb-2">
                请输入JSON格式的验证规则数组（
                <a
                  href="https://ant.design/components/form-cn#rule"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ant Design Form Rule[]
                </a>
                ）
              </div>
              <CodeEditor
                value={rulesJson}
                onChange={(value) => setRulesJson(value || '')}
                language="json"
                height="300px"
                theme="vs"
                showMinimap={false}
                fontSize={13}
              />
            </div>
          )}
        </Card>

        {/* 显示条件配置 */}
        <Card
          title="显示条件"
          size="small"
          extra={
            <Radio.Group
              size="small"
              value={conditionType}
              onChange={(e) => setConditionType(e.target.value)}
            >
              <Radio.Button value="expression">表达式</Radio.Button>
              <Radio.Button value="function">函数</Radio.Button>
            </Radio.Group>
          }
        >
          <div className="text-sm text-gray-500 mb-2">
            {conditionType === 'expression' ? (
              <>
                输入JavaScript表达式，用于控制字段显示。可以使用<code>formValues</code>对象访问表单值。
              </>
            ) : (
              <>
                输入返回<code>boolean</code>的函数，用于控制字段显示。参数<code>formValues</code>为表单值对象。
              </>
            )}
          </div>
          <Form form={form}>
            <Form.Item
              name="showCondition"
              rules={[
                {
                  validator: (_, value) => {
                    if (!value || !value.trim()) {
                      return Promise.resolve();
                    }
                    // 简单验证是否包含危险代码
                    if (value.includes('eval(') || value.includes('Function(')) {
                      return Promise.reject(new Error('不允许使用eval或Function'));
                    }
                    // 如果是函数模式，验证基本语法
                    if (conditionType === 'function') {
                      const trimmed = value.trim();
                      if (!trimmed.startsWith('function') && !(trimmed.startsWith('(') && trimmed.includes('=>'))) {
                        return Promise.reject(new Error('函数格式不正确，应为 function(formValues) {...} 或 (formValues) => {...}'));
                      }
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <CodeEditor
                language="javascript"
                height={getConditionHeight()}
                theme="vs"
                showMinimap={false}
                fontSize={13}
                showLineNumbers={conditionType === 'function'}
                placeholder={getConditionPlaceholder()}
              />
            </Form.Item>
          </Form>
          <div className="text-xs text-gray-400 mt-2">
            {conditionType === 'expression' ? (
              <>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>常用示例：</div>
                <div>• <code>formValues.fieldName === 'someValue'</code> - 当某字段等于特定值时显示</div>
                <div>• <code>formValues.enabled === true</code> - 当某开关打开时显示</div>
                <div>• <code>formValues.type === 'A' || formValues.type === 'B'</code> - 多条件判断</div>
              </>
            ) : (
              <>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>函数示例：</div>
                <pre style={{ margin: 0, padding: '8px', background: '#f5f5f5', borderRadius: '4px', fontSize: '11px' }}>
                  {`// 标准函数
function(formValues) {
  return formValues.type === 'database' && formValues.enabled;
}

// 箭头函数
(formValues) => {
  const isValid = formValues.count > 10;
  return isValid && formValues.status === 'active';
}`}
                </pre>
              </>
            )}
          </div>
        </Card>
      </div>
    </DragModal>
  );
};

export default AdvancedConfigModal;

