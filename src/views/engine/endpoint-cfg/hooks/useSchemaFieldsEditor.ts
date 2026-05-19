import { Form } from 'antd';
import { useEffectEvent, useImperativeHandle, useRef, useState } from 'react';
import type { SchemaField } from '@/services/engine';
import type { SchemaFieldsTableRef } from '../components/SchemaFieldsTable';

type ComponentConfigData = {
  componentType: string;
  properties: Record<string, unknown>;
  fieldId: string;
};

type AdvancedConfigData = {
  fieldId: string;
  fieldLabel: string;
  rules?: string;
  showCondition?: string;
};

type UseSchemaFieldsEditorParams = {
  /** 当前表格字段列表（由父组件托管） */
  fields: SchemaField[];
  /** 字段变更回调（向父组件回传最新字段） */
  onChange: (fields: SchemaField[]) => void;
  /** 对外暴露的表格能力引用 */
  ref?: React.Ref<SchemaFieldsTableRef>;
};

/**
 * Schema 字段编辑器 Hook。
 *
 * 职责：
 * - 管理表格行编辑状态与弹窗状态
 * - 提供新增/编辑/删除/排序等行为
 * - 向父组件暴露 imperative API（保存当前编辑、获取最新字段等）
 */
export function useSchemaFieldsEditor({ fields, onChange, ref }: UseSchemaFieldsEditorParams) {
  const [editingKey, setEditingKey] = useState<string>('');
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [form] = Form.useForm();
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [configModalData, setConfigModalData] = useState<ComponentConfigData>({
    componentType: '',
    properties: {},
    fieldId: '',
  });

  const [advancedModalVisible, setAdvancedModalVisible] = useState(false);
  const [advancedModalData, setAdvancedModalData] = useState<AdvancedConfigData>({
    fieldId: '',
    fieldLabel: '',
  });

  /** 判断当前记录是否处于编辑态。 */
  const isEditing = (record: SchemaField) => record.id === editingKey;

  /** 进入行编辑态；isNew 用于区分新增行与已有行。 */
  const edit = (record: SchemaField, isNew = false) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.id || '');
    setIsNewRecord(isNew);
  };

  /** 取消当前行编辑；若为新增未保存行则直接移除。 */
  const cancel = useEffectEvent(() => {
    if (isNewRecord) {
      onChange(fields.filter((item) => item.id !== editingKey));
    }
    setEditingKey('');
    setIsNewRecord(false);
  });

  /** 保存当前正在编辑的行，并同步回父组件。 */
  const saveCurrentEdit = useEffectEvent(async (): Promise<boolean> => {
    if (!editingKey) {
      return true;
    }
    try {
      const row = await form.validateFields();
      const next = [...fields];
      const index = next.findIndex((item) => editingKey === item.id);
      if (index < 0 || !next[index]) {
        return false;
      }
      const current = next[index];
      const nextId = isNewRecord ? `field_${Date.now()}` : current.id;
      next.splice(index, 1, { ...current, ...row, id: nextId });
      onChange(next);
      setEditingKey('');
      setIsNewRecord(false);
      return true;
    } catch {
      return false;
    }
  });

  /** 获取“最新字段数据快照”；若有行在编辑，会先做一次校验并合并结果。 */
  const getCurrentFields = useEffectEvent(async (): Promise<SchemaField[] | null> => {
    if (!editingKey) {
      return fields;
    }
    try {
      const row = await form.validateFields();
      const next = [...fields];
      const index = next.findIndex((item) => editingKey === item.id);
      if (index < 0 || !next[index]) {
        return null;
      }
      const current = next[index];
      const nextId = isNewRecord ? `field_${Date.now()}` : current.id;
      next.splice(index, 1, { ...current, ...row, id: nextId });
      return next;
    } catch {
      return null;
    }
  });

  /** 暴露给父组件的 imperative 能力。 */
  useImperativeHandle(ref, () => ({
    cancelEdit: cancel,
    saveCurrentEdit,
    isEditing: () => !!editingKey,
    getCurrentFields,
  }));

  /** 保存指定行（表格内行操作“保存”按钮使用）。 */
  const saveRow = useEffectEvent(async (id: string) => {
    try {
      const row = await form.validateFields();
      const next = [...fields];
      const index = next.findIndex((item) => id === item.id);
      if (index < 0 || !next[index]) {
        return;
      }
      const current = next[index];
      const nextId = isNewRecord ? `field_${Date.now()}` : current.id;
      next.splice(index, 1, { ...current, ...row, id: nextId });
      onChange(next);
      setEditingKey('');
      setIsNewRecord(false);
    } catch {
      // ignore row validation error
    }
  });

  /** 滚动到指定行，用于新增后自动定位。 */
  const scrollToRow = (rowId: string) => {
    setTimeout(() => {
      const rowElement = tableContainerRef.current?.querySelector(`tr[data-row-key="${rowId}"]`);
      rowElement?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }, 150);
  };

  /** 新增字段并进入编辑态。 */
  const handleAdd = useEffectEvent(() => {
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
    setTimeout(() => {
      edit(newField, true);
      scrollToRow(newField.id || '');
    }, 100);
  });

  /** 删除指定字段。 */
  const handleDelete = useEffectEvent((id: string) => {
    onChange(fields.filter((item) => item.id !== id));
  });

  /** 上移字段并重排 sortOrder。 */
  const handleMoveUp = useEffectEvent((index: number) => {
    if (index === 0) {
      return;
    }
    const next = [...fields];
    const prevItem = next[index - 1];
    const currentItem = next[index];
    if (!(prevItem && currentItem)) {
      return;
    }
    [next[index - 1], next[index]] = [currentItem, prevItem];
    next.forEach((item, idx) => {
      item.sortOrder = idx + 1;
    });
    onChange(next);
  });

  /** 下移字段并重排 sortOrder。 */
  const handleMoveDown = useEffectEvent((index: number) => {
    if (index === fields.length - 1) {
      return;
    }
    const next = [...fields];
    const currentItem = next[index];
    const nextItem = next[index + 1];
    if (!(currentItem && nextItem)) {
      return;
    }
    [next[index], next[index + 1]] = [nextItem, currentItem];
    next.forEach((item, idx) => {
      item.sortOrder = idx + 1;
    });
    onChange(next);
  });

  /** 打开“组件属性配置”弹窗。 */
  const handleOpenConfig = (record: SchemaField) => {
    const formValues = record.id === editingKey ? form.getFieldsValue() : {};
    setConfigModalData({
      componentType: (formValues.component as string) || record.component,
      properties: (record.properties as Record<string, unknown>) || {},
      fieldId: record.id || '',
    });
    setConfigModalVisible(true);
  };

  /** 保存“组件属性配置”弹窗数据。 */
  const handleSaveConfig = useEffectEvent((properties: Record<string, unknown>) => {
    onChange(fields.map((field) => (field.id === configModalData.fieldId ? { ...field, properties } : field)));
  });

  /** 打开“高级配置（规则/显示条件）”弹窗。 */
  const handleOpenAdvancedConfig = (record: SchemaField) => {
    const formValues = record.id === editingKey ? form.getFieldsValue() : {};
    setAdvancedModalData({
      fieldId: record.id || '',
      fieldLabel: (formValues.label as string) || record.label || '字段',
      ...(record.rules ? { rules: record.rules } : {}),
      ...(record.showCondition ? { showCondition: record.showCondition } : {}),
    });
    setAdvancedModalVisible(true);
  };

  /** 保存高级配置并回写对应字段。 */
  const handleSaveAdvancedConfig = useEffectEvent((config: { rules?: string; showCondition?: string }) => {
    onChange(
      fields.map((field) => {
        if (field.id !== advancedModalData.fieldId) {
          return field;
        }
        const nextField: SchemaField = { ...field };
        if (config.rules) {
          nextField.rules = config.rules;
        } else {
          delete nextField.rules;
        }
        if (config.showCondition) {
          nextField.showCondition = config.showCondition;
        } else {
          delete nextField.showCondition;
        }
        return nextField;
      })
    );
    setAdvancedModalVisible(false);
  });

  return {
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
  };
}
