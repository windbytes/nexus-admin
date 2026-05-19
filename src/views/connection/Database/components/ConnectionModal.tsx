import { ApiOutlined } from '@ant-design/icons';
import { App, Button, Form, Input, Select, Space, Switch } from 'antd';
import type React from 'react';
import { useEffect, useState } from 'react';
import DragModal from '@/components/modal/DragModal';
import { connectionService } from '@/services/connection/database/connectionApi';
import type { ConnectionFormValues, DatabaseConnectionRecord } from '@/services/connection/database/type';
import type { DatabaseDriver } from '@/services/resource/database/driverApi';
import { emptyConnectionConfig, PASSWORD_NOT_CHANGED_PLACEHOLDER } from '../constants';
import ConnectionConfigFields from './config/ConnectionConfigFields';

export interface ConnectionModalProps {
  open: boolean;
  title: string;
  loading: boolean;
  initialRecord: DatabaseConnectionRecord | null;
  drivers: DatabaseDriver[];
  onOk: (values: ConnectionFormValues) => void;
  onCancel: () => void;
}

function recordToFormValues(record: DatabaseConnectionRecord): ConnectionFormValues {
  const base = emptyConnectionConfig();
  return {
    id: record.id,
    name: record.name,
    code: record.code,
    driverId: record.driverId,
    databaseType: record.databaseType,
    driverClass: record.driverClass,
    enabled: record.enabled,
    remark: record.remark,
    config: {
      endpoint: { ...base.endpoint, ...record.config.endpoint },
      pool: { ...base.pool, ...record.config.pool },
      extras: { ...base.extras, ...record.config.extras },
    },
  };
}

/**
 * 提交前：编辑态若密码未改则移除 password，避免覆盖为掩码或空串。
 */
function normalizeSubmitValues(values: ConnectionFormValues, isEdit: boolean): ConnectionFormValues {
  const config = structuredClone(values.config);
  const pw = config.endpoint?.password;
  if (isEdit && (pw === undefined || pw === '' || pw === PASSWORD_NOT_CHANGED_PLACEHOLDER)) {
    if (config.endpoint) {
      delete config.endpoint.password;
    }
  }
  return { ...values, config };
}

function scrollToFirstFormError(e: unknown, form: { scrollToField: (name: (string | number)[]) => void }) {
  if (e && typeof e === 'object' && 'errorFields' in e) {
    const err = e as { errorFields?: { name: (string | number)[] }[] };
    const first = err.errorFields?.[0]?.name;
    if (first) {
      form.scrollToField(first);
    }
  }
}

const ConnectionModal: React.FC<ConnectionModalProps> = ({
  open,
  title,
  loading,
  initialRecord,
  drivers,
  onOk,
  onCancel,
}) => {
    const { message } = App.useApp();
    const [form] = Form.useForm<ConnectionFormValues>();
    const [testing, setTesting] = useState(false);
    const isEdit = Boolean(initialRecord?.id);
    const databaseType = Form.useWatch('databaseType', form) as string | undefined;

    const driverOptions = drivers.map((d) => ({
      value: d.id,
      label: `${d.name}（${d.databaseType}）`,
      driver: d,
    }));

    function handleDriverChange(id: string) {
      const d = drivers.find((x) => x.id === id);
      if (!d) {
        return;
      }
      // 切换驱动时清空 config，避免跨库残留字段写入 JSON
      form.setFieldsValue({
        databaseType: d.databaseType,
        driverClass: d.driverClass,
        config: emptyConnectionConfig(),
      });
    }

    useEffect(() => {
      if (!open) {
        return;
      }
      if (initialRecord) {
        const merged = recordToFormValues(initialRecord);
        const hasPassword = Boolean(initialRecord.config?.endpoint?.password);
        form.setFieldsValue({
          ...merged,
          config: {
            ...merged.config,
            endpoint: {
              ...merged.config.endpoint,
              password: hasPassword ? PASSWORD_NOT_CHANGED_PLACEHOLDER : merged.config.endpoint?.password,
            },
          },
        });
        return;
      }
      form.resetFields();
      form.setFieldsValue({
        enabled: true,
        config: emptyConnectionConfig(),
      });
    }, [open, initialRecord, form]);

    /**
     * 校验通过后返回与「保存」一致的结构；校验失败返回 null 并滚动到错误项。
     */
    async function getNormalizedValues(): Promise<ConnectionFormValues | null> {
      try {
        const values = await form.validateFields();
        return normalizeSubmitValues(values, isEdit);
      } catch (e: unknown) {
        scrollToFirstFormError(e, form);
        return null;
      }
    }

    const handleOk = async () => {
      const normalized = await getNormalizedValues();
      if (normalized) {
        onOk(normalized);
      }
    };

    /** 试连：使用当前表单配置调用后端，不落库 */
    const handleTestConnection = async () => {
      const normalized = await getNormalizedValues();
      if (!normalized) {
        return;
      }
      setTesting(true);
      try {
        const result = await connectionService.testConnection({
          id: normalized.id,
          driverId: normalized.driverId,
          databaseType: normalized.databaseType,
          driverClass: normalized.driverClass,
          config: normalized.config,
        });
        if (result.success) {
          message.success(result.message ?? '连接可用');
        } else {
          message.warning(result.message ?? '连接失败，请检查配置或网络');
        }
      } finally {
        setTesting(false);
      }
    };

    return (
      <DragModal
        title={title}
        open={open}
        onCancel={onCancel}
        width={720}
        destroyOnHidden
        maskClosable={false}
        footer={
          <div className="flex w-full items-center justify-between gap-4">
            <Button
              type="default"
              icon={<ApiOutlined />}
              loading={testing}
              disabled={loading}
              onClick={handleTestConnection}
            >
              测试连接
            </Button>
            <Space>
              <Button onClick={onCancel} disabled={loading || testing}>
                取消
              </Button>
              <Button type="primary" loading={loading} disabled={testing} onClick={handleOk}>
                确定
              </Button>
            </Space>
          </div>
        }
      >
        <Form<ConnectionFormValues> form={form} layout="vertical" preserve={false}>
          <Form.Item name="id" hidden>
            <Input type="hidden" />
          </Form.Item>
          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
            <Form.Item label="连接名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
              <Input maxLength={128} showCount allowClear />
            </Form.Item>
            <Form.Item label="连接编码" name="code" rules={[{ required: true, message: '请输入唯一编码' }]}>
              <Input maxLength={64} showCount allowClear placeholder="字典数据源等引用此编码" />
            </Form.Item>
            <Form.Item label="驱动" name="driverId" rules={[{ required: true, message: '请选择驱动' }]}>
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="从资源-数据库驱动中选择"
                options={driverOptions}
                onChange={handleDriverChange}
              />
            </Form.Item>
            <Form.Item label="数据库类型" name="databaseType">
              <Input disabled placeholder="随驱动自动带出" />
            </Form.Item>
            <Form.Item name="driverClass" hidden>
              <Input />
            </Form.Item>
            <Form.Item label="启用" name="enabled" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label="备注" name="remark" className="md:col-span-2">
              <Input.TextArea rows={2} maxLength={500} showCount allowClear />
            </Form.Item>
          </div>
          <ConnectionConfigFields databaseType={databaseType} requirePassword={!isEdit} />
        </Form>
      </DragModal>
    );
  };

export default ConnectionModal;
